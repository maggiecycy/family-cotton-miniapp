const { fetchDailyLine, fetchHomeStats } = require('../../utils/cloud')
const { daysBetween } = require('../../utils/date')
const { fetchWeather } = require('../../utils/weather')
const { refreshTimelineBadge } = require('../../utils/unread')
const { getHoliday } = require('../../utils/holiday')
const { getRole } = require('../../utils/auth')
const { saveImageToAlbum } = require('../../utils/permission')
const {
  getState,
  getLine,
  getAudio,
  nextStateKey,
  DEFAULT_KEY
} = require('../../utils/homeState')

Page({
  data: {
    demoMode: true,
    expression: DEFAULT_KEY,
    speaking: false,
    moodLabel: '默认',
    viewerRole: 'guest',
    dailyLine: '妈，我在呢。',
    careLine: '妈，我在呢。',
    weatherText: '',
    weatherAdvice: '',
    weatherSource: 'demo',
    weatherWarning: '',
    holidayName: '',
    holidayLine: '',
    textAnim: 'text-in',
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
    if (this._greetAudio) {
      this._greetAudio.destroy()
      this._greetAudio = null
    }
  },

  syncAppState() {
    const app = getApp()
    const viewerRole = getRole()
    this.setData({
      demoMode: !!app.globalData.demoMode,
      companionDays: daysBetween(app.globalData.companionStartAt || Date.now()),
      viewerRole
    })
  },

  buildCareLine(stateKey) {
    const key = stateKey || this.data.expression || 'idle'
    const role = this.data.viewerRole || getRole()
    if (key === 'idle') {
      if (this._holiday && this._holiday.line) {
        const line = this._holiday.line
        return role === 'dad' ? line.replace(/妈/g, '爸').replace(/妈妈/g, '爸爸') : line
      }
      if (this._weatherAdvice) return this._weatherAdvice
    }
    return getLine(key, role)
  },

  async loadHome() {
    try {
      const [dailyLine, stats, weather] = await Promise.all([
        fetchDailyLine(),
        fetchHomeStats(),
        fetchWeather()
      ])
      const holiday = getHoliday(new Date())
      this._holiday = holiday
      this._weatherAdvice = (weather && weather.advice) || ''
      const weatherText = weather
        ? `${weather.city} · ${weather.text} ${weather.temp}°C`
        : ''
      const st = getState(this.data.expression)
      this.setData({
        dailyLine,
        weatherText,
        weatherAdvice: this._weatherAdvice,
        weatherSource: (weather && weather.source) || 'demo',
        weatherWarning: (weather && weather.warning) || '',
        holidayName: holiday ? holiday.name : '',
        holidayLine: holiday ? holiday.line : '',
        careLine: this.buildCareLine(st.key),
        moodLabel: st.label,
        voiceMonth: stats.voiceMonth || 0,
        transferMonth: stats.transferMonth || 0
      })
    } catch (e) {
      console.warn(e)
    }
  },

  ensureAudio() {
    if (this._greetAudio) return this._greetAudio
    const audio = wx.createInnerAudioContext()
    audio.obeyMuteSwitch = false
    audio.onPlay(() => this.setData({ speaking: true }))
    audio.onEnded(() => this.setData({ speaking: false }))
    audio.onStop(() => this.setData({ speaking: false }))
    audio.onError(() => {
      if (this._triedDadFallback) {
        this._triedDadFallback = false
        this.setData({ speaking: false })
        wx.showToast({ title: '录音播放失败，请检查音频文件', icon: 'none' })
        return
      }
      const role = this.data.viewerRole || getRole()
      if (role === 'dad') {
        this._triedDadFallback = true
        const st = getState(this.data.expression)
        audio.src = st.audio
        audio.play()
        return
      }
      this.setData({ speaking: false })
      wx.showToast({ title: '录音播放失败，请检查音频文件', icon: 'none' })
    })
    this._greetAudio = audio
    return audio
  },

  onPlayGreet() {
    if (this.data.speaking) {
      this.stopGreet()
      return
    }
    const role = this.data.viewerRole || getRole()
    const audio = this.ensureAudio()
    this._triedDadFallback = false
    audio.stop()
    audio.src = getAudio(this.data.expression, role)
    this.setData({ speaking: true })
    audio.play()
  },

  onNextMood() {
    this.stopGreet()
    const expression = nextStateKey(this.data.expression)
    const st = getState(expression)
    this.setData({ textAnim: 'text-out' })
    clearTimeout(this._textTimer)
    this._textTimer = setTimeout(() => {
      this.setData({
        expression,
        moodLabel: st.label,
        careLine: this.buildCareLine(expression),
        textAnim: 'text-in'
      })
    }, 200)
  },

  stopGreet() {
    if (this._greetAudio) this._greetAudio.stop()
    this.setData({ speaking: false })
  },

  async onSavePortrait() {
    const src = getState(this.data.expression).src
    await saveImageToAlbum(src)
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
