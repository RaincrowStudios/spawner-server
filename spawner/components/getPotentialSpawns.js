const key = require('../../keys/keys')
const getEntriesFromList = require('../../redis/getEntriesFromList')
const getOneFromHash = require('../../redis/getOneFromHash')
const determineCoordinates = require('../../utils/determineCoordinates')
const createLocation = require('./createLocation')

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const geocodingClient = mbxGeocoding({ accessToken: key.mapbox })

module.exports = (latitude, longitude, nearLocationInstances) => {
  return new Promise(async (resolve, reject) => {
    try {
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
      let distance = 2
      let bearing = 0

      while (!location) {
        while (bearing < 360) {
          if (calls > locationSpawnMax) {
            break
          }

          let results = []
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

          const filteredResults = results
            .filter(result => !nearLocationNames.includes(result.text))

          for (const result of filteredResults) {
            const categories = result.properties.category.split(', ')

            for (const catergory of categories) {
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
          }

          if (highPriority.length) {
            location = highPriority[
              Math.floor(Math.random() * highPriority.length)
            ]
            break
          }
          else {
            queryCoords = determineCoordinates(
              longitude,
              latitude,
              distance,
              bearing
            )
          }

          bearing += 36
          calls++
        }

        if (!location) {
          if (midPriority.length) {
            location = midPriority[
              Math.floor(Math.random() * midPriority.length)
            ]
          }
          else if (lowPriority.length) {
            location = lowPriority[
              Math.floor(Math.random() * lowPriority.length)
            ]
          }
        }

        bearing = 0
        distance += 2
      }

      if (location) {
        const newLocation = createLocation(
          location.text,
          location.center[1],
          location.center[0],
          physicalOnlyChance
        )

        resolve(newLocation)
      }
      else {
        resolve(false)
      }
    }
    catch (err) {
      reject(err)
    }
  })
}
