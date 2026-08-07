const { createTimelineItem, isDemo } = require('../../utils/cloud')
const { canPublish } = require('../../utils/auth')

Page({
  data: {
    fontClass: 'font-larger',
    text: '',
    images: [],
    submitting: false
  },

  onShow() {
    if (!canPublish()) {
      wx.showToast({ title: '仅女儿可发布', icon: 'none' })
      setTimeout(() => wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/mine/mine' }) }), 500)
      return
    }
    const app = getApp()
    this.setData({
      fontClass: app.globalData.fontScale === 'larger' ? 'font-larger' : ''
    })
  },

  onInput(e) {
    this.setData({ text: e.detail.value })
  },

  onChoose() {
    const remain = 3 - this.data.images.length
    if (remain <= 0) return
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const paths = (res.tempFiles || []).map((f) => f.tempFilePath)
        this.setData({ images: this.data.images.concat(paths).slice(0, 3) })
      }
    })
  },

  onRemove(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.images.slice()
    images.splice(index, 1)
    this.setData({ images })
  },

  onPreview(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: this.data.images
    })
  },

  async uploadImages(localPaths) {
    if (!localPaths.length) return []
    if (isDemo()) return localPaths
    const familyId = getApp().globalData.familyId || 'unknown'
    const uploaded = []
    for (let i = 0; i < localPaths.length; i += 1) {
      const cloudPath = `notes/${familyId}/${Date.now()}_${i}.jpg`
      const up = await wx.cloud.uploadFile({
        cloudPath,
        filePath: localPaths[i]
      })
      uploaded.push(up.fileID)
    }
    return uploaded
  },

  async onSubmit() {
    const text = (this.data.text || '').trim()
    if (!text && !this.data.images.length) {
      wx.showToast({ title: '写一句或选一张照片', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    try {
      const images = await this.uploadImages(this.data.images)
      await createTimelineItem({ type: 'note', text, images })
      wx.showToast({ title: '已放进时光轴', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 500)
    } catch (e) {
      console.warn(e)
      wx.showToast({ title: '提交失败，可重试', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
