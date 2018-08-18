const sockets = require('../database/sockets')
const publishToChannel = require('../redis/publishToChannel')
const createManagerClient = require('./createManagerClient')

module.exports = (message) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (message.command === 'add' || message.command === 'death') {
        const manager = sockets.by('type', 'manager')
        
        if (!manager || !manager.socket.writable) {
          sockets.remove(manager)
          await createManagerClient(message)
        }
        manager.socket.write(JSON.stringify(message))
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
