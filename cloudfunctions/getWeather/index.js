const cloud = require('wx-server-sdk')
const https = require('https')
const zlib = require('zlib')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

/**
 * 天气云函数
 *
 * 环境变量（和风 Console V4）：
 * - QWEATHER_KEY   = API KEY（凭据页复制）
 * - QWEATHER_HOST  = 专属 API Host，如 abc123.def.qweatherapi.com（设置页复制，不要 https://）
 * - DEFAULT_CITY   = 默认城市，如「宣城」
 *
 * 文档：https://dev.qweather.com/docs/configuration/api-host/
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

function getJson(host, path, key) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: host,
        path,
        method: 'GET',
        headers: {
          'X-QW-Api-Key': key,
          Accept: 'application/json',
          'Accept-Encoding': 'gzip'
        }
      },
      (resp) => {
        const chunks = []
        resp.on('data', (chunk) => chunks.push(chunk))
        resp.on('end', () => {
          const buf = Buffer.concat(chunks)
          const encoding = (resp.headers['content-encoding'] || '').toLowerCase()
          const done = (raw) => {
            const text = raw.toString('utf8').trim()
            if (resp.statusCode < 200 || resp.statusCode >= 300) {
              reject(new Error(`HTTP ${resp.statusCode}: ${text.slice(0, 120) || 'empty'}`))
              return
            }
            if (!text) {
              reject(new Error('empty response (check QWEATHER_HOST)'))
              return
            }
            try {
              resolve(JSON.parse(text))
            } catch (e) {
              reject(new Error(`invalid JSON: ${text.slice(0, 120)}`))
            }
          }
          if (encoding.includes('gzip')) zlib.gunzip(buf, (err, out) => (err ? reject(err) : done(out)))
          else done(buf)
        })
      }
    )
    req.on('error', reject)
    req.end()
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

function normalizeHost(raw) {
  return String(raw || '')
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
}

async function fetchQWeather(city, key, host) {
  const geoPath = `/geo/v2/city/lookup?location=${encodeURIComponent(city)}&number=5`
  const geo = await getJson(host, geoPath, key)
  if (geo.code && geo.code !== '200') {
    throw new Error(`geo ${geo.code}: ${(geo.error && geo.error.detail) || 'lookup failed'}`)
  }
  const loc = geo && geo.location && geo.location[0]
  if (!loc) throw new Error('city not found')

  const weatherPath = `/v7/weather/now?location=${loc.id}`
  const weather = await getJson(host, weatherPath, key)
  if (weather.code && weather.code !== '200') {
    throw new Error(`weather ${weather.code}: ${(weather.error && weather.error.detail) || 'now failed'}`)
  }
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
  const host = normalizeHost(process.env.QWEATHER_HOST)

  if (!key) return fallback(city)
  if (!host) {
    return {
      ...fallback(city),
      warning: 'missing QWEATHER_HOST (copy from QWeather console → Settings)'
    }
  }

  try {
    return await fetchQWeather(city, key, host)
  } catch (e) {
    console.warn('getWeather failed', e)
    return { ...fallback(city), warning: String(e && e.message) }
  }
}
