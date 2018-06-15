const uuidv1 = require('uuid/v1')
const addObjectToHash = require('../redis/addObjectToHash')
const addToActiveSet = require('../redis/addToActiveSet')
const addToGeohash = require('../redis/addToGeohash')
const getAllFromHash = require('../redis/getAllFromHash')
const getEntriesFromList = require('../redis/getEntriesFromList')
const getOneFromHash = require('../redis/getOneFromHash')
const getNearbyFromGeohash = require('../redis/getNearbyFromGeohash')
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

      const nearCollectibleInstances = await getNearbyFromGeohash(
        'collectible',
        latitude,
        longitude,
        spawnRadius
      )

      if (nearCollectibleInstances.length) {
        const collectibles = await Promise.all(
          nearCollectibleInstances.map(instance => getAllFromHash(instance))
        )
        const types = ['herb', 'tool', 'gem']
        for (let i = 0; i < types.length; i++) {
          const rarityFour = collectibles
            .filter(collectible => collectible.rarity === 4)
          if (rarityFour.length >= collectibleDensity[3]) {
            continue
          }

          const rarityThree = collectibles.filter(collectible => collectible.rarity === 3)
          if (rarityThree.length >= collectibleDensity[2]) {
            continue
          }

          const rarityTwo = collectibles.filter(collectible => collectible.rarity === 2)
          if (rarityTwo.length >= collectibleDensity[1]) {
            continue
          }

          const rarityOne = collectibles.filter(collectible => collectible.rarity === 1)
          if (rarityOne.length >= collectibleDensity[0]) {
            continue
          }

        if (
          Math.random() <=
          (collectibleSpawnChance[i] + spawnList.collectibleSpawnChanceModifier)
        ) {
          let collectibleId = false
          const spawnTierRoll = Math.random()
          for (let i = collectibleRarityChance.length - 1; i > 0; i--) {
            if (collectibleId) {
              break
            }

            if (spawnTierRoll <= collectibleRarityChance[i]) {
              if (spawnList.collectibles[types[i] + 's'].length) {
                collectibleId = await determineCollectible(
                  latitude,
                  longitude,
                  spawnList.collectibles[types[i] + 's']
                )
              }
            }
          }

          if (collectibleId) {
            const instance = uuidv1()
            const spanwCoords =
              generateSpawnCoords(latitude, longitude, spawnRadius)

            const collectible = {
              id: collectibleId,
              type: types[i],
              latitude: spanwCoords[0],
              longitude: spanwCoords[1]
            }

            await Promise.all([
              addObjectToHash(instance, collectible),
              addToActiveSet('collectibles', instance),
              addToGeohash(
                'collectibles',
                instance,
                spanwCoords[0],
                spanwCoords[1]
              ),
              informManager(
                {
                  command: 'add',
                  type: 'collectible',
                  instance: instance,
                  collectible: collectible
                }
              ),
              informNearbyPlayers(
                spanwCoords[0],
                spanwCoords[1],
                {
                  command: 'map_collectible_add',
                  token: createMapToken(instance, collectible)
                }
              )
            ])
          }
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
