const loki = require('lokijs')
const db = new loki()

const sockets = db.addCollection('sockets', { unique: ['type'] })

module.exports = sockets
