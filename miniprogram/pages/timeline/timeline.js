const { fetchTimeline, reactTimeline, fetchTransferStats } = require('../../utils/cloud')
const { canPublish } = require('../../utils/auth')
const { markTimelineRead, refreshTimelineBadge } = require('../../utils/unread')

Page({
  data: {
    demoMode: true,
    fontClass: 'font-larger',
    canPublish: false,
    filter: 'all',
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
    markTimelineRead()
  },

  onHide() {
    refreshTimelineBadge()
  },

  async loadList() {
    wx.showNavigationBarLoading()
    try {
      const list = await fetchTimeline(this.data.filter)
      const patch = { list }
      if (this.data.filter === 'transfer') {
        patch.stats = await fetchTransferStats(this.data.transferRange)
      }
      this.setData(patch)
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      wx.hideNavigationBarLoading()
    }
  },

  onFilter(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ filter: key }, () => this.loadList())
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
