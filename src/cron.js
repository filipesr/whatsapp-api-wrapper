const schedule = require('node-schedule')
const axios = require('axios') // legacy way
const { apiURL, sendNextApiKey, globalApiKey, serverPort } = require('./config')
// const { sessions } = require('./sessions')
const { delay } = require('./utils')

const DEBUG = true
const urlZapServer = `http://localhost:${serverPort}`
// const urlZapServer = 'https://whatsapp-api-wrapper.loca.lt'

const urlGetMessage = (idAgent) => `${apiURL}/message/getnext/${sendNextApiKey}/${idAgent}`
const urlAgentStatus = (idAgent) => `${urlZapServer}/session/status/${idAgent}`
const urlSendMessage = (idAgent) => `${urlZapServer}/client/sendMessage/${idAgent}`

// const callUrl = async (url) => axios.get(url).then((response) => console.log(response?.data?.data ?? ''))
// const sendNext = async () => callUrl('https://sendgo-api.vercel.app/message/sendnext/oupuXQrm5Vc6u6qBSV2KWatY9UoLmSaj')

const callGetAgentStatus = async (idAgent) =>
  await axios
    .request({ method: 'GET', url: urlAgentStatus(idAgent), headers: { 'x-api-key': globalApiKey } })
    .then(({ data }) => {
      // if (DEBUG) console.log({ date: Date.now(), idAgent, data })
      return data
    })
    .then(({ message }) => message === 'Session initialized!')
    .catch((error) => {
      if (DEBUG) console.error({ date: Date.now(), idAgent, error })
      return false
    })

const callGetMessage = async (idAgent) =>
  axios
    .get(urlGetMessage(idAgent))
    .then(({ data }) => data)
    .catch((error) => {
      if (DEBUG) console.error({ date: Date.now(), idAgent, error })
      return false
    })

const callSendMessage = async (idAgent, chatId, content, contentType = 'string') => {
  if (DEBUG) console.log(Date.now(), `[${idAgent}]: sending message "${content}"`)
  const options = {
    method: 'POST',
    url: urlSendMessage(idAgent),
    headers: { 'x-api-key': globalApiKey, 'Content-Type': 'application/json' },
    data: { chatId, contentType, content }
  }
  return await axios
    .request(options)
    .then(({ data }) => {
      // if (DEBUG) console.log({ date: Date.now(), idAgent, data })
      return data
    })
    .then(({ success }) => success ?? false)
    .catch((error) => {
      if (DEBUG) console.error({ date: Date.now(), idAgent, error })
      return false
    })
}
const callSetMessageStatus = async (id, status) => {
  const options = {
    method: 'POST',
    url: `${apiURL}/message/status`,
    headers: { 'Content-Type': 'application/json' },
    data: { sendnext_key: sendNextApiKey, id, status }
  }
  // if (DEBUG) console.log(Date.now(), `Changing status of message ${id} to ${status}...`)
  return await axios
    .request(options)
    .then(({ data }) => {
      // if (DEBUG) console.log({ date: Date.now(), id, data })
      return data
    })
    .then(({ error }) => !error)
    .catch((error) => {
      if (DEBUG) console.error({ date: Date.now(), id, error })
      return false
    })
}

const getNextMessageAndSend = async (idAgent) => {
  if (!await callGetAgentStatus(idAgent)) {
    if (DEBUG) console.log(Date.now(), `Agent ${idAgent}...`)
    return false
  }
  // if (DEBUG) console.log(Date.now(), `Runing sendNext on agent ${idAgent}...`)
  const { data } = await callGetMessage(idAgent)
  const message = data?.message ?? false
  if (!message) {
    // if (DEBUG) console.log(Date.now(), `[${idAgent}]: agent indisponible or without message - ${data}`)
    return false
  }
  const { id, texts, phone, timeToWait } = message
  // const { id, texts, timeToWait } = message
  // const phone = '5528999094076'

  if (DEBUG) console.log(Date.now(), `[${idAgent}]: Sending message ${id}...`, message, texts)
  for (let i = 0; i < texts.length; i++) {
    const content = texts[i]

    const success = await callSendMessage(idAgent, `${phone}@c.us`, content)
    if (!success) {
      await callSetMessageStatus(id, 'error')
      if (DEBUG) console.log(Date.now(), `[${idAgent}]: ERROR: on send message ${id}`)
      return false
    } else {
      await delay(timeToWait)
    }
  }

  await callSetMessageStatus(id, 'sent')
  if (DEBUG) console.log(Date.now(), `[${idAgent}]: Message ${id} sent`)
  return true
}

const createSchedule = (idAgent) => {
  console.log(`Agent ${idAgent} scheduled...`)
  return schedule.scheduleJob({ rule: '*/5 * * * * *' }, async () => getNextMessageAndSend(idAgent))
  // getNextMessageAndSend(idAgent)
  // return { idAgent, message: 'testing' }
}

const testMessage = async (idAgent) => {
  // const phone = '5528999094076'
  // const text = 'teste'
  const idMessage = '6521810076f0d0c143465a32'
  console.log(idMessage, 'sent', await callSetMessageStatus(idMessage, 'sent'))
  console.log(idMessage, 'sent', await callSetMessageStatus(idMessage, 'sent'))
  console.log(idMessage, 'pending', await callSetMessageStatus(idMessage, 'pending'))
  // for (let i = 0; i < 3; i++) {
  //   const content = `${text} ${i}...`
  //   await delay(3 * i)
  //   console.log(`Sending ${content}...`)
  //   await callSendMessage(idAgent, `${phone}@c.us`, content)
  // }
}

module.exports = {
  createSchedule,
  testMessage
}
