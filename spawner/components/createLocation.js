const newLocation = require('../../templates/locationTemplate')
const createInstanceId = require('../../utils/createInstanceId')

module.exports = (name, latitude, longitude, chance) => {
  const currentTime = Date.now()

  const location = newLocation

  location.instance = createInstanceId()
  location.type = 'location'
  location.displayName = name
  location.createdOn = currentTime
  location.rewardOn = currentTime + (86400000 * 9)
  location.latitude = latitude
  location.longitude = longitude
  location.physicalOnly = Math.random() < chance ? false : true

  return location
}
