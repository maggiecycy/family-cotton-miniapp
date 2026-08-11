const { fetchTimeline } = require('./cloud')

const LAST_READ_KEY = 'timelineLastReadAt'

function getLastReadAt() {
  const v = wx.getStorageSync(LAST_READ_KEY)
  return typeof v === 'number' ? v : 0
}

function setLastReadAt(ts = Date.now()) {
  wx.setStorageSync(LAST_READ_KEY, ts)
}

function countUnread(list, lastReadAt = getLastReadAt()) {
  if (!Array.isArray(list)) return 0
  return list.filter((item) => (item.createdAt || 0) > lastReadAt).length
}

function applyTabBadge(count) {
  if (count > 0) {
    const text = count > 99 ? '99+' : String(count)
    wx.setTabBarBadge({
      index: 1,
      text,
      fail() {}
    })
  } else {
    wx.removeTabBarBadge({
      index: 1,
      fail() {}
    })
  }
}

async function refreshTimelineBadge() {
  try {
    const list = await fetchTimeline('all')
    const n = countUnread(list)
    applyTabBadge(n)
    return n
  } catch (e) {
    console.warn('refreshTimelineBadge failed', e)
    return 0
  }
}

function markTimelineRead() {
  setLastReadAt(Date.now())
  applyTabBadge(0)
}

module.exports = {
  LAST_READ_KEY,
  getLastReadAt,
  setLastReadAt,
  countUnread,
  applyTabBadge,
  refreshTimelineBadge,
  markTimelineRead
}
