const getEntriesFromList = require('../../redis/getEntriesFromList')
const getNearbyFromGeohash = require('../../redis/getNearbyFromGeohash')

module.exports = (latitude, longitude) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [radius, charactersPerLocation] =
        await getEntriesFromList(
          'constants',
          ['locationSpawnRadius', 'charactersPerLocation']
        )

      const [nearCharacters, nearLocations] = await Promise.all([
        getNearbyFromGeohash('characters', latitude, longitude, radius),
        getNearbyFromGeohash('locations', latitude, longitude, radius)
      ])

      if (!nearLocations.length) {
        resolve([true, nearLocations])
      }
      else if (
        nearCharacters.length/nearLocations.length < charactersPerLocation
      ) {
        resolve([true, nearLocations])
      }

      resolve([false, false])
    }
    catch (err) {
      reject(err)
    }
  })
}
