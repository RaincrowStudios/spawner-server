const newLocation = require('../../templates/locationTemplate')

module.exports = (instance, name, tier, latitude, longitude, chance) => {
  const currentTime = Date.now()

  const location = newLocation

  location.instance = instance
  location.displayName = name
  location.createdOn = currentTime
  location.expiresOn = currentTime + (86400000 * 3 * tier)
  location.latitude = latitude
  location.longitude = longitude
  location.tier = tier
  location.slots = tier * 3
  location.spiritSlots = tier
  location.physicalOnly = Math.random() < chance ? false : true

  return location
}
