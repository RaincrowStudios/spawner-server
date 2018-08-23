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
        const managerSocket = sockets.by('type', 'manager')

        if (managerSocket) {
          sockets.remove(managerSocket)
        }

        sockets.insert({socket: manager, type: 'manager'})
        if (message) {
          manager.write(JSON.stringify(message))
        }
        resolve(true)
      })

      manager.on('error', err => {
        if (err.code === 'ECONNRESET') {
          manager.connect(port, host, () => {
            const managerSocket = sockets.by('type', 'manager')

            if (managerSocket) {
              sockets.remove(managerSocket)
            }

            sockets.insert({socket: manager, type: 'manager'})
            if (message) {
              manager.write(JSON.stringify(message))
            }
            resolve(true)
          })
        }
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
