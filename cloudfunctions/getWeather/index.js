const cloud = require('wx-server-sdk')
const https = require('https')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

/**
 * 天气云函数
 *
 * 配置：
 * - 环境变量 QWEATHER_KEY = 和风天气 Key（可选）
 * - 环境变量 DEFAULT_CITY = 默认城市，如「北京」
 * - 未配置 Key 时返回温和假数据，保证演示不挂
 *
 * 文档：https://dev.qweather.com/
 */

function clothingAdvice(tempC) {
  const t = Number(tempC)
  if (Number.isNaN(t)) return '今天也要好好照顾自己。'
  if (t <= 5) return '今天很冷，厚外套、围巾都带上，别冻着。'
  if (t <= 12) return '有点凉，记得加一件外套再出门。'
  if (t <= 18) return '薄外套刚刚好，别穿太少。'
  if (t <= 25) return '不冷不热，轻便衣服就行，记得防晒。'
  if (t <= 32) return '有点热，穿凉快一点，多喝水。'
  return '天热要注意中暑，尽量待阴凉处。'
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (resp) => {
        let data = ''
        resp.on('data', (chunk) => {
          data += chunk
        })
        resp.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            reject(e)
          }
        })
      })
      .on('error', reject)
  })
}

function fallback(city) {
  const day = new Date().getDate()
  const temps = [8, 12, 16, 21, 26, 30, 14]
  const texts = ['多云', '晴', '阴', '小雨', '晴间多云', '热', '凉爽']
  const temp = temps[day % temps.length]
  return {
    ok: true,
    city: city || '家里这座城',
    temp,
    text: texts[day % texts.length],
    advice: clothingAdvice(temp),
    source: 'fallback'
  }
}

async function fetchQWeather(city, key) {
  const geoUrl = `https://geoapi.qweather.com/v2/city/lookup?location=${encodeURIComponent(
    city
  )}&key=${key}`
  const geo = await getJson(geoUrl)
  const loc = geo && geo.location && geo.location[0]
  if (!loc) throw new Error('city not found')

  const weatherUrl = `https://devapi.qweather.com/v7/weather/now?location=${loc.id}&key=${key}`
  const weather = await getJson(weatherUrl)
  const now = weather && weather.now
  if (!now) throw new Error('weather empty')

  const temp = Number(now.temp)
  return {
    ok: true,
    city: loc.name || city,
    temp,
    text: now.text || '',
    advice: clothingAdvice(temp),
    source: 'qweather'
  }
}

exports.main = async (event) => {
  const city = (event && event.city) || process.env.DEFAULT_CITY || '北京'
  const key = process.env.QWEATHER_KEY || ''

  if (!key) return fallback(city)

  try {
    return await fetchQWeather(city, key)
  } catch (e) {
    console.warn('getWeather failed', e)
    return { ...fallback(city), warning: String(e && e.message) }
  }
}
