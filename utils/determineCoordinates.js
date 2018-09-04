function degreeToRadians(degree) {
  return degree * (Math.PI/180)
}

function radiansToDegrees(radian) {
  return radian * (180/Math.PI)
}


module.exports = (longitudeDegree, latitudeDegree, distance, bearing) => {
  const earthRadius = 6371
  const latitude = degreeToRadians(latitudeDegree)
  const longitude = degreeToRadians(longitudeDegree)
  const newLatitude = Math.asin(
    Math.sin(latitude) * Math.cos(distance/earthRadius) +
    Math.cos(latitude) * Math.sin(distance/earthRadius) * Math.cos(bearing)
  )

  let newLongitude = longitude + Math.atan2(
    Math.sin(bearing) * Math.sin(distance/earthRadius) * Math.cos(latitude),
    Math.cos(distance/earthRadius) - Math.sin(latitude) * Math.sin(newLatitude))

  newLongitude = (newLongitude + 540) % 360 - 180

  return [radiansToDegrees(newLongitude), radiansToDegrees(newLatitude)]
}
