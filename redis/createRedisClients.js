const ping = require('ping')
const redis = require('redis')
const ips = require('../config/region-ips')
const clients = require('../database/clients')

module.exports = () => {
  return new Promise((resolve, reject) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        const client = redis.createClient(
          6379,
          'localhost'
        )

        client.on('ready', () => {
          clients.insert({region: 'local', client: client})
        })

        client.on('error', (err) => {
          const clientToRemove = clients.by('client', client)
          clients.remove(clientToRemove)
          console.error(err)
        })
      }
      else {
        Object.keys(ips).forEach(region => {
          const host = '10.' + ips[region] + '.1.255'
          ping.sys.probe(host, (isAlive) => {
            if (isAlive) {
              const client = redis.createClient(
                6379,
                host
              )

              client.on('ready', () => {
                clients.insert({region: region, client: client})
              })

              client.on('error', (err) => {
                const clientToRemove = clients.by('client', client)
                clients.remove(clientToRemove)
                console.error(err)
              })
            }
          })
        })
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
