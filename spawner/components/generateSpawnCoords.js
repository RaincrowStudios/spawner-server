module.exports = (coords, radius) => {
  function precisionRound(number, precision) {
    const factor = Math.pow(10, precision)
    return Math.round(number * factor) / factor
  }

  const spawnLatitude =
    coords[0] +
    (((Math.floor(Math.random() * (radius - 10)) + 10) * 0.00001) *
    (Math.random() < 0.5 ? -1 : 1))

  const spawnLongitude =
    coords[1] +
    (((Math.floor(Math.random() * (radius - 10)) + 10) * 0.00001 *
    Math.cos(coords[0] * (Math.PI / 180)))  * (Math.random() < 0.5 ? -1 : 1))
  return [precisionRound(spawnLatitude, 6), precisionRound(spawnLongitude, 6)]
}
