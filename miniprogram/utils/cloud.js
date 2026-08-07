/**
 * 云开发封装。演示模式走 mock，不写真实库。
 * Phase 3 接通后，这里会真正调用云函数 / 数据库。
 */

const { getMockTimeline, getMockStats, getMockDailyLine } = require('../mock/data')
const { todayKey } = require('./date')

function isDemo() {
  try {
    const app = getApp()
    return !!(app && app.globalData.demoMode)
  } catch (e) {
    return true
  }
}

async function login() {
  if (isDemo()) {
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
  if (isDemo()) {
    return { ok: true, familyId: 'demo-family', inviteCode }
  }
  const res = await wx.cloud.callFunction({
    name: 'bindFamily',
    data: { inviteCode }
  })
  return res.result
}

async function fetchTimeline(filter = 'all') {
  if (isDemo()) {
    let list = getMockTimeline()
    if (filter && filter !== 'all') {
      list = list.filter((item) => item.type === filter)
    }
    return list
  }
  const db = wx.cloud.database()
  const where = { familyId: getApp().globalData.familyId }
  if (filter && filter !== 'all') where.type = filter
  const res = await db.collection('timeline').where(where).orderBy('createdAt', 'desc').get()
  return res.data
}

async function fetchHomeStats() {
  if (isDemo()) return getMockStats()
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
}

async function fetchDailyLine() {
  if (isDemo()) return getMockDailyLine(todayKey())
  const db = wx.cloud.database()
  const date = todayKey()
  try {
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
  if (isDemo()) {
    wx.showToast({ title: '演示模式：未写入云库', icon: 'none' })
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
  if (isDemo()) {
    return { ok: true, demo: true }
  }
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
  return { ok: true }
}

module.exports = {
  isDemo,
  login,
  bindFamily,
  fetchTimeline,
  fetchHomeStats,
  fetchDailyLine,
  createTimelineItem,
  reactTimeline
}
