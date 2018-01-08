'use strict'
const config = require(__dirname + '/src/config')

const getWither = require(__dirname + '/src/modules/wither')
const getShedule = require(__dirname + '/src/modules/shedule')
const twitch = require(__dirname + '/src/modules/twitch')

const {
  VK
} = require('vk-io')
const vk = new VK()
const {
  updates
} = vk

vk.setToken(config.get('access_token_anton'))
vk.setOptions({
  /* Optimize the number of requests per second  */
  call: 'execute'
})

updates.use(async(context, next) => {
  try {
    if (context.is('message') && !context.isOutbox()) {
      console.log(`Сообщение от ${context.from.id} с типом  ${context.from.type}  `)
    }
    await next()
  } catch (error) {
    context.send('Ooops... Произошла ошибка 😌')
    console.error('Error:', error)
  }
})

updates.hear('/time', async(context) => {
  await context.send((new Date()).toString())
})
updates.hear('/random', async(context) => {
  await context.send(Math.random())
})
updates.hear(['/погода', /^\/погода ([\- a-zA-Z0-9А-Яа-я]+)/iu], async(context) => {
  if (context.$match) {
    console.info('Собираюсь узнавать погоду для ' + context.$match[1])
    await context.send(await getWither(1, context.$match[1]))
  } else {
    console.info('Собираюсь узнавать погоду для Пензы')
    await context.send(await getWither(0))
  }
  console.info('Узнал и отправил погоду')
})
updates.hear(['/дз', '/homework'], async(context) => {
  await context.send(await getShedule(1))
})
updates.hear(['/дз на сегодня'], async(context) => {
  await context.send(await getShedule(0))
})
updates.hear(['/update'], async(context) => {
  if (context.isDM()) {
    console.info('Начал обновление стримеров')
    await twitch.updateStreamers()
    console.info('Закончил обновление стримеров')
    context.send('Ну я это.. Обновил :) ')
  }
})

updates.hear(/^\/reverse (.+)/i, async(context) => {
  const text = context.$match[1]

  const reversed = text.split('').reverse().join('')

  await context.send(reversed)
})

updates.on('message', async(context, next) => {
  if (typeof context.text === 'string' && context.text.search(/^[a-zA-Z]+$/) != -1 && context.isOutbox()) {
    console.log('Проверка на эмоции')
    let url = twitch.getUrl(context.text)
    console.log(url)
    if (typeof url === 'string') context.sendPhoto(url)
  }
  await next()
})

async function run () {
  await vk.updates.startPolling()

  console.log('Polling started')
}

run().catch(console.error)
