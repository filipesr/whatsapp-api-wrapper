const schedule = require('node-schedule')
const axios = require('axios') // legacy way
const { apiURL, sendNextApiKey } = require('./config')
const { sessions } = require('./sessions')
const { delay } = require('./utils')

const urlGetMessage = (idAgent) => `${apiURL}/message/getnext/${sendNextApiKey}/${idAgent}`
const urlSetMessageStatus = (id, status) => `${apiURL}/status/getnext/${sendNextApiKey}/${id}/${status}`

// const callUrl = async (url) => axios.get(url).then((response) => console.log(response?.data?.data ?? ''))
// const sendNext = async () => callUrl('https://sendgo-api.vercel.app/message/sendnext/oupuXQrm5Vc6u6qBSV2KWatY9UoLmSaj')

const callGetMessage = async (idAgent) => await axios.get(urlGetMessage(idAgent))
const sendMessage = async (client, chatId, content) => {
  const message = await client.sendMessage(chatId, content, null)
  return { success: true, message }
}
const callSetMessageStatus = async (id, status) => await axios.get(urlSetMessageStatus(id, status))

const sendNext = async (idAgent) => {
  // console.log(`Runing sendNext on agent ${idAgent}...`)
  const { message } = await callGetMessage(idAgent)
  if (!message) return false
  const { id, texts, phone, timeToWait } = message
  const client = sessions.get(idAgent)

  texts.forEach(async (content) => {
    const { success } = await sendMessage(client, `${phone}@c.us`, content)
    if (!success) {
      callSetMessageStatus(id, 'error')
      console.log(`ERROR: on send message ${id}`)
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
  return schedule.scheduleJob({ rule: '*/5 * * * * *' }, () => sendNext(idAgent))
}

module.exports = {
  createSchedule
}
