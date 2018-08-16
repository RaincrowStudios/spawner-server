const newLocation = require('../../templates/locationTemplate')
const createInstanceId = require('../../utils/createInstanceId')

module.exports = (name, tier, latitude, longitude, chance) => {
  const currentTime = Date.now()

  const location = newLocation

  location.instance = createInstanceId()
  location.type = 'location'
  location.displayName = name
  location.createdOn = currentTime
  location.rewardOn = currentTime + (86400000 * 3 * tier)
  location.latitude = latitude
  location.longitude = longitude
  location.tier = tier
  location.slots = tier * 3
  location.spiritSlots = tier
  location.physicalOnly = Math.random() < chance ? false : true
  location.occupants = {}
  location.spirit = {}

  return location
}
