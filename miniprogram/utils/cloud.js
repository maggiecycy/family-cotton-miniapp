/**
 * 云开发封装。
 * - 心意账本始终可读（本地种子 + 续记），不依赖云是否开通
 * - 云未就绪 / 请求失败时回退本地数据，避免时光轴空白
 */

const { getMockTimeline, getMockStats, getMockDailyLine } = require('../mock/data')
const { todayKey } = require('./date')
const { addTransfer, getTransferTimeline, getTransferStats } = require('./transferLedger')

function isDemo() {
  try {
    const app = getApp()
    return !!(app && app.globalData.demoMode)
  } catch (e) {
    return true
  }
}

function isCloudReady() {
  try {
    const app = getApp()
    return !!(app && app.globalData.cloudReady)
  } catch (e) {
    return false
  }
}

function getTransferRange() {
  try {
    return wx.getStorageSync('transferRange') || 'year'
  } catch (e) {
    return 'year'
  }
}

function localTimeline(filter = 'all') {
  const range = getTransferRange()
  let list = getMockTimeline(range)
  if (filter && filter !== 'all') {
    list = list.filter((item) => item.type === filter)
  }
  return list
}

async function login() {
  if (isDemo() || !isCloudReady()) {
    return {
      openid: 'demo-openid',
      role: getApp().globalData.role || 'guest',
      familyId: 'demo-family'
    }
  }
  const res = await wx.cloud.callFunction({ name: 'login' })
  return res.result
}

async function bindFamily(inviteCode) {
  if (isDemo() || !isCloudReady()) {
    return { ok: true, familyId: 'demo-family', inviteCode }
  }
  const res = await wx.cloud.callFunction({
    name: 'bindFamily',
    data: { inviteCode }
  })
  return res.result
}

async function fetchTimeline(filter = 'all') {
  const range = getTransferRange()

  // 心意：永远走本地账本（凭证 + 续记）
  if (filter === 'transfer') {
    return getTransferTimeline(range).filter((t) => t.status !== 'refunded')
  }

  // 演示模式，或云未开通：完整本地时光轴（含真实心意）
  if (isDemo() || !isCloudReady()) {
    return localTimeline(filter)
  }

  try {
    const db = wx.cloud.database()
    const familyId = getApp().globalData.familyId
    if (!familyId) {
      return localTimeline(filter)
    }
    const where = { familyId }
    if (filter && filter !== 'all') where.type = filter
    const res = await db.collection('timeline').where(where).orderBy('createdAt', 'desc').get()
    let list = res.data || []
    if (filter === 'all') {
      const transfers = getTransferTimeline(range).filter((t) => t.status !== 'refunded')
      list = list.filter((i) => i.type !== 'transfer').concat(transfers)
      list.sort((a, b) => b.createdAt - a.createdAt)
    }
    // 云库空且本地有数据时，回退本地，避免空白
    if (!list.length) return localTimeline(filter)
    return list
  } catch (e) {
    console.warn('fetchTimeline cloud failed, fallback local', e)
    return localTimeline(filter)
  }
}

async function fetchTransferStats(range) {
  return getTransferStats(range || getTransferRange())
}

async function fetchHomeStats() {
  if (isDemo() || !isCloudReady()) return getMockStats()
  try {
    const list = await fetchTimeline('all')
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    let voice = 0
    let transfer = 0
    list.forEach((item) => {
      const d = new Date(item.createdAt)
      if (d.getFullYear() === year && d.getMonth() === month) {
        if (item.type === 'voice') voice += 1
        if (item.type === 'transfer') transfer += 1
      }
    })
    return { voiceMonth: voice, transferMonth: transfer }
  } catch (e) {
    return getMockStats()
  }
}

async function fetchDailyLine() {
  if (isDemo() || !isCloudReady()) return getMockDailyLine(todayKey())
  const date = todayKey()
  try {
    const db = wx.cloud.database()
    const res = await db
      .collection('daily_lines')
      .where({ familyId: getApp().globalData.familyId, date })
      .limit(1)
      .get()
    if (res.data && res.data[0]) return res.data[0].text
  } catch (e) {
    console.warn('daily_lines fetch failed', e)
  }
  return getMockDailyLine(date)
}

async function createTimelineItem(payload) {
  if (payload.type === 'transfer') {
    const row = addTransfer(payload)
    wx.showToast({ title: '已记入心意账本', icon: 'success' })
    if (!isDemo() && isCloudReady()) {
      try {
        const db = wx.cloud.database()
        await db.collection('timeline').add({
          data: {
            ...row,
            familyId: getApp().globalData.familyId,
            createdBy: getApp().globalData.userInfo && getApp().globalData.userInfo.openid
          }
        })
      } catch (e) {
        console.warn('cloud transfer sync failed', e)
      }
    }
    return { ok: true, ...row }
  }

  if (isDemo() || !isCloudReady()) {
    wx.showToast({ title: '已保存到本地（云未接通）', icon: 'none' })
    return { ok: true, demo: true, ...payload }
  }
  const db = wx.cloud.database()
  const data = {
    ...payload,
    familyId: getApp().globalData.familyId,
    createdBy: getApp().globalData.userInfo && getApp().globalData.userInfo.openid,
    createdAt: Date.now(),
    reactions: { received: 0, like: 0, miss: 0 }
  }
  const res = await db.collection('timeline').add({ data })
  return { ok: true, _id: res._id }
}

async function reactTimeline(id, key) {
  if (isDemo() || !isCloudReady()) {
    return { ok: true, demo: true }
  }
  try {
    const db = wx.cloud.database()
    const _ = db.command
    await db
      .collection('timeline')
      .doc(id)
      .update({
        data: {
          [`reactions.${key}`]: _.inc(1)
        }
      })
  } catch (e) {
    console.warn('reactTimeline failed', e)
  }
  return { ok: true }
}

module.exports = {
  isDemo,
  isCloudReady,
  login,
  bindFamily,
  fetchTimeline,
  fetchTransferStats,
  fetchHomeStats,
  fetchDailyLine,
  createTimelineItem,
  reactTimeline,
  getTransferRange
}
