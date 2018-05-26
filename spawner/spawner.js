const spawnCollectible = require('./spawnCollectible')
const spawnSpirit = require('./spawnSpirit')

function spawner(coords, constants) {
  return new Promise(async (resolve, reject) => {
    try {
      await Promise.all([
        spawnCollectible(coords, constants),
        spawnSpirit(coords, constants)
      ])

      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}

module.exports = spawner
