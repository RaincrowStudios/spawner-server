const getOneFromList = require('../redis/getOneFromList')
const handleError = require('../utils/handleError')
const getSpawnList = require('./components/getSpawnList')
const spawnCollectible = require('./spawnCollectible')
const spawnLocation = require('./spawnLocation')
const spawnSpirit = require('./spawnSpirit')

async function spawner(message) {
  try {
    if (message.event === 'creation') {
      const emberDays = await getOneFromList('constants', 'emberDays')
      if (!emberDays) {
        await spawnLocation(message.latitude, message.longitude)
      }
    }
    else if (message.event === 'move') {
      const spawnList = await getSpawnList(message.latitude, message.longitude)

      if (spawnList) {
        await Promise.all([
          spawnCollectible(message.latitude, message.longitude, spawnList),
          spawnSpirit(message.latitude, message.longitude, spawnList)
        ])
      }
    }

    return true
  }
  catch (err) {
    handleError(err)
  }
}

module.exports = spawner
