const publishToChannel = require('../redis/publishToChannel')
const managerClient = require('./managerClient')

module.exports = (message) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (message.command === 'add' || message.command === 'death') {
        managerClient.write(JSON.stringify(message))
        managerClient.end()
      }
      else {
        await publishToChannel('manager', message)
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
