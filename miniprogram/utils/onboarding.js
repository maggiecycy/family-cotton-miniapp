const KEY = 'onboardGuideDone_v1'

function isDone() {
  return !!wx.getStorageSync(KEY)
}

function markDone() {
  wx.setStorageSync(KEY, true)
}

function shouldShow() {
  return !isDone()
}

module.exports = {
  KEY,
  isDone,
  markDone,
  shouldShow
}
