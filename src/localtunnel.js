const localtunnel = require('localtunnel')

const createTunnel = async (port) => {
  const host = 'https://localtunnel.me'
  const subdomain = 'whatsapp-api-wrapper'
  const tunnel = await localtunnel({ port, host, subdomain })
  console.log('tunnel on', tunnel.url)

  tunnel.on('close', () => {
    console.log('tunnel closed')
  })
}

module.exports = createTunnel
