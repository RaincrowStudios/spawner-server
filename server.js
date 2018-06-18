'use strict'

const net = require('net')
const createRedisClients = require('./redis/createRedisClients')
const spawner = require('./spawner/spawner')
const createManagerClient = require('./utils/createManagerClient')
const port = process.env.NODE_ENV === 'development' ? 8083 : 8080

async function startup() {
  console.log('Starting Spawner...')
  await Promise.all([
    createRedisClients(),
    createManagerClient(),
  ])
}

startup()

const server = net.createServer(socket => {
  socket.on('data', data => {
    spawner(JSON.parse(data))
  })

  socket.on('error', err => {
    console.error(err)
  })
})

server.listen(port)

process.on('unhandledRejection', (reason, location) => {
  console.error('Unhandled Rejection at:', location, 'reason:', reason)
})
