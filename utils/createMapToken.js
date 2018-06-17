module.exports = (instance, info) => {
  let token

  switch (info.type) {
    case 'location':
      token = {
        instance: instance,
        type: info.type,
        tier: info.tier,
        latitude: info.latitude,
        longitude: info.longitude,
        physicalOnly: info.physicalOnly
      }
      break
    case 'portal':
      token = {
        instance: instance,
        creator: info.ownerDisplay,
        type: info.type,
        subtype: info.tier > 0 ? 'greater' : 'lesser',
        degree: info.degree,
        latitude: info.latitude,
        longitude: info.longitude
      }
      break
    case 'herb':
    case 'gem':
    case 'tool':
    case 'silver':
      token = {
        instance: instance,
        type: info.type,
        latitude: info.latitude,
        longitude: info.longitude,
      }
      break
    case 'spirit':
      token = {
        instance: instance,
        type: info.type,
        subtype: info.tier > 0 ? 'greater' : 'lesser',
        degree: info.degree,
        latitude: info.latitude,
        longitude: info.longitude
      }
      break
    case 'witch':
      token = {
        instance: instance,
        displayName: info.displayName,
        type: info.type,
        male: info.male,
        degree:  info.degree,
        latitude: info.fuzzyLatitude,
        longitude: info.fuzzyLongitude,
        distance: info.distance
      }
      break
    default:
      break
  }
  return token
}
