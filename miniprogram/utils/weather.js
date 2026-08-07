/**
 * 天气 + 穿衣建议
 * 演示模式用本地假数据；真实模式走云函数 getWeather
 */

const CLOTHING_RULES = [
  { max: 5, advice: '今天很冷，厚外套、围巾都带上，别冻着。' },
  { max: 12, advice: '有点凉，记得加一件外套再出门。' },
  { max: 18, advice: '薄外套刚刚好，别穿太少。' },
  { max: 25, advice: '不冷不热，轻便衣服就行，记得防晒。' },
  { max: 32, advice: '有点热，穿凉快一点，多喝水。' },
  { max: 99, advice: '天热要注意中暑，尽量待阴凉处。' }
]

function clothingAdvice(tempC) {
  const t = Number(tempC)
  if (Number.isNaN(t)) return '今天也要好好照顾自己。'
  const hit = CLOTHING_RULES.find((r) => t <= r.max)
  return (hit && hit.advice) || CLOTHING_RULES[CLOTHING_RULES.length - 1].advice
}

function mockWeather() {
  // 按日期轻微变化，演示稳定可复现
  const day = new Date().getDate()
  const temps = [8, 12, 16, 21, 26, 30, 14]
  const texts = ['多云', '晴', '阴', '小雨', '晴间多云', '热', '凉爽']
  const temp = temps[day % temps.length]
  const text = texts[day % texts.length]
  return {
    city: '家里这座城',
    temp,
    text,
    advice: clothingAdvice(temp),
    source: 'demo'
  }
}

async function fetchWeather(city) {
  const resolvedCity = city || wx.getStorageSync('weatherCity') || ''
  try {
    const app = getApp()
    if (!app || app.globalData.demoMode || !app.globalData.cloudReady) {
      const mock = mockWeather()
      if (resolvedCity) mock.city = resolvedCity
      return mock
    }
    const res = await wx.cloud.callFunction({
      name: 'getWeather',
      data: { city: resolvedCity }
    })
    const data = (res && res.result) || {}
    if (!data.ok) return mockWeather()
    return {
      city: data.city || resolvedCity || '本地',
      temp: data.temp,
      text: data.text || '',
      advice: data.advice || clothingAdvice(data.temp),
      source: 'cloud'
    }
  } catch (e) {
    console.warn('fetchWeather fallback mock', e)
    const mock = mockWeather()
    if (resolvedCity) mock.city = resolvedCity
    return mock
  }
}

module.exports = {
  clothingAdvice,
  mockWeather,
  fetchWeather
}
