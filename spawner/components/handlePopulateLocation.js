const addObjectToHash = require('../../redis/addObjectToHash')
const updateHashFieldObject = require('../../redis/updateHashFieldObject')
const informManager = require('../../redis/informManager')
const createLocationSpirit = require('./createLocationSpirit')

module.exports = (location, position) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []

      const spirit = await createLocationSpirit(location, position)

      update.push(
        addObjectToHash(spirit.instance, spirit),
        informManager(
          {
            command: 'add',
            type: 'spirit',
            instance: spirit.instance,
            spirit: spirit
          }
        ),
        updateHashFieldObject(
          location,
          'add',
          'spirits',
          spirit.instance,
          {
            position: spirit.position
          }
        )
      )

      resolve(update)
    }
    catch (err) {
      reject(err)
    }
  })
}
