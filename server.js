'use strict'

const http = require('http')
const spawner = require('./spawner/spawner')
const port = process.env.NODE_ENV === 'development' ? 8083 : 80

const server = http.createServer().listen(port)

server.on('request', function(req, res){
  if (req.method === 'POST') {
    req.on('data', data => {
      spawner(JSON.parse(data))

      res.writeHead(200)
      res.write('OK')
      res.end()
    })
  }
  else {
    res.writeHead(405)
    res.end()
  }
})

process.on('unhandledRejection', (reason, location) => {
  console.error('Unhandled Rejection at:', location, 'reason:', reason)
})
