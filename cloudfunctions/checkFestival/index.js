const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

/**
 * 定时触发（默认每天 8:00）：若今天是节日，给所有已订阅 festival 的家长发提醒
 * 也可手动：云端测试 / callFunction({ name: 'checkFestival' })
 *
 * 节日表与小程序 utils/holiday.js 保持同步（云函数内嵌一份，避免依赖前端路径）
 */

const FIXED = [
  { m: 1, d: 1, name: '元旦', line: '元旦快乐！新的一年也要好好照顾自己。' },
  { m: 3, d: 8, name: '妇女节', line: '妇女节快乐，你值得被好好对待。' },
  { m: 5, d: 1, name: '劳动节', line: '劳动节快乐，别太累，记得休息。' },
  { m: 5, d: 12, name: '母亲节', line: '母亲节快乐。谢谢你一直照顾我。' },
  { m: 6, d: 1, name: '儿童节', line: '儿童节快乐～你永远是我心里最柔软的人。' },
  { m: 10, d: 1, name: '国庆', line: '国庆快乐！有空多出去走走晒晒太阳。' },
  { m: 12, d: 25, name: '圣诞', line: '平安夜/圣诞快乐。' }
]

const LUNAR_APPROX = [
  { y: 2025, m: 1, d: 29, name: '春节', line: '春节快乐！新的一年我陪着你。' },
  { y: 2025, m: 2, d: 12, name: '元宵', line: '元宵节快乐，记得吃顿热乎的。' },
  { y: 2025, m: 4, d: 4, name: '清明', line: '清明时节，记得添衣服，别着凉。' },
  { y: 2025, m: 5, d: 31, name: '端午', line: '端午节快乐，粽子别吃太多哦。' },
  { y: 2025, m: 10, d: 6, name: '中秋', line: '中秋快乐。月亮圆的时候，我想你。' },
  { y: 2026, m: 2, d: 17, name: '春节', line: '春节快乐！新的一年我陪着你。' },
  { y: 2026, m: 3, d: 3, name: '元宵', line: '元宵节快乐，记得吃顿热乎的。' },
  { y: 2026, m: 4, d: 5, name: '清明', line: '清明时节，记得添衣服，别着凉。' },
  { y: 2026, m: 6, d: 19, name: '端午', line: '端午节快乐，粽子别吃太多哦。' },
  { y: 2026, m: 8, d: 19, name: '七夕', line: '七夕快乐。最想陪的人，是你。' },
  { y: 2026, m: 9, d: 25, name: '中秋', line: '中秋快乐。月亮圆的时候，我想你。' },
  { y: 2026, m: 10, d: 25, name: '重阳', line: '重阳节到了，记得轻轻活动活动，别太累。' },
  { y: 2027, m: 2, d: 6, name: '春节', line: '春节快乐！新的一年我陪着你。' },
  { y: 2027, m: 2, d: 22, name: '元宵', line: '元宵节快乐，记得吃顿热乎的。' },
  { y: 2027, m: 4, d: 5, name: '清明', line: '清明时节，记得添衣服，别着凉。' },
  { y: 2027, m: 6, d: 9, name: '端午', line: '端午节快乐，粽子别吃太多哦。' },
  { y: 2027, m: 8, d: 8, name: '七夕', line: '七夕快乐。最想陪的人，是你。' },
  { y: 2027, m: 9, d: 15, name: '中秋', line: '中秋快乐。月亮圆的时候，我想你。' },
  { y: 2027, m: 10, d: 18, name: '重阳', line: '重阳节到了，记得轻轻活动活动，别太累。' },
  { y: 2028, m: 1, d: 26, name: '春节', line: '春节快乐！新的一年我陪着你。' },
  { y: 2028, m: 2, d: 11, name: '元宵', line: '元宵节快乐，记得吃顿热乎的。' },
  { y: 2028, m: 4, d: 4, name: '清明', line: '清明时节，记得添衣服，别着凉。' },
  { y: 2028, m: 5, d: 28, name: '端午', line: '端午节快乐，粽子别吃太多哦。' },
  { y: 2028, m: 8, d: 26, name: '七夕', line: '七夕快乐。最想陪的人，是你。' },
  { y: 2028, m: 10, d: 3, name: '中秋', line: '中秋快乐。月亮圆的时候，我想你。' },
  { y: 2028, m: 10, d: 23, name: '重阳', line: '重阳节到了，记得轻轻活动活动，别太累。' },
  { y: 2029, m: 2, d: 13, name: '春节', line: '春节快乐！新的一年我陪着你。' },
  { y: 2029, m: 2, d: 27, name: '元宵', line: '元宵节快乐，记得吃顿热乎的。' },
  { y: 2029, m: 4, d: 4, name: '清明', line: '清明时节，记得添衣服，别着凉。' },
  { y: 2029, m: 6, d: 16, name: '端午', line: '端午节快乐，粽子别吃太多哦。' },
  { y: 2029, m: 8, d: 16, name: '七夕', line: '七夕快乐。最想陪的人，是你。' },
  { y: 2029, m: 9, d: 22, name: '中秋', line: '中秋快乐。月亮圆的时候，我想你。' },
  { y: 2029, m: 10, d: 16, name: '重阳', line: '重阳节到了，记得轻轻活动活动，别太累。' },
  { y: 2030, m: 2, d: 3, name: '春节', line: '春节快乐！新的一年我陪着你。' },
  { y: 2030, m: 2, d: 17, name: '元宵', line: '元宵节快乐，记得吃顿热乎的。' },
  { y: 2030, m: 4, d: 5, name: '清明', line: '清明时节，记得添衣服，别着凉。' },
  { y: 2030, m: 6, d: 5, name: '端午', line: '端午节快乐，粽子别吃太多哦。' },
  { y: 2030, m: 8, d: 5, name: '七夕', line: '七夕快乐。最想陪的人，是你。' },
  { y: 2030, m: 9, d: 12, name: '中秋', line: '中秋快乐。月亮圆的时候，我想你。' },
  { y: 2030, m: 10, d: 6, name: '重阳', line: '重阳节到了，记得轻轻活动活动，别太累。' }
]

