/**
 * 云开发封装。
 * - 心意账本始终可读（本地种子 + 续记），不依赖云是否开通
 * - 云未就绪 / 请求失败时回退本地数据，避免时光轴空白
 */

const { getMockTimeline, getMockStats, getMockDailyLine } = require('../mock/data')
const { todayKey } = require('./date')
const { addTransfer, getTransferTimeline, getTransferStats } = require('./transferLedger')
const { getPhotos, addPhoto, removePhoto } = require('./photoWall')
const { getRole } = require('./auth')
const { resolveTimelineMedia } = require('./media')

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
  if (filter === 'all') {
    list = list.filter((item) => item.type !== 'photo')
  } else if (filter) {
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

async function bindFamily(inviteCode, extra = {}) {
  if (isDemo() || !isCloudReady()) {
    // 演示模式：本地直接成功，不访问云
    return {
      ok: true,
      familyId: 'demo-family',
      inviteCode: (inviteCode || 'COTTON888').toUpperCase(),
      role: extra.role || 'mom',
      demo: true
    }
  }
  const res = await wx.cloud.callFunction({
    name: 'bindFamily',
    data: {
      inviteCode,
      action: extra.action || (inviteCode ? 'join' : 'create'),
      role: extra.role || 'mom'
    }
  })
  return res.result
}

async function createFamilyInvite() {
  if (isDemo() || !isCloudReady()) {
    return { ok: true, inviteCode: 'COTTON888', familyId: 'demo-family', demo: true }
  }
  const res = await wx.cloud.callFunction({
    name: 'bindFamily',
    data: { action: 'create' }
  })
  return res.result
}

async function fetchTimeline(filter = 'all') {
  const range = getTransferRange()

  if (filter === 'transfer') {
    return getTransferTimeline(range).filter((t) => t.status !== 'refunded')
  }

  if (filter === 'photo') {
    return fetchPhotos()
  }

  if (isDemo() || !isCloudReady()) {
    return resolveTimelineMedia(localTimeline(filter))
  }

  try {
    const db = wx.cloud.database()
    const familyId = getApp().globalData.familyId
    if (!familyId) {
      return resolveTimelineMedia(localTimeline(filter))
    }
    const where = { familyId }
    if (filter && filter !== 'all') where.type = filter
    const res = await db.collection('timeline').where(where).orderBy('createdAt', 'desc').get()
    let list = res.data || []
    if (filter === 'all') {
      // 照片只在「照片墙」展示，全部里不出现空卡片
      const transfers = getTransferTimeline(range).filter((t) => t.status !== 'refunded')
      list = list
        .filter((i) => i.type !== 'transfer' && i.type !== 'photo')
        .concat(transfers)
      list.sort((a, b) => b.createdAt - a.createdAt)
    }
    // 云库空且本地有数据时，回退本地，避免空白
    if (!list.length) return resolveTimelineMedia(localTimeline(filter))
    return resolveTimelineMedia(list)
  } catch (e) {
    console.warn('fetchTimeline cloud failed, fallback local', e)
    return resolveTimelineMedia(localTimeline(filter))
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

async function fetchPhotos() {
  const local = getPhotos()
  let list = local
  if (!isDemo() && isCloudReady()) {
    try {
      const db = wx.cloud.database()
      const familyId = getApp().globalData.familyId
      if (familyId) {
        const res = await db
          .collection('timeline')
          .where({ familyId, type: 'photo' })
          .orderBy('createdAt', 'desc')
          .get()
        const cloud = res.data || []
        const map = {}
        cloud.forEach((p) => {
          if (p && p._id) map[p._id] = p
        })
        local.forEach((p) => {
          if (p && p._id && !map[p._id]) map[p._id] = p
        })
        list = Object.keys(map)
          .map((k) => map[k])
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      }
    } catch (e) {
      console.warn('fetchPhotos failed', e)
      list = local
    }
  }
  return resolveTimelineMedia(list)
}

async function createTimelineItem(payload) {
  if (payload.type === 'photo') {
    const fromRole = payload.fromRole || getRole()
    const row = {
      ...payload,
      type: 'photo',
      fromRole,
      createdAt: payload.createdAt || Date.now(),
      reactions: { received: 0, like: 0, miss: 0 }
    }
    if (isDemo() || !isCloudReady()) {
      addPhoto(row)
      wx.showToast({ title: '已上传照片', icon: 'success' })
      return { ok: true, ...row }
    }
    const familyId = getApp().globalData.familyId
    if (!familyId) {
      addPhoto(row)
      wx.showToast({ title: '未绑定家庭，仅本机可见', icon: 'none' })
      return { ok: true, localOnly: true, ...row }
    }
    const db = wx.cloud.database()
    const data = {
      ...row,
      familyId,
      createdBy: getApp().globalData.userInfo && getApp().globalData.userInfo.openid
    }
    const res = await db.collection('timeline').add({ data })
    addPhoto({ ...row, _id: res._id })
    return { ok: true, _id: res._id }
  }

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

/** 删除照片墙条目（本地 + 云 timeline） */
async function deleteTimelineItem(id) {
  if (!id) return { ok: false, error: 'missing-id' }
  removePhoto(id)
  if (isDemo() || !isCloudReady()) {
    return { ok: true, demo: true }
  }
  try {
    const db = wx.cloud.database()
    await db.collection('timeline').doc(id).remove()
    return { ok: true }
  } catch (e) {
    console.warn('deleteTimelineItem failed', e)
    return { ok: false, error: (e && (e.errMsg || e.message)) || String(e) }
  }
}

module.exports = {
  isDemo,
  isCloudReady,
  login,
  bindFamily,
  createFamilyInvite,
  fetchTimeline,
  fetchPhotos,
  fetchTransferStats,
  fetchHomeStats,
  fetchDailyLine,
  createTimelineItem,
  deleteTimelineItem,
  reactTimeline,
  getTransferRange
}
