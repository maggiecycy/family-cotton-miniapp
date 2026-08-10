const { fetchTimeline, reactTimeline, fetchTransferStats, isDemo, isCloudReady } = require('../../utils/cloud')
const { canPublish } = require('../../utils/auth')
const { markTimelineReadFromList, refreshTimelineBadge } = require('../../utils/unread')
const { resolveTimelineMedia } = require('../../utils/media')

function buildMonthOptions(list) {
  const keys = new Set()
  ;(list || []).forEach((item) => {
    const d = new Date(item.createdAt || 0)
    if (!item.createdAt) return
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    keys.add(key)
  })
  const sorted = Array.from(keys).sort().reverse()
  const options = [{ key: 'all', label: '全部月份' }]
  sorted.forEach((key) => {
    const [, m] = key.split('-')
    options.push({ key, label: `${parseInt(m, 10)}月` })
  })
  return options
}

function filterByMonth(list, monthKey) {
  if (!monthKey || monthKey === 'all') return list || []
  const [y, m] = monthKey.split('-').map((v) => parseInt(v, 10))
  return (list || []).filter((item) => {
    const d = new Date(item.createdAt || 0)
    return d.getFullYear() === y && d.getMonth() + 1 === m
  })
}

Page({
  data: {
    demoMode: true,
    fontClass: 'font-larger',
    canPublish: false,
    filter: 'all',
    monthFilter: 'all',
    monthOptions: [{ key: 'all', label: '全部月份' }],
    transferRange: 'year',
    filters: [
      { key: 'all', label: '全部' },
      { key: 'voice', label: '语音' },
      { key: 'transfer', label: '心意' },
      { key: 'note', label: '纸条' }
    ],
    list: [],
    speakingId: '',
    fabOpen: false,
    stats: {
      incomeTotal: 0,
      expenseTotal: 0,
      incomeCount: 0,
      incomeMax: 0,
      incomeMin: 0,
      incomeAvg: 0
    }
  },

  onShow() {
    const app = getApp()
    const preferred = wx.getStorageSync('timelineFilter')
    if (preferred) {
      wx.removeStorageSync('timelineFilter')
      this.setData({ filter: preferred })
    }
    const transferRange = wx.getStorageSync('transferRange') || 'year'
    this.setData({
      demoMode: !!app.globalData.demoMode,
      fontClass: app.globalData.fontScale === 'larger' ? 'font-larger' : '',
      canPublish: canPublish(),
      transferRange
    })
    this.loadList()
  },

  onHide() {
    refreshTimelineBadge()
  },

  async loadList() {
    wx.showNavigationBarLoading()
    try {
      const raw = await fetchTimeline(this.data.filter)
      const monthOptions = buildMonthOptions(raw)
      let list = filterByMonth(raw, this.data.monthFilter)
      if (!isDemo() && isCloudReady()) {
        list = await resolveTimelineMedia(list)
      }
      const patch = { list, monthOptions }
      if (this.data.filter === 'transfer') {
        patch.stats = await fetchTransferStats(this.data.transferRange)
      }
      this.setData(patch)
      markTimelineReadFromList(raw)
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      wx.hideNavigationBarLoading()
    }
  },

  onFilter(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ filter: key, monthFilter: 'all' }, () => this.loadList())
  },

  onMonthFilter(e) {
    const monthFilter = e.currentTarget.dataset.key
    this.setData({ monthFilter }, () => this.loadList())
  },

  onRange(e) {
    const transferRange = e.currentTarget.dataset.range
    wx.setStorageSync('transferRange', transferRange)
    this.setData({ transferRange }, () => this.loadList())
  },

  async onReact(e) {
    const { id, key } = e.detail
    const list = this.data.list.map((item) => {
      if (item._id !== id) return item
      const reactions = { ...item.reactions }
      reactions[key] = (reactions[key] || 0) + 1
      return { ...item, reactions }
    })
    this.setData({ list })
    try {
      await reactTimeline(id, key)
      wx.showToast({ title: '已记下', icon: 'none' })
    } catch (err) {
      wx.showToast({ title: '反馈失败', icon: 'none' })
    }
  },

  onVoicePlay(e) {
    this.setData({ speakingId: e.detail.id })
  },

  onVoiceEnd() {
    this.setData({ speakingId: '' })
  },

  toggleFab() {
    this.setData({ fabOpen: !this.data.fabOpen })
  },

  goPublish(e) {
    const url = e.currentTarget.dataset.url
    this.setData({ fabOpen: false })
    if (!url) return
    wx.navigateTo({ url })
  }
})
