const { ensureDemoSeed } = require('./utils/storage')

App({
  globalData: {
    demoMode: true,
    fontScale: 'larger',
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
      console.warn('基础库过低，无法使用云开发；演示模式仍可用')
      return
    }
    try {
      // 开通云开发后，把 env 换成你的环境 ID
      wx.cloud.init({
        env: 'your-env-id',
        traceUser: true
      })
      this.globalData.cloudReady = true
    } catch (e) {
      console.warn('cloud init skipped', e)
      this.globalData.cloudReady = false
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
