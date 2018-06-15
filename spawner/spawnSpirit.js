const uuidv1 = require('uuid/v1')
const addObjectToHash = require('../redis/addObjectToHash')
const addToActiveSet = require('../redis/addToActiveSet')
const addToGeohash = require('../redis/addToGeohash')
const getAllFromHash = require('../redis/getAllFromHash')
const getEntriesFromList = require('../redis/getEntriesFromList')
const getNearbyFromGeohash = require('../redis/getNearbyFromGeohash')
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
          console.log(spiritId)
          const instance = uuidv1()
          const spirit = await createWildSpirit(spiritId)
          const spanwCoords =
            generateSpawnCoords(latitude, longitude, spawnRadius)

          spirit.summonLat = spanwCoords[0]
          spirit.summonLong = spanwCoords[1]
          spirit.latitude = spanwCoords[0]
          spirit.longitude = spanwCoords[1]

          await Promise.all([
            addObjectToHash(instance, spirit),
            addToActiveSet('spirits', instance),
            addToGeohash(
              'spirits',
              instance,
              spanwCoords[0],
              spanwCoords[1]
            ),
            informManager(
              {
                command: 'add',
                type: 'spirit',
                instance: instance,
                spirit: spirit
              }
            ),
            informNearbyPlayers(
              spanwCoords[0],
              spanwCoords[1],
              {
                command: 'map_spirit_add',
                token: createMapToken(instance, spirit)
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
