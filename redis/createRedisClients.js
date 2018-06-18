const ping = require('ping')
const redis = require('redis')
const production = require('../config/production')
const clients = require('../database/clients')
const ips = require('../config/region-ips')

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
          resolve(true)
        })

        client.on('error', (err) => {
          const clientToRemove = clients.by('client', client)
          clients.remove(clientToRemove)
          throw new Error(err)
        })
      }
      else {
        Object.keys(ips).forEach(region => {
          const host = ips[region] + production.redisAddress
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
                throw new Error(err)
              })
            }
          })
        })
        resolve(true)
      }
    }
    catch (err) {
      reject(err)
    }
  })
}
