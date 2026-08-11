/** 本地提醒开关（吃药 / 喝水 / 出门），后续可接云端与订阅推送 */

const STORAGE_KEY = 'familyRemindItems'

const DEFAULT_ITEMS = [
  { id: 'med', title: '吃药提醒', desc: '按医嘱按时服药', enabled: false, time: '08:00' },
  { id: 'water', title: '喝水提醒', desc: '白天记得多喝温水', enabled: false, time: '10:00' },
  { id: 'out', title: '出门添衣', desc: '出门前看一眼天气', enabled: true, time: '07:30' }
]

function getReminds() {
  try {
    const list = wx.getStorageSync(STORAGE_KEY)
    if (Array.isArray(list) && list.length) return list
  } catch (e) {
    // ignore
  }
  return DEFAULT_ITEMS.map((i) => ({ ...i }))
}

function saveReminds(list) {
  wx.setStorageSync(STORAGE_KEY, list)
  return list
}

function toggleRemind(id, enabled) {
  const list = getReminds().map((item) =>
    item.id === id ? { ...item, enabled: !!enabled } : item
  )
  return saveReminds(list)
}

module.exports = {
  getReminds,
  saveReminds,
  toggleRemind
}
