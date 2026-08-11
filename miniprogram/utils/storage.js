const STORAGE_KEYS = {
  demoMode: 'demoMode',
  role: 'role',
  familyId: 'familyId',
  localTimeline: 'localTimeline',
  weatherCity: 'weatherCity',
  timelineLastReadAt: 'timelineLastReadAt',
  companionStartAt: 'companionStartAt'
}

function ensureDemoSeed() {
  if (wx.getStorageSync(STORAGE_KEYS.demoMode) === '') {
    wx.setStorageSync(STORAGE_KEYS.demoMode, true)
  }
  if (!wx.getStorageSync(STORAGE_KEYS.role)) {
    wx.setStorageSync(STORAGE_KEYS.role, 'guest')
  }
}

function ensureCompanionStart(app) {
  let startAt = wx.getStorageSync(STORAGE_KEYS.companionStartAt)
  if (!startAt) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    startAt = d.getTime()
    wx.setStorageSync(STORAGE_KEYS.companionStartAt, startAt)
  }
  if (app && app.globalData) {
    app.globalData.companionStartAt = startAt
  }
  return startAt
}

module.exports = {
  STORAGE_KEYS,
  ensureDemoSeed,
  ensureCompanionStart
}
