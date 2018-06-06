const axios = require('axios')
const keys = require('../keys')
const publishToChannel = require('../redis/publishToChannel')

module.exports = (message) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (message.command == 'add') {
        const url = 'http://' + keys.manager.host + ':' + keys.manager.port
        await axios.post(url, JSON.stringify(message))
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
