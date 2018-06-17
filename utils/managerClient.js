const net = require('net')
const ips = require('../config/region-ips')

const region = process.env.INSTANCE_REGION === 'local' ?
  'local' :
  process.env.INSTANCE_REGION.split('/').pop().slice(0, -2)

const managerClient = new net.Socket()
const port = process.env.NODE_ENV === 'development' ? 8082 : 80
const host = process.env.INSTANCE_REGION === 'local' ?
  'localhost' :
  '10.' + ips[region] + '2.255'

managerClient.connect(port, host, () => {
  managerClient.write('connected')
  managerClient.end()
})

module.exports = managerClient
