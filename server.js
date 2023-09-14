const app = require('./src/app')
const { webhookURL, serverPort } = require('./src/config')
const createTunnel = require('./src/localtunnel')

// Check if WEBHOOK_URL environment variable is available
if (!webhookURL) {
  console.error('WEBHOOK_URL environment variable is not available. Exiting...')
  process.exit(1) // Terminate the application with an error code
}

app.listen(serverPort, () => {
  console.log(`Server running on port ${serverPort}`)
  createTunnel(serverPort)
})
