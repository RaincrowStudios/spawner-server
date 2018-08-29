module.exports = (latitude, longitude, spirits) => {
  return new Promise(async (resolve, reject) => {
    try {
      const validSpirits = spirits
      if (validSpirits.length) {
        const spiritId =
          validSpirits[Math.floor(Math.random()) * validSpirits.length].id
        resolve(spiritId)
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
