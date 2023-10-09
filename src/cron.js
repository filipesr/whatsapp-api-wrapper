const schedule = require('node-schedule')
const axios = require('axios') // legacy way
const { apiURL, sendNextApiKey, globalApiKey, serverPort } = require('./config')
// const { sessions } = require('./sessions')
const { delay } = require('./utils')

const DEBUG = true

const urlGetMessage = (idAgent) => `${apiURL}/message/getnext/${sendNextApiKey}/${idAgent}`
const urlSetMessageStatus = (id, status) => `${apiURL}/status/getnext/${sendNextApiKey}/${id}/${status}`
const urlAgentStatus = (idAgent) => `http://localhost:${serverPort}/session/status/${idAgent}`
const urlSendMessage = (idAgent) => `http://localhost:${serverPort}/client/sendMessage/${idAgent}`

// const callUrl = async (url) => axios.get(url).then((response) => console.log(response?.data?.data ?? ''))
// const sendNext = async () => callUrl('https://sendgo-api.vercel.app/message/sendnext/oupuXQrm5Vc6u6qBSV2KWatY9UoLmSaj')

const callGetAgentStatus = async (idAgent) => {
  await axios
    .request({ method: 'GET', url: urlAgentStatus(idAgent), headers: { 'x-api-key': globalApiKey } })
    .then((data) => {
      if (DEBUG) console.debug({ date: Date.now(), idAgent, data })
      return data?.message === 'Session initialized!'
    })
    .catch((error) => {
      if (DEBUG) console.debug({ date: Date.now(), idAgent, error })
      return false
    })
}

const callGetMessage = async (idAgent) => await axios
  .get(urlGetMessage(idAgent))
  .then(({ data }) => data)
  .catch((error) => {
    if (DEBUG) console.debug({ date: Date.now(), idAgent, error })
    return false
  })
const callSendMessage = async (idAgent, chatId, content, contentType = 'string') => {
  if (DEBUG) console.log(Date.now(), `[${idAgent}]: sending message "${content}"`)
  const options = {
    method: 'POST',
    url: urlSendMessage(idAgent),
    headers: { 'x-api-key': globalApiKey, 'Content-Type': 'application/json' },
    data: { chatId: `${chatId}@g.us`, contentType, content }
  }
  return await axios
    .request(options)
    .then(({ success }) => success ?? false)
    .catch((error) => {
      if (DEBUG) console.debug({ date: Date.now(), idAgent, error })
      return false
    })
}
const callSetMessageStatus = (id, status) => axios.get(urlSetMessageStatus(id, status))

const getNextMessageAndSend = async (idAgent) => {
  if (!await callGetAgentStatus(idAgent)) {
    if (DEBUG) console.log(Date.now(), `Agent ${idAgent}...`)
    return false
  }
  if (DEBUG) console.log(Date.now(), `Runing sendNext on agent ${idAgent}...`)
  const { data } = await callGetMessage(idAgent)
  const message = data?.message ?? false
  if (!message) {
    if (DEBUG) console.log(Date.now(), `[${idAgent}]: agent indisponible or without message - ${data}`)
    return false
  }

  const { id, texts, phone, timeToWait } = message

  texts.forEach(async (content) => {
    const success = await callSendMessage(idAgent, `${phone}@c.us`, content).then(({ success }) => success ?? false)
    if (!success) {
      callSetMessageStatus(id, 'error')
      if (DEBUG) console.log(Date.now(), `[${idAgent}]: ERROR: on send message ${id}`)
      return false
    } else {
      await delay(timeToWait)
    }
  })

  callSetMessageStatus(id, 'sent')
  return true
}

const createSchedule = (idAgent) => {
  console.log(`Agent ${idAgent} scheduled...`)
  return schedule.scheduleJob({ rule: '*/5 * * * * *' }, async () => getNextMessageAndSend(idAgent))
}

module.exports = {
  createSchedule
}
