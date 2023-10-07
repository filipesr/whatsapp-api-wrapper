const localtunnel = require('localtunnel')
const { tunnelSUBDOMAIN } = require('./config')

const createTunnel = async (port) => {
  const host = 'https://localtunnel.me'
  const subdomain = tunnelSUBDOMAIN || 'goon-dev'
  const tunnel = await localtunnel({ port, host, subdomain })
  console.log('tunnel on', tunnel.url)

  tunnel.on('close', () => {
    console.log('tunnel closed')
  })

  tunnel.once('connection', () => {
    console.log('tunnel opened')
  })
}

module.exports = createTunnel
