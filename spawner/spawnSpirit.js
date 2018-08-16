const addObjectToHash = require('../redis/addObjectToHash')
const addToActiveSet = require('../redis/addToActiveSet')
const addToGeohash = require('../redis/addToGeohash')
const getAllFromHash = require('../redis/getAllFromHash')
const getEntriesFromList = require('../redis/getEntriesFromList')
const getNearbyFromGeohash = require('../redis/getNearbyFromGeohash')
const createInstanceId = require('../utils/createInstanceId')
const createMapToken = require('../utils/createMapToken')
const informNearbyPlayers = require('../utils/informNearbyPlayers')
const informManager = require('../utils/informManager')
const createWildSpirit = require('./components/createWildSpirit')
const determineWildSpirit = require('./components/determineWildSpirit')
const generateSpawnCoords = require('./components/generateSpawnCoords')

module.exports = (latitude, longitude, spawnList) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [spawnRadius, spiritSpawnChance, spiritDensity, spiritRarityChance] =
        await getEntriesFromList(
          'constants',
          [
            'spawnRadius',
            'spiritSpawnChance',
            'spiritDensity',
            'spiritRarityChance'
          ]
        )
      const nearSpiritInstances = await getNearbyFromGeohash(
        'spirits',
        latitude,
        longitude,
        spawnRadius
      )

      if (nearSpiritInstances.length) {
        const spirits = await Promise.all(
          nearSpiritInstances.map(instance => getAllFromHash(instance))
        )

        const tierFour = spirits.filter(spirit => spirit.tier === 4)
        if (tierFour.length >= spiritDensity[4]) {
          resolve(true)
        }

        const tierThree = spirits.filter(spirit => spirit.tier === 3)
        if (tierThree.length >= spiritDensity[3]) {
          resolve(true)
        }

        const tierTwo = spirits.filter(spirit => spirit.tier === 2)
        if (tierTwo.length >= spiritDensity[2]) {
          resolve(true)
        }

        const tierOne = spirits.filter(spirit => spirit.tier === 1)
        if (tierOne.length >= spiritDensity[1]) {
          resolve(true)
        }

        const tierZero = spirits.filter(spirit => spirit.tier === 0)
        if (tierZero.length >= spiritDensity[0]) {
          resolve(true)
        }
      }

      if (
        Math.random() <=
        (spiritSpawnChance + spawnList.spiritSpawnChanceModifier)
      ) {
        let spiritId = false
        const spawnTierRoll = Math.random()
        for (let i = spiritRarityChance.length - 1; i > 0; i--) {
          if (spiritId) {
            break
          }

          if (spawnTierRoll <= spiritRarityChance[i]) {
            if (spawnList.spirits[i - 1].length) {
              spiritId = await determineWildSpirit(
                latitude,
                longitude,
                spawnList.spirits[i - 1]
              )
            }
          }
        }

        if (spiritId) {
          const spirit = await createWildSpirit(spiritId)
          const spawnCoords =
            generateSpawnCoords(latitude, longitude, spawnRadius)

          spirit.summonLat = spawnCoords[0]
          spirit.summonLong = spawnCoords[1]
          spirit.latitude = spawnCoords[0]
          spirit.longitude = spawnCoords[1]

          await Promise.all([
            addObjectToHash(spirit.instance, spirit),
            addToActiveSet('spirits', spirit.instance),
            addToGeohash(
              'spirits',
              spirit.instance,
              spawnCoords[0],
              spawnCoords[1]
            ),
            informManager(
              {
                command: 'add',
                type: 'spirit',
                instance: spirit.instance,
                spirit: spirit
              }
            ),
            informNearbyPlayers(
              spawnCoords[0],
              spawnCoords[1],
              {
                command: 'map_token_add',
                token: createMapToken(spirit)
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
