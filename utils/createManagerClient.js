const net = require('net')
const production = require('../config/production')
const ips = require('../config/region-ips')
const sockets = require('../database/sockets')

module.exports = (message = '') => {
  return new Promise((resolve, reject) => {
    try {
      const region = process.env.NODE_ENV === 'development' ?
        'local' :
        process.env.INSTANCE_REGION.split('/').pop().slice(0, -2)

      const manager = new net.Socket()
      const port = process.env.NODE_ENV === 'development' ?
        8082 : production.port

      const host = process.env.NODE_ENV === 'development' ?
        'localhost' : ips[region] + production.managerAddress

      manager.connect(port, host, () => {
        sockets.insert({socket: manager, type: 'manager'})
        if (message) {
          manager.write(JSON.stringify(message))
        }
        resolve(true)
      })

      manager.on('error', (err) => {
        console.error(err)
      })

    }
    catch (err) {
      console.error(err)
      reject(err)
    }
  })
}
