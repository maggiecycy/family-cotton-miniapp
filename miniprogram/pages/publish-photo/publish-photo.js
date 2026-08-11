const { createTimelineItem, isDemo } = require('../../utils/cloud')
const { canPublishPhoto, getRole } = require('../../utils/auth')
const { requestSubscribe, notifyFamily } = require('../../utils/subscribe')

const MAX_COUNT = 9

Page({
  data: {
    images: [],
    caption: '',
    submitting: false,
    maxCount: MAX_COUNT
  },

  onShow() {
    if (!canPublishPhoto()) {
      wx.showToast({ title: '绑定后才可上传照片', icon: 'none' })
      setTimeout(() => wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/mine/mine' }) }), 500)
    }
  },

  onChoose() {
    const remain = MAX_COUNT - this.data.images.length
    if (remain <= 0) {
      wx.showToast({ title: `一次最多 ${MAX_COUNT} 张`, icon: 'none' })
      return
    }
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const files = (res.tempFiles || []).map((f) => f.tempFilePath).filter(Boolean)
        if (!files.length) return
        const images = this.data.images.concat(files).slice(0, MAX_COUNT)
        this.setData({ images })
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

  onPreview(e) {
    const src = e.currentTarget.dataset.src
    wx.previewImage({ urls: this.data.images, current: src })
  },

  onRemove(e) {
    const index = Number(e.currentTarget.dataset.index)
    if (Number.isNaN(index)) return
    const images = this.data.images.slice()
    images.splice(index, 1)
    this.setData({ images })
  },

  async uploadImage(localPath, index) {
    if (isDemo()) return localPath
    const familyId = getApp().globalData.familyId || 'unknown'
    const up = await wx.cloud.uploadFile({
      cloudPath: `photos/${familyId}/${Date.now()}-${index}.jpg`,
      filePath: localPath
    })
    return up.fileID
  },

  async onSubmit() {
    if (!this.data.images.length) {
      wx.showToast({ title: '请先选照片', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    try {
      const caption = (this.data.caption || '').trim()
      const role = getRole()
      const fileIDs = []
      for (let i = 0; i < this.data.images.length; i += 1) {
        fileIDs.push(await this.uploadImage(this.data.images[i], i))
      }
      for (let i = 0; i < fileIDs.length; i += 1) {
        await createTimelineItem({
          type: 'photo',
          image: fileIDs[i],
          text: i === 0 ? caption : '',
          fromRole: role
        })
      }
      await requestSubscribe(['photo', 'festival'])
      await notifyFamily('photo', {
        title: '家庭相册有新照片',
        hint: fileIDs.length > 1 ? `新上传了 ${fileIDs.length} 张` : '打开时光轴照片墙',
        page: 'pages/timeline/timeline'
      })
      wx.showToast({ title: `已上传 ${fileIDs.length} 张`, icon: 'success' })
      setTimeout(() => wx.navigateBack(), 500)
    } catch (e) {
      console.warn(e)
      wx.showToast({ title: '上传失败，请重试', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
