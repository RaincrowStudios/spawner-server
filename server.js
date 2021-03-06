'use strict'

const net = require('net')
const production = require('./config/production')
const createRedisClients = require('./redis/createRedisClients')
const spawner = require('./spawner/spawner')
const createManagerClient = require('./utils/createManagerClient')
const port = process.env.NODE_ENV === 'development' ? 8083 : production.port

async function startup() {
  console.log('Starting spawner server...')
  await Promise.all([
    createRedisClients(),
    createManagerClient(),
  ])
}

startup()

const server = net.createServer(socket => {
  socket.on('data', data => {
    const messages = data.toString().split('$%$%').filter(message => message)
    
    for (const message of messages) {
      spawner(JSON.parse(message))
    }
  })

  socket.on('error', err => {
    if (err.code !== 'ECONNRESET') {
      console.error(err)
    }
  })
})

server.listen(port, () => {
  console.log('Spawner server started.')
})

process.on('unhandledRejection', (reason, location) => {
  console.error('Unhandled Rejection at:', location, 'reason:', reason)
})
