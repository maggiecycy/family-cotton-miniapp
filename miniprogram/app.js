const { ensureDemoSeed, ensureCompanionStart } = require('./utils/storage')
const { setPendingInvite, peekPendingInvite } = require('./utils/invite')

App({
  globalData: {
    demoMode: true,
    role: 'guest',
    familyId: '',
    userInfo: null,
    cloudReady: false,
    companionStartAt: Date.now()
  },

  onLaunch(options) {
    ensureDemoSeed()
    ensureCompanionStart(this)
    this.loadLocalSettings()
    this.initCloud()
    this.captureInvite(options)
    setTimeout(() => {
      try {
        const { refreshTimelineBadge } = require('./utils/unread')
        refreshTimelineBadge()
      } catch (e) {
        console.warn('badge refresh skipped', e)
      }
      this.maybeOpenBind()
    }, 400)
  },

  onShow(options) {
    this.captureInvite(options)
  },

  captureInvite(options) {
    const q = (options && options.query) || {}
    const invite = q.invite || q.code || ''
    if (invite) setPendingInvite(invite)
  },

  maybeOpenBind() {
    const role = this.globalData.role || 'guest'
    const pending = peekPendingInvite()
    if (!pending) return
    if (role === 'mom' || role === 'dad' || role === 'daughter') return
    const pages = getCurrentPages()
    const cur = pages && pages[pages.length - 1]
    if (cur && cur.route === 'pages/bind/bind') return
    wx.navigateTo({ url: `/pages/bind/bind?invite=${encodeURIComponent(pending)}` })
  },

  loadLocalSettings() {
    try {
      const demoMode = wx.getStorageSync('demoMode')
      const role = wx.getStorageSync('role')
      const familyId = wx.getStorageSync('familyId')
      const companionStartAt = wx.getStorageSync('companionStartAt')
      if (typeof demoMode === 'boolean') this.globalData.demoMode = demoMode
      if (role) this.globalData.role = role
      if (familyId) this.globalData.familyId = familyId
      if (companionStartAt) this.globalData.companionStartAt = companionStartAt
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
    } catch (e) {
      console.warn('cloud init skipped', e)
      this.globalData.cloudReady = false
    }
  },

  setDemoMode(on) {
    this.globalData.demoMode = !!on
    wx.setStorageSync('demoMode', this.globalData.demoMode)
  },

  setRole(role) {
    this.globalData.role = role
    wx.setStorageSync('role', role)
  }
})
