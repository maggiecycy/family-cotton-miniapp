const { createTimelineItem } = require('../../utils/cloud')
const { canPublish } = require('../../utils/auth')
const { requestSubscribe, notifyFamily } = require('../../utils/subscribe')

Page({
  data: {
    text: '',
    submitting: false
  },

  onShow() {
    if (!canPublish()) {
      wx.showToast({ title: '仅女儿可发布', icon: 'none' })
      setTimeout(() => wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/mine/mine' }) }), 500)
    }
  },

  onInput(e) {
    this.setData({ text: e.detail.value })
  },

  async onSubmit() {
    const text = (this.data.text || '').trim()
    if (!text) {
      wx.showToast({ title: '写一句暖的再发送', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    try {
      await createTimelineItem({ type: 'note', text, images: [] })
      await requestSubscribe(['voice', 'festival'])
      await notifyFamily('voice', {
        title: '女儿写了新纸条',
        hint: '打开时光轴查看',
        page: 'pages/timeline/timeline'
      })
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
