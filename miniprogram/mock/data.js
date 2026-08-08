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

function daysAgo(n, hour = 19, minute = 30) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, minute, 0, 0)
  return d.getTime()
}

function getMockNonTransfer() {
  return [
    {
      _id: 'mock-voice-1',
      type: 'voice',
      fileID: '/assets/audio/demo-voice.wav',
      localSrc: '/assets/audio/demo-voice.wav',
      durationMs: 2500,
      createdAt: daysAgo(0, 20, 12),
      message: '妈，我到家啦，今天挺顺利的。',
      reactions: { received: 1, like: 1, miss: 0 }
    },
    {
      _id: 'mock-note-1',
      type: 'note',
      text: '今天路过那家包子铺，想起你总说要早起吃热乎的。下次回家带给你。',
      images: [],
      createdAt: daysAgo(2, 21, 40),
      reactions: { received: 0, like: 1, miss: 1 }
    },
    {
      _id: 'mock-voice-2',
      type: 'voice',
      fileID: '/assets/audio/demo-voice.wav',
      localSrc: '/assets/audio/demo-voice.wav',
      durationMs: 2500,
      createdAt: daysAgo(3, 18, 22),
      message: '周末会给你打电话，你先好好休息。',
      reactions: { received: 1, like: 0, miss: 0 }
    },
    {
      _id: 'mock-note-2',
      type: 'note',
      text: '体检报告放抽屉第二层了，别忘了拿。有不懂的问我。',
      images: ['/assets/avatar/photo.jpg'],
      createdAt: daysAgo(7, 16, 5),
      reactions: { received: 1, like: 0, miss: 0 }
    },
    {
      _id: 'mock-note-3',
      type: 'note',
      text: '妈，这些心意我都记着。以后我也能更常回报你。',
      images: [],
      createdAt: daysAgo(12, 10, 0),
      reactions: { received: 0, like: 0, miss: 0 }
    },
    {
      _id: 'mock-voice-3',
      type: 'voice',
      fileID: '/assets/audio/demo-voice.wav',
      localSrc: '/assets/audio/demo-voice.wav',
      durationMs: 2500,
      createdAt: daysAgo(14, 22, 8),
      message: '晚安，妈。梦里见。',
      createdBy: 'daughter',
      reactions: { received: 1, like: 1, miss: 1 }
    }
  ]
}

function getMockTimeline(transferRange = 'year') {
  const transfers = getTransferTimeline(transferRange).filter((t) => t.status !== 'refunded')
  return getMockNonTransfer()
    .concat(transfers)
    .sort((a, b) => b.createdAt - a.createdAt)
}

function getMockStats() {
  const voices = getMockNonTransfer().filter((i) => i.type === 'voice')
  const now = new Date()
  let voiceMonth = 0
  voices.forEach((item) => {
    const d = new Date(item.createdAt)
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
      voiceMonth += 1
    }
  })
  return {
    voiceMonth,
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
