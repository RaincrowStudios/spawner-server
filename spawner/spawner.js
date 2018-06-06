const spawnCollectible = require('./spawnCollectible')
const spawnLocation = require('./spawnLocation')
const spawnSpirit = require('./spawnSpirit')

async function spawner(message) {
  try {
    if (message.event === 'creation') {
      await spawnLocation(message.latitude, message.longitude)
    }
    else if (message.event === 'move') {
      await Promise.all([
        spawnCollectible(message.latitude, message.longitude),
        spawnSpirit(message.latitude, message.longitude)
      ])
    }

    return true
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = spawner
