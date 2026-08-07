const STORAGE_KEYS = {
  demoMode: 'demoMode',
  fontScale: 'fontScale',
  role: 'role',
  familyId: 'familyId',
  localTimeline: 'localTimeline',
  weatherCity: 'weatherCity',
  timelineLastReadAt: 'timelineLastReadAt'
}

function ensureDemoSeed() {
  if (wx.getStorageSync(STORAGE_KEYS.demoMode) === '') {
    wx.setStorageSync(STORAGE_KEYS.demoMode, true)
  }
  if (!wx.getStorageSync(STORAGE_KEYS.fontScale)) {
    wx.setStorageSync(STORAGE_KEYS.fontScale, 'larger')
  }
  if (!wx.getStorageSync(STORAGE_KEYS.role)) {
    wx.setStorageSync(STORAGE_KEYS.role, 'guest')
  }
}

module.exports = {
  STORAGE_KEYS,
  ensureDemoSeed
}
