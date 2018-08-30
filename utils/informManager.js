const sockets = require('../database/sockets')
const publishToChannel = require('../redis/publishToChannel')
const createManagerClient = require('./createManagerClient')

module.exports = (message) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (message.command === 'add' || message.command === 'death') {
        const manager = sockets.by('type', 'manager')

        if (!manager || !manager.socket.writable) {
          await createManagerClient(message)
        }
        const messageString = JSON.stringify(message).concat('$%$%')
        //appending '$%$%' as message termination to avoid issue with TCP batching
        manager.socket.write(messageString)
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
