/**
 * 可持续更新的心意账本：
 * - 种子数据（凭证导入）常驻
 * - 用户新记的一笔写入本地 Storage，按 tradeNo/_id 去重合并
 * - 统计支持：全部 / 近一年
 */

const { SEED_TRANSFERS } = require('../mock/transfers')

const APPEND_KEY = 'transferLedgerAppend'
const YEAR_MS = 365 * 24 * 60 * 60 * 1000

function toTimelineItem(raw) {
  const direction = raw.direction || 'mom_to_daughter'
  const isIn = direction === 'mom_to_daughter'
  return {
    _id: raw._id || `transfer-${raw.tradeNo || raw.createdAt}`,
    type: 'transfer',
    direction,
    amount: Number(raw.amount),
    currency: 'CNY',
    category: raw.category || (isIn ? '生活费' : '小小心意'),
    fromRole: raw.fromRole || '',
    remark: raw.remark || (isIn ? '家长的心意' : '给家长的心意'),
    message:
      raw.message ||
      (isIn ? '我收到了，谢谢你。' : '一点心意，谢谢你一直照顾我。'),
    tradeNo: raw.tradeNo || '',
    status: raw.status || 'received',
    source: raw.source || 'seed',
    createdAt: raw.createdAt,
    createdBy: 'daughter',
    reactions: raw.reactions || { received: 0, like: 0, miss: 0 }
  }
}

function readAppended() {
  try {
    const list = wx.getStorageSync(APPEND_KEY)
    return Array.isArray(list) ? list : []
  } catch (e) {
    return []
  }
}

function writeAppended(list) {
  wx.setStorageSync(APPEND_KEY, list)
}

function getAllTransfers() {
  const map = new Map()
  SEED_TRANSFERS.forEach((item) => {
    const row = toTimelineItem({ ...item, source: 'seed' })
    map.set(row.tradeNo || row._id, row)
  })
  readAppended().forEach((item) => {
    const row = toTimelineItem({ ...item, source: item.source || 'manual' })
    map.set(row.tradeNo || row._id, row)
  })
  return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt)
}

function filterByRange(list, range = 'year') {
  if (range === 'all') return list.slice()
  const since = Date.now() - YEAR_MS
  return list.filter((item) => item.createdAt >= since)
}

function activeOnly(list) {
  return list.filter((item) => item.status !== 'refunded')
}

function computeStats(list) {
  const active = activeOnly(list)
  const income = active.filter((i) => i.direction === 'mom_to_daughter')
  const expense = active.filter((i) => i.direction === 'daughter_to_mom')
  const incomeAmounts = income.map((i) => i.amount)
  const expenseAmounts = expense.map((i) => i.amount)
  const sum = (arr) => arr.reduce((a, b) => a + b, 0)
  const maxOf = (arr) => (arr.length ? Math.max(...arr) : 0)
  const minOf = (arr) => (arr.length ? Math.min(...arr) : 0)
  const avgOf = (arr) => (arr.length ? sum(arr) / arr.length : 0)

  return {
    count: active.length,
    refundedCount: list.length - active.length,
    incomeCount: income.length,
    expenseCount: expense.length,
    incomeTotal: round2(sum(incomeAmounts)),
    expenseTotal: round2(sum(expenseAmounts)),
    incomeMax: round2(maxOf(incomeAmounts)),
    incomeMin: round2(minOf(incomeAmounts)),
    incomeAvg: round2(avgOf(incomeAmounts)),
    expenseMax: round2(maxOf(expenseAmounts)),
    expenseMin: round2(minOf(expenseAmounts)),
    netFromMom: round2(sum(incomeAmounts) - sum(expenseAmounts))
  }
}

function round2(n) {
  return Math.round(n * 100) / 100
}

function addTransfer(payload) {
  const row = {
    ...payload,
    _id: payload._id || `manual-${Date.now()}`,
    tradeNo: payload.tradeNo || `manual-${Date.now()}`,
    status: payload.status || 'received',
    source: 'manual',
    createdAt: payload.createdAt || Date.now()
  }
  const list = readAppended()
  list.unshift(row)
  writeAppended(list)
  return toTimelineItem(row)
}

function getTransferTimeline(range = 'year') {
  return filterByRange(getAllTransfers(), range)
}

function getTransferStats(range = 'year') {
  return computeStats(getTransferTimeline(range))
}

function monthTransferCount(now = new Date()) {
  const list = activeOnly(getAllTransfers())
  return list.filter((item) => {
    const d = new Date(item.createdAt)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length
}

module.exports = {
  APPEND_KEY,
  getAllTransfers,
  getTransferTimeline,
  getTransferStats,
  addTransfer,
  monthTransferCount,
  filterByRange,
  activeOnly
}
