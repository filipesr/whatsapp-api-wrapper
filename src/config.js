// Load environment variables from .env file
require('dotenv').config()

// setup global const
const sessionFolderPath = process.env.SESSIONS_PATH || './sessions'
const enableLocalCallbackExample = process.env.ENABLE_LOCAL_CALLBACK_EXAMPLE === 'TRUE'
const globalApiKey = process.env.API_KEY
const sendNextApiKey = process.env.SENDNEXT_KEY
const apiURL = process.env.API_URL
const tunnelSUBDOMAIN = process.env.TUNNEL_SUBDOMAIN
const webhookURL = `${apiURL}/webhook`
const maxAttachmentSize = parseInt(process.env.MAX_ATTACHMENT_SIZE) || 10000000
const setMessagesAsSeen = process.env.SET_MESSAGES_AS_SEEN === 'TRUE'
const disabledCallbacks = process.env.DISABLED_CALLBACKS ? process.env.DISABLED_CALLBACKS.split('|') : []
const serverPort = process.env.PORT || 3001
const chromeBin = process.env.CHROME_BIN || null

const config = {
  sessionFolderPath,
  enableLocalCallbackExample,
  globalApiKey,
  apiURL,
  tunnelSUBDOMAIN,
  sendNextApiKey,
  webhookURL,
  maxAttachmentSize,
  setMessagesAsSeen,
  disabledCallbacks,
  serverPort,
  chromeBin
}

// console.debug({ config })

module.exports = config
