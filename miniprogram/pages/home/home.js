const { fetchDailyLine, fetchHomeStats } = require('../../utils/cloud')
const { daysBetween } = require('../../utils/date')
const { fetchWeather } = require('../../utils/weather')
const { refreshTimelineBadge } = require('../../utils/unread')

Page({
  data: {
    demoMode: true,
    fontClass: 'font-larger',
    expression: 'idle',
    speaking: false,
    dailyLine: '妈，我在呢。',
    careLine: '妈，我在呢。',
    weatherText: '',
    companionDays: 1,
    voiceMonth: 0,
    transferMonth: 0
  },

  onShow() {
    this.syncAppState()
    this.loadHome()
    refreshTimelineBadge()
  },

  onHide() {
    this.stopGreet()
  },

  onUnload() {
    this.stopGreet()
  },

  syncAppState() {
    const app = getApp()
    const fontScale = app.globalData.fontScale || 'larger'
    this.setData({
      demoMode: !!app.globalData.demoMode,
      fontClass: fontScale === 'larger' ? 'font-larger' : '',
      companionDays: daysBetween(app.globalData.companionStartAt || Date.now())
    })
  },

  async loadHome() {
    try {
      const [dailyLine, stats, weather] = await Promise.all([
        fetchDailyLine(),
        fetchHomeStats(),
        fetchWeather()
      ])
      const weatherText = weather
        ? `${weather.city} · ${weather.text} ${weather.temp}°C`
        : ''
      // 优先穿衣关心；没有天气时回退今日一句
      const careLine = (weather && weather.advice) || dailyLine
      this.setData({
        dailyLine,
        careLine,
        weatherText,
        voiceMonth: stats.voiceMonth || 0,
        transferMonth: stats.transferMonth || 0
      })
    } catch (e) {
      console.warn(e)
    }
  },

  onExprChange(e) {
    this.setData({ expression: e.detail.expression })
  },

  onLongGreet() {
    if (this.data.speaking) {
      this.stopGreet()
      return
    }
    if (!this._greetAudio) {
      this._greetAudio = wx.createInnerAudioContext()
      this._greetAudio.src = '/assets/audio/demo-voice.wav'
      this._greetAudio.onEnded(() => this.setData({ speaking: false, expression: 'happy' }))
      this._greetAudio.onStop(() => this.setData({ speaking: false }))
      this._greetAudio.onError(() => {
        this.setData({ speaking: false })
        wx.showToast({ title: '问候语音暂不可用', icon: 'none' })
      })
    }
    this.setData({ speaking: true, expression: 'speak' })
    this._greetAudio.stop()
    this._greetAudio.play()
  },

  stopGreet() {
    if (this._greetAudio) this._greetAudio.stop()
    this.setData({ speaking: false })
  },

  goListen() {
    wx.switchTab({ url: '/pages/timeline/timeline' })
    wx.setStorageSync('timelineFilter', 'voice')
  },

  goTransfers() {
    wx.switchTab({ url: '/pages/timeline/timeline' })
    wx.setStorageSync('timelineFilter', 'transfer')
  }
})
