const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

/**
 * 发送订阅消息给同家庭的家长（或指定 openid）
 *
 * event: {
 *   type: 'voice' | 'photo' | 'festival',
 *   familyId?: string,
 *   title?: string,
 *   hint?: string,
 *   from?: string,
 *   holidayName?: string,
 *   page?: string,
 *   miniprogramState?: 'developer' | 'trial' | 'formal'
 * }
 *
 * 字段名已按公众平台「我的模板」详情对齐（2026-08）：
 * - voice  聊天消息通知：thing1 / time6 / thing5 / thing3
 * - photo  新留言提醒：thing3 / date4 / thing2 / time6
 * - festival 节日祝福提醒：thing1 / thing4 / thing5 / time2
 */

function pad(n) {
  return n < 10 ? `0${n}` : String(n)
}

function nowTimeText() {
  const d = new Date()
  return `${d.getFullYear()}年${pad(d.getMonth() + 1)}月${pad(d.getDate())}日 ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`
}

function nowDateText() {
  const d = new Date()
  return `${d.getFullYear()}年${pad(d.getMonth() + 1)}月${pad(d.getDate())}日`
}

function truncate(str, max) {
  const s = String(str || '')
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

function buildData(type, payload) {
  const time = payload.time || nowTimeText()
  const date = payload.date || nowDateText()
  const from = truncate(payload.from || '女儿', 20)

  if (type === 'photo') {
    // 新留言提醒：留言内容 thing3 / 留言时间 date4 / 留言用户 thing2 / 发送时间 time6
    return {
      thing3: { value: truncate(payload.hint || payload.title || '新照片留言', 20) },
      date4: { value: date },
      thing2: { value: from },
      time6: { value: time }
    }
  }

  if (type === 'festival') {
    // 节日祝福提醒：节日名称 thing1 / 用户姓名 thing4 / 节日祝福语 thing5 / 时间 time2
    return {
      thing1: { value: truncate(payload.holidayName || payload.title || '节日提醒', 20) },
      thing4: { value: from },
      thing5: { value: truncate(payload.hint || '打开小程序看节日祝福', 20) },
      time2: { value: time }
    }
  }

  // voice 默认：聊天消息通知
  // 通知类型 thing1 / 消息时间 time6 / 备注 thing5 / 消息来自 thing3
  return {
    thing1: { value: truncate(payload.title || '女儿新语音', 20) },
    time6: { value: time },
    thing5: { value: truncate(payload.hint || '打开小程序查看', 20) },
    thing3: { value: from }
  }
}

async function listTargets(familyId, type) {
  if (!familyId) return []
  const res = await db
    .collection('users')
    .where({ familyId })
    .limit(100)
    .get()
  const rows = res.data || []
  return rows.filter((u) => {
    const role = u.role
    if (role !== 'mom' && role !== 'dad' && role !== 'parent') return false
    const sub = u.subscribe && u.subscribe[type]
    return sub && sub.status === 'accept' && sub.templateId
  })
}

exports.main = async (event = {}) => {
  const type = event.type || 'voice'
  const familyId = event.familyId || ''
  const page = event.page || 'pages/home/home'
  const state = event.miniprogramState || 'formal'

  let targets = []
  if (event.touser) {
    targets = [{ openid: event.touser, subscribe: { [type]: { templateId: event.templateId, status: 'accept' } } }]
  } else {
    targets = await listTargets(familyId, type)
  }

  if (!targets.length) {
    return { ok: true, sent: 0, skipped: 'no-targets' }
  }

  const data = buildData(type, event)
  const results = []

  for (const user of targets) {
    const templateId =
      (user.subscribe && user.subscribe[type] && user.subscribe[type].templateId) || event.templateId
    if (!templateId) {
      results.push({ openid: user.openid, ok: false, err: 'no-template' })
      continue
    }
    try {
      const r = await cloud.openapi.subscribeMessage.send({
        touser: user.openid,
        templateId,
        page,
        data,
        miniprogramState: state,
        lang: 'zh_CN'
      })
      results.push({ openid: user.openid, ok: true, r })
    } catch (e) {
      console.warn('sendNotify fail', user.openid, e)
      results.push({
        openid: user.openid,
        ok: false,
        err: (e && (e.errMsg || e.message)) || String(e)
      })
    }
  }

  return {
    ok: true,
    sent: results.filter((x) => x.ok).length,
    results
  }
}
