const schedule = require('node-schedule')
const axios = require('axios') // legacy way
const { apiURL, sendNextApiKey } = require('./config')
const { sessions } = require('./sessions')
const { delay } = require('./utils')

const urlGetMessage = (idAgent) => `${apiURL}/message/getnext/${sendNextApiKey}/${idAgent}`
const urlSetMessageStatus = (id, status) => `${apiURL}/status/getnext/${sendNextApiKey}/${id}/${status}`

// const callUrl = async (url) => axios.get(url).then((response) => console.log(response?.data?.data ?? ''))
// const sendNext = async () => callUrl('https://sendgo-api.vercel.app/message/sendnext/oupuXQrm5Vc6u6qBSV2KWatY9UoLmSaj')

const callGetMessage = async (idAgent) => await axios.get(urlGetMessage(idAgent)).then(({ data }) => data)
const sendMessage = async (client, chatId, content) => {
  const message = await client.sendMessage(chatId, content, null)
  return { success: true, message }
}
const callSetMessageStatus = async (id, status) => await axios.get(urlSetMessageStatus(id, status))

const getNextMessageAndSend = async (idAgent, send) => {
  if (!sessions || !sessions.has(idAgent)) return false
  // const { message } = await callGetMessage(idAgent)
  const { data } = await callGetMessage(idAgent)
  console.debug({ data, text: data.text, message: data.message })
  console.log(Date.now(), `Runing sendNext on agent ${idAgent}...`)
  const message = data?.message ?? false
  if (!message) {
    console.log(Date.now(), `${idAgent}: ${data}`)
    return false
  }

  const { id, texts, phone, timeToWait } = message
  const client = send ? sessions.get(idAgent) : null

  texts.forEach(async (content) => {
    const success = send ? await sendMessage(client, `${phone}@c.us`, content).then(({ success }) => success) : true
    if (!success) {
      callSetMessageStatus(id, 'error')
      console.log(`ERROR: on send message ${id}`)
      return false
    } else {
      await delay(timeToWait)
    }
  })

  callSetMessageStatus(id, send ? 'sent' : 'pending')
  return true
}

const createSchedule = (idAgent, send = true) => {
  console.log(`Agent ${idAgent} scheduled...`)
  return schedule.scheduleJob({ rule: '*/5 * * * * *' }, async () => getNextMessageAndSend(idAgent, send))
}

module.exports = {
  createSchedule
}
