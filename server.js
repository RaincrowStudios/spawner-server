'use strict'

const net = require('net')
const spawner = require('./spawner/spawner')
const port = process.env.NODE_ENV === 'development' ? 8083 : 80

const server = net.createServer(socket => {
  socket.on('data', data => {
    console.log('data recieved')
    //manager(JSON.parse(data))
  })

  socket.on('error', err => {
    console.log('ERRROR')
    console.error(err)
  })
})

server.listen(port)

process.on('unhandledRejection', (reason, location) => {
  console.error('Unhandled Rejection at:', location, 'reason:', reason)
})
