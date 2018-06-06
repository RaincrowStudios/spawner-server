'use strict'

const cluster = require('cluster')
const http = require('http')
const spawner = require('./spawner/spawner')
const port = process.env.NODE_ENV === 'development' ? 8083 : 80

const numCPUs = require('os').cpus().length

if (cluster.isMaster) {
  console.log('Starting Spawning Server...')
  console.log(`Master ${process.pid} is running`)

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`)
    cluster.fork()
  })
}
else {
  const server = http.createServer().listen(port)

  server.on('request', function(req, res){
    if(req.method == 'POST') {
      req.on('data', function (data) {
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
}

process.on('unhandledRejection', (reason, location) => {
  console.error('Unhandled Rejection at:', location, 'reason:', reason)
})
