const net = require('net')
const ips = require('../config/region-ips')
const sockets = require('../database/sockets')

module.exports = (message = '') => {
  return new Promise((resolve, reject) => {
    try {
      const region = process.env.NODE_ENV === 'development' ?
        'local' :
        process.env.INSTANCE_REGION.split('/').pop().slice(0, -2)

      const manager = new net.Socket()
      const port = process.env.NODE_ENV === 'development' ? 8082 : 8080
      const host = process.env.NODE_ENV === 'development' ?
        'localhost' :
        '10.' + ips[region] + '2.255'

      manager.connect(port, host, () => {
        sockets.insert({socket: manager, type: 'manager'})
        resolve(true)
      })

      manager.on('error', (err) => {
        console.error(err)
      })

      if (message) {
        manager.write(JSON.stringify(message))
      }
    }
    catch (err) {
      console.error(err)
      reject(err)
    }
  })
}
