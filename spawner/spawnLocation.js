const addObjectToHash = require('../redis/addObjectToHash')
const addToGeohash = require('../redis/addToGeohash')
const addToActiveSet = require('../redis/addToActiveSet')
const createMapToken = require('../utils/createMapToken')
const informManager = require('../utils/informManager')
const informLogger = require('../utils/informLogger')
const informNearbyPlayers = require('../utils/informNearbyPlayers')
const checkSpawnLocation = require('./components/checkSpawnLocation')
const determineLocation = require('./components/determineLocation')
const handlePopulateLocation = require('./components/handlePopulateLocation')

module.exports = (latitude, longitude) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      const inform = []

      const [shouldSpawn, nearLocationInstances] =
        await checkSpawnLocation(latitude, longitude)

      if (shouldSpawn) {
        const location = await determineLocation(latitude, longitude, nearLocationInstances)

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
          update.push(
            addObjectToHash(location.instance, location),
            addToGeohash(
              'locations',
              location.instance,
              location.latitude,
              location.longitude
            ),
            addToActiveSet('locations', location.instance),
            informManager(
              {
                command: 'add',
                type: 'location',
                instance: location.instance,
                location: location
              }
            ),
            informLogger({
              route: 'popCreation',
              pop_id: location.instance,
              latitude: location.latitude,
              longitude: location.longitude,
            })
          )

          inform.push(
            {
              function: informNearbyPlayers,
              parameters: [
                location,
                {
                  command: 'map_token_add',
                  token: createMapToken(location)
                }
              ]
            }
          )

          const spiritUpdate = await handlePopulateLocation(location)
          update.push(...spiritUpdate)
        }
      }

      await Promise.all(update)

      for (const informObject of inform) {
        const informFunction = informObject.function
        await informFunction(...informObject.parameters)
      }

      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
