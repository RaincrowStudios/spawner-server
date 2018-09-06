const axios = require('axios')
const key = require('../keys/keys')
const addObjectToHash = require('../redis/addObjectToHash')
const addToGeohash = require('../redis/addToGeohash')
const addToActiveSet = require('../redis/addToActiveSet')
const getEntriesFromList = require('../redis/getEntriesFromList')
const getOneFromHash = require('../redis/getOneFromHash')
const createMapToken = require('../utils/createMapToken')
const determineCoordinates = require('../utils/determineCoordinates')
const informManager = require('../utils/informManager')
const informLogger = require('../utils/informLogger')
const informNearbyPlayers = require('../utils/informNearbyPlayers')
const checkSpawnLocation = require('./components/checkSpawnLocation')
const createLocation = require('./components/createLocation')

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const geocodingClient = mbxGeocoding({ accessToken: key.mapbox })

module.exports = (latitude, longitude) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [shouldSpawn, nearLocationInstances] =
        await checkSpawnLocation(latitude, longitude)

      if (true
        //shouldSpawn
      ) {
        const [locationSpawnMax, locationPriorityTypes, physicalOnlyChance] =
          await getEntriesFromList(
            'constants',
            [
              'locationSpawnMax',
              'locationPriorityTypes',
              'locationPhysicalOnlyChance'
            ]
          )

        const nearLocationNames = await Promise.all(
          nearLocationInstances.map(instance =>
            getOneFromHash(instance, 'displayName')
          )
        )

        let location
        let calls = 0
        const highPriority = []
        const midPriority = []
        const lowPriority = []
        let queryCoords = [longitude, latitude]
        let bearing = 0
        while (!location) {
          let results = []
          if (calls > locationSpawnMax) {
            break
          }

          await geocodingClient
            .reverseGeocode({
              query: queryCoords,
              limit: 5,
              types: ['poi.landmark']
            })
            .send()
            .then(response => {
              results = response.body.features
              return results
            })

          for (const result of results.filter(result => !nearLocationNames.includes(result.text))) {
            const categories = result.properties.category.split(', ')
            for (const catergory of categories)
              if (locationPriorityTypes[0].includes(catergory)) {
                highPriority.push(result)
              }
              else if (locationPriorityTypes[1].includes(catergory)) {
                midPriority.push(result)
              }
              else if (locationPriorityTypes[2].includes(catergory)) {
                lowPriority.push(result)
              }
            }

            if (highPriority.length) {
              location = highPriority[Math.floor(Math.random() * highPriority.length)]
              break
            }
            else {
              queryCoords = determineCoordinates(
                queryCoords[0],
                queryCoords[1],
                2,
                bearing
              )
            }
            bearing += 36
            calls++
          }

          if (!location) {
            if (midPriority.length) {
              location = midPriority[Math.floor(Math.random() * midPriority.length)]
            }
            else if (lowPriority.length) {
              location = lowPriority[Math.floor(Math.random() * lowPriority.length)]
            }
          }

        /* USING GOOGLE PLACES API
        const nearby = await axios(
          'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' +
          latitude +
          ',' +
          longitude +
          '&radius=' +
          radius +
          '&key=' +
          key.google
        )
        */

        if (location) {
          const newLocation = createLocation(
            location.text,
            location.center[1],
            location.center[0],
            physicalOnlyChance
          )

          await Promise.all([
            addObjectToHash(newLocation.instance, newLocation),
            addToGeohash(
              'locations',
              newLocation.instance,
              newLocation.latitude,
              newLocation.longitude
            ),
            addToActiveSet('locations', newLocation.instance),
            informManager(
              {
                command: 'add',
                type: 'location',
                instance: newLocation.instance,
                location: newLocation
              }
            ),
            informNearbyPlayers(
              newLocation.latitude,
              newLocation.longitude,
              {
                command: 'map_location_add',
                token: createMapToken(newLocation)
              }
            )
          ])
          informLogger({
            route: 'popCreation',
            pop_id: newLocation.instance,
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
          })
        }
      }

      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