function getHoliday(date = new Date()) {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  const lunar = LUNAR_APPROX.find((h) => h.y === y && h.m === m && h.d === d)
  if (lunar) return { name: lunar.name, line: lunar.line }
  const fixed = FIXED.find((h) => h.m === m && h.d === d)
  if (fixed) return { name: fixed.name, line: fixed.line }
  return null
}

function truncate(str, max) {
  const s = String(str || '')
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

function nowText() {
  const d = new Date()
  const p = (n) => (n < 10 ? `0${n}` : String(n))
  return `${d.getFullYear()}年${p(d.getMonth() + 1)}月${p(d.getDate())}日 ${p(d.getHours())}:${p(d.getMinutes())}`
}

exports.main = async () => {
  const holiday = getHoliday(new Date())
  if (!holiday) {
    return { ok: true, skipped: 'not-holiday' }
  }

  const all = await db.collection('users').limit(100).get()
  const users = (all.data || []).filter((u) => u.role === 'mom' || u.role === 'dad' || u.role === 'parent')

  const targets = users.filter((u) => {
    const sub = u.subscribe && u.subscribe.festival
    return sub && sub.status === 'accept' && sub.templateId
  })

  const results = []
  for (const user of targets) {
    const templateId = user.subscribe.festival.templateId
    try {
      const r = await cloud.openapi.subscribeMessage.send({
        touser: user.openid,
        templateId,
        page: 'pages/festival/festival',
        // 节日祝福提醒：thing1 节日名称 / thing4 用户姓名 / thing5 祝福语 / time2 时间
        data: {
          thing1: { value: truncate(holiday.name, 20) },
          thing4: { value: '家人' },
          thing5: { value: truncate(holiday.line, 20) },
          time2: { value: nowText() }
        },
        miniprogramState: 'formal',
        lang: 'zh_CN'
      })
      results.push({ openid: user.openid, ok: true, r })
    } catch (e) {
      results.push({ openid: user.openid, ok: false, err: String(e && (e.errMsg || e.message) || e) })
    }
  }

  return {
    ok: true,
    holiday,
    sent: results.filter((x) => x.ok).length,
    results
  }
}
