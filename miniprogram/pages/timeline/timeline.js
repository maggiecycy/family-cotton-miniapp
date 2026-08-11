const { fetchTimeline, reactTimeline, fetchTransferStats, deleteTimelineItem } = require('../../utils/cloud')
const { canPublish, canPublishPhoto } = require('../../utils/auth')
const { markTimelineRead, refreshTimelineBadge } = require('../../utils/unread')
const { relativeDayLabel } = require('../../utils/date')
const { saveImageToAlbum } = require('../../utils/permission')

function roleShort(role) {
  if (role === 'dad') return '爸爸'
  if (role === 'grandma') return '外婆'
  if (role === 'mom') return '妈妈'
  if (role === 'daughter') return '女儿'
  return '家长'
}

Page({
  data: {
    demoMode: true,
    canPublish: false,
    canPublishPhoto: false,
    filter: 'all',
    transferRange: 'year',
    filters: [
      { key: 'all', label: '全部' },
      { key: 'voice', label: '语音' },
      { key: 'transfer', label: '心意' },
      { key: 'note', label: '纸条' },
      { key: 'photo', label: '照片墙' }
    ],
    list: [],
    photoList: [],
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
      canPublish: canPublish(),
      canPublishPhoto: canPublishPhoto(),
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
      if (this.data.filter === 'photo') {
        patch.photoList = list.map((item) => ({
          ...item,
          roleLabel: roleShort(item.fromRole),
          dayLabel: relativeDayLabel(item.createdAt)
        }))
      }
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
  },

  onPreviewPhoto(e) {
    const src = e.currentTarget.dataset.src
    const urls = this.data.photoList.map((p) => p.image)
    wx.previewImage({ current: src, urls: urls.length ? urls : [src] })
  },

  async onSavePhoto(e) {
    const src = e.currentTarget.dataset.src
    await saveImageToAlbum(src)
  },

  onDeletePhoto(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    wx.showModal({
      title: '删除这张照片？',
      content: '删除后照片墙将不再显示。',
      confirmText: '删除',
      confirmColor: '#D96B54',
      success: async (res) => {
        if (!res.confirm) return
        const result = await deleteTimelineItem(id)
        if (!result || result.ok === false) {
          wx.showToast({ title: '删除失败', icon: 'none' })
          return
        }
        wx.showToast({ title: '已删除', icon: 'success' })
        this.loadList()
      }
    })
  }
})
