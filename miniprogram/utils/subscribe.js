/**
 * 订阅消息：前端授权 + 同步云端 users.subscribe
 *
 * 模板 ID 申请后填入 TMPL；未配置时静默跳过。
 */

const STORAGE_KEY = 'subscribePrefs'

/** 申请后替换为真实模板 ID */
const TMPL = {
  voice: 'dIsNEDkj-wofZXNPO7qgfPqxGt979Z2APOwoLC1FeM0', // 新语音留言
  photo: 'E9HyEly7v-_GTD2xlmTLpL2UpVYxBYdcuXgb324EbDc', // 新照片
  festival: 'FizWNtmmWYO6O_-lOGyDPIYL70xnZ4n776hNhi1QRYA' // 节日提醒
}

function loadPrefs() {
  try {
    const v = wx.getStorageSync(STORAGE_KEY)
    return v && typeof v === 'object' ? v : {}
  } catch (e) {
    return {}
  }
}

function savePrefs(patch) {
  const next = { ...loadPrefs(), ...patch }
  wx.setStorageSync(STORAGE_KEY, next)
  return next
}

function syncSubscribeToCloud(results) {
  try {
    const app = getApp()
    if (!app || app.globalData.demoMode || !app.globalData.cloudReady) {
      return Promise.resolve({ skipped: true })
    }
    return wx.cloud
      .callFunction({
        name: 'saveSubscribe',
        data: { results, kinds: TMPL }
      })
      .then((res) => res && res.result)
      .catch((e) => {
        console.warn('saveSubscribe failed', e)
        return { ok: false, e }
      })
  } catch (e) {
    return Promise.resolve({ ok: false, e })
  }
}

/**
 * @param {Array<'voice'|'photo'|'festival'>} kinds
 */
function requestSubscribe(kinds = ['voice', 'festival']) {
  const tmplIds = kinds.map((k) => TMPL[k]).filter(Boolean)
  if (!tmplIds.length) {
    return Promise.resolve({ skipped: true, reason: 'no-tmpl-id' })
  }
  return new Promise((resolve) => {
    wx.requestSubscribeMessage({
      tmplIds,
      success: async (res) => {
        savePrefs({ lastResult: res, lastAt: Date.now() })
        const cloudRes = await syncSubscribeToCloud(res)
        resolve({ ok: true, res, cloudRes })
      },
      fail: (err) => {
        console.warn('requestSubscribeMessage failed', err)
        resolve({ ok: false, err })
      }
    })
  })
}

/** 通知同家庭家长（需已 accept 对应模板） */
function notifyFamily(type, payload = {}) {
  try {
    const app = getApp()
    if (!app || app.globalData.demoMode || !app.globalData.cloudReady) {
      return Promise.resolve({ skipped: true })
    }
    const familyId = app.globalData.familyId
    if (!familyId) return Promise.resolve({ skipped: true, reason: 'no-family' })
    return wx.cloud
      .callFunction({
        name: 'sendNotify',
        data: {
          type,
          familyId,
          title: payload.title,
          hint: payload.hint,
          from: payload.from || '女儿',
          holidayName: payload.holidayName,
          page: payload.page || 'pages/timeline/timeline'
        }
      })
      .then((res) => res && res.result)
      .catch((e) => {
        console.warn('sendNotify failed', e)
        return { ok: false, e }
      })
  } catch (e) {
    return Promise.resolve({ ok: false, e })
  }
}

module.exports = {
  TMPL,
  requestSubscribe,
  notifyFamily,
  loadPrefs,
  savePrefs,
  syncSubscribeToCloud
}
