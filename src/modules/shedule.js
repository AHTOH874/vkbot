const shuffle = require('shuffle-array')
var config = require('../config')
let requestAsync = require('request-promise')
var authorized = false

var cookiejar = requestAsync.jar()
async function getJson (day) {
  if (!authorized) await auth()
  try {
    let json = await requestAsync({
      uri: 'https://uko.edu-penza.ru/api/HomeworkService/GetHomeworkFromRange?date=' + day, // + new Date().toLocaleDateString(),
      method: 'GET',
      jar: cookiejar,
      json: true,
      simple: false,
      resolveWithFullResponse: true
    })

    return json.body
  } catch (e) {
    console.log(e)
  }
}
async function auth () {
  console.info(`начал авторизацию`)
  try {
    let body = await requestAsync({
      uri: 'https://uko.edu-penza.ru/auth/login',
      qs: {
        login_login: config.get('Uko_Login'),
        login_password: config.get('Uko_Password')
      },
      jar: cookiejar,
      simple: false,
      resolveWithFullResponse: true,
      followAllRedirects: true,
      json: true
    })
    await requestAsync({
      uri: 'https://uko.edu-penza.ru/',
      jar: cookiejar,
      simple: false,
      resolveWithFullResponse: true,
      followAllRedirects: true
    })
    await requestAsync({
      uri: 'https://uko.edu-penza.ru/personal-area',
      jar: cookiejar,
      simple: false,
      resolveWithFullResponse: true,
      followAllRedirects: true
    })
    if (body.statusCode !== 302 && body.statusCode == 200) {
      authorized = false
      console.info(`not authorized :( `)
    } else {
      authorized = true
      console.info(`authorized `)
    }
  } catch (e) {
    console.error(e)
  }
}

module.exports = async function (type) {
  let parsed = ''

  switch (type) {
    case 0:
      let day = new Date().toISOString().slice(0, 10)
      let res1 = await getJson(day)
      parsed = getHomeworksForDay(res1, day)
      break
    case 1:
      let nextday = nextDay().toISOString().slice(0, 10)
      let res2 = await getJson(nextday)
      parsed = getHomeworksForDay(res2, nextday)
      break
  }
  return parsed
}

function getHomeworksForDay (array, date) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].date == date) {
      if (array[i].homeworks.length > 0) {
        let out = ''
        for (let a = 0; a < array[i].homeworks.length; a++) {
          out += (a + 1) + '. ' + array[i].homeworks[a].discipline + ' -  ' +
                        array[i].homeworks[a].homework + '\n'
        }
        return out
      } else {
        return 'выходной'
      }
      break
    }
  }
}

function nextDay () {
  let today = new Date()
  let tomorrow = new Date(today.getTime() + 86400000)
  return tomorrow
}

function parseLesson (obj) {
  if (r.homeworks.length > 0) {
    console.log(obj.homeworks)
    let out = ''
    for (let i = 0; i < obj.homeworks.lessons.length; i++) {
      var smile = shuffle.pick(['😄', '😉', '😌', '🙂', '😗', '😙', '😚', '😏', '😸', '🐱', '🐱', '🐭', '🐭', '🌚', '🌞', '🌞', '🌝', '😘', '😊', '✨'])
      out += obj.lessons[i].discipline + ' ' + smile + '\n'
    }
    return out
  } else {
    return 'выходной'
  }
}
