/**
 * 节日祝福（公历为主；农历节日用近似日期，够家庭演示）
 * 有节日时优先展示祝福，否则走天气/状态文案
 */

const FIXED = [
  { m: 1, d: 1, name: '元旦', line: '元旦快乐，妈！新的一年也要好好照顾自己。' },
  { m: 3, d: 8, name: '妇女节', line: '妇女节快乐，妈！你值得被好好对待。' },
  { m: 5, d: 1, name: '劳动节', line: '劳动节快乐，别太累，记得休息。' },
  { m: 5, d: 12, name: '母亲节近似', line: '妈，母亲节快乐。谢谢你一直照顾我。' },
  { m: 6, d: 1, name: '儿童节', line: '儿童节快乐～你永远是我心里最柔软的人。' },
  { m: 10, d: 1, name: '国庆', line: '国庆快乐，妈！有空多出去走走晒晒太阳。' },
  { m: 12, d: 25, name: '圣诞', line: '平安夜/圣诞快乐，给我的妈妈。' }
]

// 2025–2027 常用农历节日近似（演示够用）
const LUNAR_APPROX = [
  { y: 2025, m: 1, d: 29, name: '春节', line: '春节快乐，妈！新的一年我陪着你。' },
  { y: 2025, m: 2, d: 12, name: '元宵', line: '元宵节快乐，记得吃顿热乎的。' },
  { y: 2025, m: 4, d: 4, name: '清明', line: '清明时节，记得添衣服，别着凉。' },
  { y: 2025, m: 5, d: 31, name: '端午', line: '端午节快乐，粽子别吃太多哦。' },
  { y: 2025, m: 10, d: 6, name: '中秋', line: '中秋快乐，妈。月亮圆的时候，我想你。' },
  { y: 2026, m: 2, d: 17, name: '春节', line: '春节快乐，妈！新的一年我陪着你。' },
  { y: 2026, m: 3, d: 3, name: '元宵', line: '元宵节快乐，记得吃顿热乎的。' },
  { y: 2026, m: 4, d: 5, name: '清明', line: '清明时节，记得添衣服，别着凉。' },
  { y: 2026, m: 6, d: 19, name: '端午', line: '端午节快乐，粽子别吃太多哦。' },
  { y: 2026, m: 8, d: 19, name: '七夕', line: '七夕快乐。最想陪的人，是你。' },
  { y: 2026, m: 9, d: 25, name: '中秋', line: '中秋快乐，妈。月亮圆的时候，我想你。' },
  { y: 2026, m: 10, d: 25, name: '重阳', line: '重阳节到了，记得轻轻活动活动，别太累。' },
  { y: 2027, m: 2, d: 6, name: '春节', line: '春节快乐，妈！新的一年我陪着你。' }
]

function getHoliday(date = new Date()) {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()

  const lunar = LUNAR_APPROX.find((h) => h.y === y && h.m === m && h.d === d)
  if (lunar) return { name: lunar.name, line: lunar.line }

  const fixed = FIXED.find((h) => h.m === m && h.d === d)
  if (fixed) return { name: fixed.name, line: fixed.line }

  // 生日：若以后要加可放这里
  return null
}

module.exports = {
  getHoliday
}
