const uuidv1 = require('uuid/v1')
const addObjectToHash = require('../redis/addObjectToHash')
const addToActiveSet = require('../redis/addToActiveSet')
const addToGeohash = require('../redis/addToGeohash')
const getAllFromHash = require('../redis/getAllFromHash')
const getNearbyFromGeohash = require('../redis/getNearbyFromGeohash')
const createMapToken = require('../utils/createMapToken')
const informNearbyPlayers = require('../utils/informNearbyPlayers')
const informManager = require('../utils/informManager')
const createWildSpirit = require('./components/createWildSpirit')
const determineWildSpirit = require('./components/determineWildSpirit')
const generateSpawnCoords = require('./components/generateSpawnCoords')
const getSpawnZone = require('./components/getSpawnZone')

module.exports = (coords, constants) => {
  return new Promise(async (resolve, reject) => {
    try {
      const nearSpiritInstances = await getNearbyFromGeohash(
        'spirits',
        coords[0],
        coords[1],
        constants.spawnRadius
      )

      if (nearSpiritInstances.length) {
        const spirits = await Promise.all(
          nearSpiritInstances.map(instance => getAllFromHash(instance))
        )

        const tierFour = spirits.filter(spirit => spirit.tier === 4)
        if (tierFour.length >= constants.spiritDensity[4]) {
          resolve(true)
        }

        const tierThree = spirits.filter(spirit => spirit.tier === 3)
        if (tierThree.length >= constants.spiritDensity[3]) {
          resolve(true)
        }

        const tierTwo = spirits.filter(spirit => spirit.tier === 2)
        if (tierTwo.length >= constants.spiritDensity[2]) {
          resolve(true)
        }

        const tierOne = spirits.filter(spirit => spirit.tier === 1)
        if (tierOne.length >= constants.spiritDensity[1]) {
          resolve(true)
        }

        const tierZero = spirits.filter(spirit => spirit.tier === 0)
        if (tierZero.length >= constants.spiritDensity[0]) {
          resolve(true)
        }
      }

      const spawnZone = await getSpawnZone(coords, constants.spawnRadius)

      if (
        Math.random() <=
        (constants.spiritSpawnChance + spawnZone.spiritSpawnChanceModifier)
      ) {
        let spiritId
        const spawnTierRoll = Math.random()
        for (let i = constants.spiritTierChance.length - 1; i >= 0; i--) {
          if (spawnTierRoll <= constants.spiritTierChance[i]) {
            spiritId = determineWildSpirit(spawnZone.tiers[i])
          }
        }

        const instance = uuidv1()
        const spirit = await createWildSpirit(spiritId)
        const spanwCoords = generateSpawnCoords(coords, constants.spawnRadius)

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
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
