const app = require('./src/app')
const { baseWebhookURL, serverPort } = require('./src/config')
const createTunnel = require('./src/localtunnel')

// Check if BASE_WEBHOOK_URL environment variable is available
if (!baseWebhookURL) {
  console.error('BASE_WEBHOOK_URL environment variable is not available. Exiting...')
  process.exit(1) // Terminate the application with an error code
}

app.listen(serverPort, () => {
  console.log(`Server running on port ${serverPort}`)
  createTunnel(serverPort)
})
