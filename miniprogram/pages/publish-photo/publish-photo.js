const { createTimelineItem, isDemo } = require('../../utils/cloud')
const { canPublishPhoto, getRole } = require('../../utils/auth')
const { requestSubscribe, notifyFamily } = require('../../utils/subscribe')

Page({
  data: {
    image: '',
    caption: '',
    submitting: false
  },

  onShow() {
    if (!canPublishPhoto()) {
      wx.showToast({ title: '仅家长可上传照片', icon: 'none' })
      setTimeout(() => wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/mine/mine' }) }), 500)
    }
  },

  onChoose() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const file = (res.tempFiles && res.tempFiles[0]) || null
        if (file) this.setData({ image: file.tempFilePath })
      },
      fail: (err) => {
        console.warn(err)
        wx.showModal({
          title: '无法打开相册/相机',
          content: '请在设置中允许访问相册或相机后重试。',
          confirmText: '去开启',
          success: (r) => {
            if (r.confirm) wx.openSetting({})
          }
        })
      }
    })
  },

  onInput(e) {
    this.setData({ caption: e.detail.value })
  },

  onPreview() {
    if (!this.data.image) return
    wx.previewImage({ urls: [this.data.image], current: this.data.image })
  },

  async uploadImage(localPath) {
    if (isDemo()) return localPath
    const familyId = getApp().globalData.familyId || 'unknown'
    const up = await wx.cloud.uploadFile({
      cloudPath: `photos/${familyId}/${Date.now()}.jpg`,
      filePath: localPath
    })
    return up.fileID
  },

  async onSubmit() {
    if (!this.data.image) {
      wx.showToast({ title: '请先选一张照片', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    try {
      const image = await this.uploadImage(this.data.image)
      await createTimelineItem({
        type: 'photo',
        image,
        text: (this.data.caption || '').trim(),
        fromRole: getRole()
      })
      await requestSubscribe(['photo', 'festival'])
      await notifyFamily('photo', {
        title: '家庭相册有新照片',
        hint: '打开时光轴照片墙',
        page: 'pages/timeline/timeline'
      })
      wx.showToast({ title: '已放进照片墙', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 500)
    } catch (e) {
      console.warn(e)
      wx.showToast({ title: '上传失败，请重试', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
