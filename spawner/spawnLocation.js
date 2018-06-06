const axios = require('axios')
const uuidv1 = require('uuid/v1')
const key = require('../keys')
const addObjectToHash = require('../redis/addObjectToHash')
const addToGeohash = require('../redis/addToGeohash')
const addToActiveSet = require('../redis/addToActiveSet')
const getEntriesFromList = require('../redis/getEntriesFromList')
const getOneFromHash = require('../redis/getOneFromHash')
const createMapToken = require('../utils/createMapToken')
const informManager = require('../utils/informManager')
const informNearbyPlayers = require('../utils/informNearbyPlayers')
const checkSpawnLocation = require('./components/checkSpawnLocation')
const createLocation = require('./components/createLocation')

module.exports = (latitude, longitude) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [shouldSpawn, nearLocationInstances] =
        await checkSpawnLocation(latitude, longitude)

      if (shouldSpawn) {
        const [radius, tierTypes, physicalOnlyChance] =
          await getEntriesFromList(
            'constants',
            [
              'locationSpawnRadius',
              'locationTierTypes',
              'locationPhysicalOnlyChance'
            ]
          )

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

        const nearLocationNames = await Promise.all(
          nearLocationInstances.map(instance =>
            getOneFromHash(instance, 'displayName')
          )
        )

        const tierThrees = []
        const tierTwos = []
        const tierOnes = []

        for (const result of nearby.data.results) {
          for (const type of tierTypes[2]) {
            if (
              result.types.includes(type) &&
              !nearLocationNames.includes(result.name)
            ) {
              tierThrees.push(result)
            }
          }
          for (const type of tierTypes[1]) {
            if (
              result.types.includes(type) &&
              !nearLocationNames.includes(result.name)
            ) {
              tierTwos.push(result)
            }
          }
          for (const type of tierTypes[0]) {
            if (
              result.types.includes(type) &&
              !nearLocationNames.includes(result.name)
            ) {
              tierOnes.push(result)
            }
          }
        }

        let location, tier
        if (tierThrees.length) {
          location = tierThrees[Math.floor(Math.random() * tierThrees.length)]
          tier = 3
        }
        else if (tierTwos.length) {
          location = tierTwos[Math.floor(Math.random() * tierTwos.length)]
          tier = 2
        }
        else if (tierOnes.length) {
          location = tierOnes[Math.floor(Math.random() * tierOnes.length)]
          tier = 1
        }

        if (location) {
          const instance = uuidv1()
          const newLocation = createLocation(
            instance,
            location.name,
            tier,
            location.geometry.location.lat,
            location.geometry.location.lng,
            physicalOnlyChance
          )

          await Promise.all([
            addObjectToHash(instance, newLocation),
            addToGeohash(
              'locations',
              instance,
              newLocation.latitude,
              newLocation.longitude
            ),
            addToActiveSet('locations', instance),
            informManager(
              {
                command: 'add',
                type: 'location',
                instance: instance,
                location: newLocation
              }
            ),
            informNearbyPlayers(
              newLocation.latitude,
              newLocation.longitude,
              {
                command: 'map_location_add',
                token: createMapToken(instance, newLocation)
              }
            )
          ])
        }
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}