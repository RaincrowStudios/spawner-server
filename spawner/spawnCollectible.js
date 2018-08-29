const addObjectToHash = require('../redis/addObjectToHash')
const addToActiveSet = require('../redis/addToActiveSet')
const addToGeohash = require('../redis/addToGeohash')
const getAllFromHash = require('../redis/getAllFromHash')
const getEntriesFromList = require('../redis/getEntriesFromList')
const getNearbyFromGeohash = require('../redis/getNearbyFromGeohash')
const getOneFromList = require('../redis/getOneFromList')
const createInstanceId = require('../utils/createInstanceId')
const createMapToken = require('../utils/createMapToken')
const informNearbyPlayers = require('../utils/informNearbyPlayers')
const informManager = require('../utils/informManager')
const determineCollectible = require('./components/determineCollectible')
const generateSpawnCoords = require('./components/generateSpawnCoords')

module.exports = (latitude, longitude, spawnList) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [
        spawnRadius,
        collectibleSpawnChance,
        collectibleDensity,
        collectibleRarityChance
      ] = await getEntriesFromList(
          'constants',
          [
            'spawnRadius',
            'collectibleSpawnChance',
            'collectibleDensity',
            'collectibleRarityChance'
          ]
        )

      const nearInstances = await getNearbyFromGeohash(
        'collectibles',
        latitude,
        longitude,
        spawnRadius
      )

      const collectibleInstances = await Promise.all(
        nearInstances.map(instance => getAllFromHash(instance))
      )

      const collectibles = await Promise.all(
        collectibleInstances
          .map(collectible => getOneFromList('collectibles', collectible.id))
      )

      const types = ['herb', 'tool', 'gem']
      for (let i = 0; i < types.length; i++) {
        const rarityFour = collectibles
          .filter(collectible => collectible.rarity === 4).length

        if (rarityFour >= collectibleDensity[3]) {
          continue
        }

        const rarityThree = collectibles
          .filter(collectible => collectible.rarity === 3).length

        if (rarityThree >= collectibleDensity[2]) {
          continue
        }

        const rarityTwo = collectibles
          .filter(collectible => collectible.rarity === 2).length

        if (rarityTwo >= collectibleDensity[1]) {
          continue
        }

        const rarityOne = collectibles
          .filter(collectible => collectible.rarity === 1).length

        if (rarityOne >= collectibleDensity[0]) {
          continue
        }

        if (
          Math.random() <=
          (collectibleSpawnChance[i] + spawnList.collectibleSpawnChanceModifier)
        ) {
          let collectibleId = false
          let weight = 0
          const spawnTierRoll = Math.random()
          for (let j = collectibleRarityChance.length - 1; j >= 0; j--) {
            weight += collectibleRarityChance[j]
            if (collectibleId) {
              break
            }
            if (spawnTierRoll <= weight) {
              if (spawnList[types[i] + 's'][j].length) {
                collectibleId = await determineCollectible(
                  latitude,
                  longitude,
                  spawnList[types[i] + 's'][j]
                )
              }
            }
          }

          if (collectibleId) {
            const spawnCoords =
              generateSpawnCoords(latitude, longitude, spawnRadius)

            const collectible = {
              instance: createInstanceId(),
              id: collectibleId,
              type: types[i],
              latitude: spawnCoords[0],
              longitude: spawnCoords[1]
            }

            await Promise.all([
              addObjectToHash(collectible.instance, collectible),
              addToActiveSet('collectibles', collectible.instance),
              addToGeohash(
                'collectibles',
                collectible.instance,
                spawnCoords[0],
                spawnCoords[1]
              ),
              informManager(
                {
                  command: 'add',
                  type: 'collectible',
                  instance: collectible.instance,
                  collectible: collectible
                }
              ),
              informNearbyPlayers(
                spawnCoords[0],
                spawnCoords[1],
                {
                  command: 'map_token_add',
                  token: createMapToken(collectible)
                }
              )
            ])
          }
        }
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
