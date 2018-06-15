module.exports = (latitude, longitude, collectibles) => {
  return new Promise(async (resolve, reject) => {
    try {
      const validCollectibles = collectibles
      if (validCollectibles.length) {
        const collectibleId =
          validCollectibles[Math.floor(Math.random) * validCollectibles.length]
        resolve(collectibleId)
      }
      else {
        resolve(false)
      }
    }
    catch (err) {
      reject(err)
    }
  })
}
