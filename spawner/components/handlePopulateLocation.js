const addFieldToHash = require('../../redis/addFieldToHash')
const addObjectToHash = require('../../redis/addObjectToHash')
const informManager = require('../../utils/informManager')
const createLocationSpirit = require('./createLocationSpirit')

module.exports = (location) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      const locationSpirits = {}

      for (let i = 1; i <= location.spiritSlots; i++) {
        const spirit = await createLocationSpirit(location, i)

        locationSpirits[locationSpirits] = {
          position: i
        }

        update.push(
          addObjectToHash(spirit.instance, spirit),
          informManager(
            {
              command: 'add',
              type: 'spirit',
              instance: spirit.instance,
              spirit: spirit
            }
          )
        )
      }


      update.push(
        addFieldToHash(
          location,
          'spirits',
          locationSpirits
        )
      )

      resolve(update)
    }
    catch (err) {
      reject(err)
    }
  })
}
