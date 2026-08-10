const { ensureDemoSeed } = require('./utils/storage')

App({
  globalData: {
    demoMode: true,
    fontScale: 'normal',
    role: 'guest',
    familyId: '',
    userInfo: null,
    cloudReady: false,
    companionStartAt: Date.now() - 1000 * 60 * 60 * 24 * 128
  },

  onLaunch() {
    ensureDemoSeed()
    this.loadLocalSettings()
    this.initCloud()
    // Tab 就绪后刷新未读角标
    setTimeout(() => {
      try {
        const { refreshTimelineBadge } = require('./utils/unread')
        refreshTimelineBadge()
      } catch (e) {
        console.warn('badge refresh skipped', e)
      }
    }, 400)
  },

  loadLocalSettings() {
    try {
      const demoMode = wx.getStorageSync('demoMode')
      const fontScale = wx.getStorageSync('fontScale')
      const role = wx.getStorageSync('role')
      const familyId = wx.getStorageSync('familyId')
      if (typeof demoMode === 'boolean') this.globalData.demoMode = demoMode
      if (fontScale) this.globalData.fontScale = fontScale
      if (role) this.globalData.role = role
      if (familyId) this.globalData.familyId = familyId
    } catch (e) {
      console.warn('loadLocalSettings failed', e)
    }
  },

  initCloud() {
    if (!wx.cloud) {
      console.warn('基础库过低，无法使用云开发；本地账本仍可用')
      this.globalData.cloudReady = false
      return
    }
    try {
      const env = 'cloudbase-d5gkkts0se795c6b3'
      wx.cloud.init({ env, traceUser: true })
      this.globalData.cloudReady = true
      this.globalData.cloudEnv = env
      this.bootstrapCloud()
    } catch (e) {
      console.warn('cloud init skipped', e)
      this.globalData.cloudReady = false
    }
  },

  async bootstrapCloud() {
    if (!this.globalData.cloudReady || this.globalData.demoMode) return
    try {
      const { login } = require('./utils/cloud')
      const session = await login()
      if (session && session.openid) {
        this.globalData.userInfo = {
          ...(this.globalData.userInfo || {}),
          openid: session.openid
        }
      }
      if (session && session.familyId) {
        this.globalData.familyId = session.familyId
        wx.setStorageSync('familyId', session.familyId)
      }
      if (session && session.role && session.role !== 'guest') {
        this.globalData.role = session.role
        wx.setStorageSync('role', session.role)
      }
    } catch (e) {
      console.warn('bootstrapCloud failed', e)
    }
  },

  setDemoMode(on) {
    this.globalData.demoMode = !!on
    wx.setStorageSync('demoMode', this.globalData.demoMode)
  },

  setFontScale(scale) {
    this.globalData.fontScale = scale === 'normal' ? 'normal' : 'larger'
    wx.setStorageSync('fontScale', this.globalData.fontScale)
  },

  setRole(role) {
    this.globalData.role = role
    wx.setStorageSync('role', role)
  }
})
