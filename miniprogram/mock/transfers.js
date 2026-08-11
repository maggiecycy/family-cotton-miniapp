/**
 * 真实转账种子数据（来自微信支付转账电子凭证 OCR）
 * 时间段：2025-08-09 ~ 2026-08-08
 * 后续通过 transferLedger.addTransfer 追加，不覆盖本文件。
 *
 * status:
 * - received: 已收款 / 对方已收款
 * - refunded: 已全额退款（统计时默认排除）
 */

function at(dateStr, timeStr = '12:00:00') {
  // dateStr: YYYY-MM-DD
  return new Date(`${dateStr}T${timeStr}+08:00`).getTime()
}

/** @type {Array<object>} */
const SEED_TRANSFERS = [
  // —— 收入：妈妈 → 曹艳 ——
  {
    tradeNo: '1000050001202608100629274726122',
    direction: 'mom_to_daughter',
    amount: 200,
    createdAt: at('2026-08-10', '17:53:55'),
    remark: '腿摔伤了',
    message: '收到啦，谢谢你。',
    category: '关心',
    status: 'received'
  },
  {
    tradeNo: 'manual-grandma-20260811',
    direction: 'parent_to_daughter',
    fromRole: 'grandma',
    amount: 100,
    createdAt: at('2026-08-11', '12:38:00'),
    remark: '外婆转来买点吃的',
    message: '好，谢谢外婆～',
    category: '红包',
    status: 'received'
  },
  {
    tradeNo: 'manual-20260808-221',
    direction: 'mom_to_daughter',
    amount: 221,
    createdAt: at('2026-08-08', '08:30:00'),
    remark: '周末和三姐吃饭',
    message: '收到啦，谢谢你。',
    category: '生活费',
    fromRole: 'mom',
    status: 'received'
  },
  { tradeNo: '1000050001202607180427140663664', direction: 'mom_to_daughter', amount: 1800, createdAt: at('2026-07-18', '13:32:33'), remark: '微信转账', category: '生活费', status: 'received' },
  { tradeNo: '1000050001202607080129963954693', direction: 'mom_to_daughter', amount: 100, createdAt: at('2026-07-09', '01:01:05'), remark: '微信转账', category: '红包', status: 'received' },
  { tradeNo: '1000050001202607020121414403945', direction: 'mom_to_daughter', amount: 168, createdAt: at('2026-07-02', '00:19:07'), remark: '微信转账', category: '红包', status: 'received' },
  { tradeNo: '1000050001202606180525381514546', direction: 'mom_to_daughter', amount: 1800, createdAt: at('2026-06-18', '21:47:11'), remark: '微信转账', category: '生活费', status: 'received' },
  { tradeNo: '1000050001202606130323498554910', direction: 'mom_to_daughter', amount: 200, createdAt: at('2026-06-13', '17:18:47'), remark: '微信转账', category: '红包', status: 'received' },
  { tradeNo: '1000050001202605300227594888606', direction: 'mom_to_daughter', amount: 500, createdAt: at('2026-05-30', '12:51:03'), remark: '微信转账', category: '生活费', status: 'received' },
  { tradeNo: '1000050001202605180322180531481', direction: 'mom_to_daughter', amount: 1261, createdAt: at('2026-05-18', '19:15:44'), remark: '微信转账', category: '生活费', status: 'received' },
  { tradeNo: '1000050001202605090224153832490', direction: 'mom_to_daughter', amount: 1000, createdAt: at('2026-05-09', '00:52:09'), remark: '微信转账', category: '生活费', status: 'received' },
  { tradeNo: '1000050001202604230720000280991', direction: 'mom_to_daughter', amount: 1600, createdAt: at('2026-04-23', '07:47:56'), remark: '微信转账', category: '生活费', status: 'received' },
  { tradeNo: '1000050001202604111528591381050', direction: 'mom_to_daughter', amount: 200, createdAt: at('2026-04-11', '17:26:58'), remark: '微信转账', category: '红包', status: 'received' },
  { tradeNo: '1000050001202603241229753055128', direction: 'mom_to_daughter', amount: 1400, createdAt: at('2026-03-24', '16:24:25'), remark: '微信转账', category: '生活费', status: 'received' },
  { tradeNo: '1000050001202603221025180642072', direction: 'mom_to_daughter', amount: 1000, createdAt: at('2026-03-22', '13:33:15'), remark: '微信转账', category: '生活费', status: 'received' },
  { tradeNo: '1000050001202603210924085774319', direction: 'mom_to_daughter', amount: 1600, createdAt: at('2026-03-21', '22:08:38'), remark: '微信转账', category: '生活费', status: 'received' },
  { tradeNo: '1000050001202602241128131425665', direction: 'mom_to_daughter', amount: 92, createdAt: at('2026-02-24', '19:50:07'), remark: '微信转账', category: '红包', status: 'received' },
  { tradeNo: '1000050001202602211128313933859', direction: 'mom_to_daughter', amount: 1000, createdAt: at('2026-02-21', '17:39:38'), remark: '微信转账', category: '生活费', status: 'received' },
  { tradeNo: '1000050001202602210020539013295', direction: 'mom_to_daughter', amount: 1600, createdAt: at('2026-02-21', '17:38:23'), remark: '微信转账', category: '生活费', status: 'received' },
  { tradeNo: '1000050001202602191129184323863', direction: 'mom_to_daughter', amount: 99, createdAt: at('2026-02-19', '09:00:43'), remark: '微信转账', category: '红包', status: 'received' },
  { tradeNo: '1000050001202602180522675640217', direction: 'mom_to_daughter', amount: 200, createdAt: at('2026-02-18', '19:20:03'), remark: '微信转账', category: '红包', status: 'received' },
  { tradeNo: '1000050001202602141826250727901', direction: 'mom_to_daughter', amount: 200, createdAt: at('2026-02-14', '12:59:52'), remark: '微信转账', category: '红包', status: 'received' },
  { tradeNo: '1000050001202602121726985955642', direction: 'mom_to_daughter', amount: 100, createdAt: at('2026-02-12', '16:32:02'), remark: '微信转账', category: '红包', status: 'received' },
  { tradeNo: '1000050001202602111125973838129', direction: 'mom_to_daughter', amount: 200, createdAt: at('2026-02-11', '15:46:37'), remark: '微信转账', category: '红包', status: 'received' },
  { tradeNo: '1000050001202602070229619715445', direction: 'mom_to_daughter', amount: 1600, createdAt: at('2026-02-07', '22:07:07'), remark: '微信转账', category: '生活费', status: 'received' },
  { tradeNo: '1000050001202601010621556905644', direction: 'mom_to_daughter', amount: 99.99, createdAt: at('2026-01-01', '08:10:57'), remark: '微信转账', category: '红包', status: 'received' },
  { tradeNo: '1000050001202512271424465480274', direction: 'mom_to_daughter', amount: 99, createdAt: at('2025-12-27', '17:15:33'), remark: '微信转账', category: '红包', status: 'received' },
  { tradeNo: '1000050001202511220620122446881', direction: 'mom_to_daughter', amount: 1600, createdAt: at('2025-11-22', '20:56:52'), remark: '微信转账', category: '生活费', status: 'received' },
  { tradeNo: '1000050001202511110225393715994', direction: 'mom_to_daughter', amount: 200, createdAt: at('2025-11-11', '19:58:22'), remark: '微信转账', category: '红包', status: 'received' },
  { tradeNo: '1000050001202510220925670909148', direction: 'mom_to_daughter', amount: 1600, createdAt: at('2025-10-22', '16:46:40'), remark: '微信转账', category: '生活费', status: 'received' },
  { tradeNo: '1000050001202510130520890513855', direction: 'mom_to_daughter', amount: 200, createdAt: at('2025-10-13', '11:02:23'), remark: '微信转账', category: '红包', status: 'received' },
  { tradeNo: '1000050001202510081026835776879', direction: 'mom_to_daughter', amount: 200, createdAt: at('2025-10-08', '17:44:40'), remark: '微信转账', category: '红包', status: 'received' },
  { tradeNo: '1000050001202508230125417766109', direction: 'mom_to_daughter', amount: 1500, createdAt: at('2025-08-23', '19:20:54'), remark: '微信转账', category: '生活费', status: 'received' },

  // —— 收入：爸爸 → 曹艳 ——
  {
    tradeNo: 'manual-dad-tuition-20250916',
    direction: 'dad_to_daughter',
    fromRole: 'dad',
    amount: 8000,
    createdAt: at('2025-09-16', '09:34:35'),
    remark: '学费',
    message: '收到啦，谢谢你。',
    category: '学费',
    status: 'received'
  },

  // —— 支出：曹艳 → 妈妈 ——
  {
    tradeNo: '1000050001202605100039015612068',
    direction: 'daughter_to_mom',
    amount: 88,
    createdAt: at('2026-05-10', '13:51:43'),
    remark: '祝妈妈88发大财身体健康万事如意',
    message: '祝妈妈88发大财身体健康万事如意',
    category: '小小心意',
    status: 'received'
  },
  {
    tradeNo: '1000050001202602190931931462073',
    direction: 'daughter_to_mom',
    amount: 365,
    createdAt: at('2026-02-19', '09:00:54'),
    remark: '微信转账',
    category: '小小心意',
    status: 'received'
  },
  {
    tradeNo: '1000050001202601011832509461174',
    direction: 'daughter_to_mom',
    amount: 66.6,
    createdAt: at('2026-01-01', '09:08:15'),
    remark: '微信转账',
    category: '小小心意',
    status: 'received'
  },

  // —— 已全额退款（保留但不计入统计）——
  { tradeNo: '1000050001202603240939752007696', direction: 'daughter_to_mom', amount: 20, createdAt: at('2026-03-24', '14:42:22'), remark: '微信转账（已退款）', category: '小小心意', status: 'refunded' },
  { tradeNo: '1000050001202512311338018384331', direction: 'daughter_to_mom', amount: 66.6, createdAt: at('2025-12-31', '19:04:38'), remark: '微信转账（已退款）', category: '小小心意', status: 'refunded' }
]

module.exports = {
  SEED_TRANSFERS
}
