var request = require('request-promise')
// 11106 serdobsk
var config = require('../config')
var headers = config.get('Yandex_Headers') /// @Georgiy_D , thanks for headers :)))
module.exports = async function (needSearch, string) {
  if (needSearch) {
    let geoid = await request({
      url: 'https://api.weather.yandex.ru/v1/locations?lang=ru_RU',
      headers: headers,
      method: 'GET',
      json: true
    })
    let unknown = await request({
      url: 'https://api.weather.yandex.ru/v1/forecast?ext_kind=weather&lang=ru_RU&geoid=' + searchGeoid(geoid, string),
      headers: headers,
      method: 'GET',
      json: true
    })
    if (unknown) {
      return output(unknown)
    } else {
      return 'Ooops... Произошла ошибка 😌'
    }
  } else {
    let my_json = await request({
      url: 'https://api.weather.yandex.ru/v1/forecast?ext_kind=weather&lang=ru_RU&geoid=49',
      headers: headers,
      method: 'GET',
      json: true
    })

    if (my_json) {
      return output(my_json)
    } else {
      return 'Ooops... Произошла ошибка 😌'
    }
  }
}

function translate (word) {
  var super_translate = {
    'clear': 'Ясно',
    'mostly-clear': 'Малооблачно',
    'partly-cloudy': 'Малооблачно',
    'overcast': 'Пасмурно',
    'partly-cloudy-and-light-rain': 'Небольшой дождь',
    'partly-cloudy-and-rain': 'Дождь',
    'overcast-and-rain': 'Сильный дождь',
    'overcast-thunderstorms-with-rain': 'Сильный дождь, гроза',
    'cloudy': 'Облачно с прояснениями',
    'cloudy-and-light-rain': 'Небольшой дождь',
    'overcast-and-light-rain': 'Небольшой дождь',
    'cloudy-and-rain': 'Дождь',
    'overcast-and-wet-snow': 'Дождь со снегом',
    'partly-cloudy-and-light-snow': 'Небольшой снег',
    'partly-cloudy-and-snow': 'Снег',
    'overcast-and-snow': 'Снегопад',
    'cloudy-and-light-snow': 'Небольшой снег',
    'overcast-and-light-snow': 'Небольшой снег',
    'cloudy-and-snow': 'Снег',
    'full-moon': 'Полнолуние',
    'decreasing-moon': 'Убывающая луна',
    'last-quarter': 'Последняя четверть',
    'new-moon': 'Новолуние',
    'growing-moon': 'Растущая луна',
    'first-quarter': 'Первая четверть'
  }

  try {
    let smysol = super_translate[word]
    return smysol
  } catch (e) {
    return word
  }
}

function searchGeoid (arr, name) {
  name = name.toLowerCase()
  for (let i = 0; i < arr.length; i++) {
    let string = arr[i].name
    if (string.toLowerCase() == name) {
      return arr[i].geoid
      break
    }
  }
}

function output (json) {
  // console.log(my_json)
  let sunset = json['forecasts'][0]['sunset']
  let sunrise = json['forecasts'][0]['sunrise']
  let parts = json['forecasts'][0]['parts']
  let city = json['geo_object']['locality']['name']

  let now = json['fact']
  let temp = now['temp'].toString() + '°C'
  let feels = now['feels_like'].toString() + '°C'
  let wind_speed = now['wind_speed'].toString() + ' м/с'
  let humidity = now['humidity'].toString() + '%'
  let pressure_mm = now['pressure_mm'].toString() + ' мм рт. ст.'
  let morning = parts['morning']['temp_avg'].toString() + '°C'
  let day = parts['day']['temp_avg'].toString() + '°C'
  let evening = parts['evening']['temp_avg'].toString() + '°C'
  let description = translate(now['condition'].toString())
  let formatting_parts = '\nУтро: ' + morning + '\nДень: ' + day + '\nВечер: ' + evening
  let formatting_set = '\nВосход: ' + sunrise + '\nЗакат: ' + sunset
  let out = city + '\n' + description + '\nСейчас: ' + temp + '\nПо ощущениям: ' + feels + '\nСкорость ветра: ' + wind_speed + '\nВлажность: ' + humidity + '\nДавление: ' + pressure_mm + '\n' + formatting_parts + '\n' + formatting_set
  return out
}
