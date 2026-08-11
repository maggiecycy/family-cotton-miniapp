const { getTransferTimeline, monthTransferCount } = require('../utils/transferLedger')

const DEFAULT_LINES = [
  '妈，我在呢。今天也要开心一点。',
  '记得吃饭，别只顾着忙。',
  '想你了，但别担心，我挺好的。',
  '天气变化记得添衣服。',
  '今天的你，也值得被好好对待。',
  '有我在，慢慢来就好。',
  '妈，给自己泡杯热茶吧。',
  '辛苦一天了，早点休息。'
]

function getMockTimeline(transferRange = 'year') {
  // 照片只出现在「照片墙」Tab，不混进全部/语音/纸条
  const transfers = getTransferTimeline(transferRange).filter((t) => t.status !== 'refunded')
  return transfers.sort((a, b) => b.createdAt - a.createdAt)
}

function getMockStats() {
  const now = new Date()
  return {
    voiceMonth: 0,
    transferMonth: monthTransferCount(now)
  }
}

function getMockDailyLine(dateKey) {
  let hash = 0
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash + dateKey.charCodeAt(i) * (i + 1)) % DEFAULT_LINES.length
  }
  return DEFAULT_LINES[hash]
}

module.exports = {
  DEFAULT_LINES,
  getMockTimeline,
  getMockStats,
  getMockDailyLine
}
