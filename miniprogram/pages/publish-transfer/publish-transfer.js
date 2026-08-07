const { createTimelineItem } = require('../../utils/cloud')
const { canPublish } = require('../../utils/auth')

const DIRECTIONS = [
  {
    key: 'mom_to_daughter',
    label: '妈妈 → 我（感恩纪录）',
    remark: '妈妈的心意',
    message: '妈，我收到了，会好好吃饭的。谢谢你。',
    categories: ['生活费', '红包', '看病相关', '随便花']
  },
  {
    key: 'daughter_to_mom',
    label: '我 → 妈妈（回报心意）',
    remark: '给妈妈的小小心意',
    message: '一点心意，谢谢你一直照顾我。',
    categories: ['小小心意', '红包', '买药/水果', '随便花']
  }
]

Page({
  data: {
    fontClass: 'font-larger',
    amount: '',
    remark: '',
    message: '',
    directionIndex: 0,
    directionLabels: DIRECTIONS.map((d) => d.label),
    categories: DIRECTIONS[0].categories,
    categoryIndex: 0,
    remarkPlaceholder: DIRECTIONS[0].remark,
    messagePlaceholder: DIRECTIONS[0].message,
    submitting: false
  },

  onShow() {
    if (!canPublish()) {
      wx.showToast({ title: '仅女儿可记录', icon: 'none' })
      setTimeout(() => wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/mine/mine' }) }), 500)
      return
    }
    const app = getApp()
    this.setData({
      fontClass: app.globalData.fontScale === 'larger' ? 'font-larger' : ''
    })
    this.applyDirection(0)
  },

  applyDirection(index) {
    const d = DIRECTIONS[index] || DIRECTIONS[0]
    this.setData({
      directionIndex: index,
      categories: d.categories,
      categoryIndex: 0,
      remarkPlaceholder: d.remark,
      messagePlaceholder: d.message,
      remark: this.data.remark || '',
      message: this.data.message || ''
    })
  },

  onDirection(e) {
    this.applyDirection(Number(e.detail.value))
  },
  onAmount(e) {
    this.setData({ amount: e.detail.value })
  },
  onRemark(e) {
    this.setData({ remark: e.detail.value })
  },
  onMessage(e) {
    this.setData({ message: e.detail.value })
  },
  onCategory(e) {
    this.setData({ categoryIndex: Number(e.detail.value) })
  },

  async onSubmit() {
    const amount = Number(this.data.amount)
    if (!amount || amount <= 0) {
      wx.showToast({ title: '请填写金额', icon: 'none' })
      return
    }
    const dir = DIRECTIONS[this.data.directionIndex]
    this.setData({ submitting: true })
    try {
      await createTimelineItem({
        type: 'transfer',
        direction: dir.key,
        amount,
        currency: 'CNY',
        category: this.data.categories[this.data.categoryIndex],
        remark: this.data.remark || dir.remark,
        message: this.data.message || dir.message
      })
      wx.showToast({ title: '已记下', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 500)
    } catch (e) {
      wx.showToast({ title: '提交失败，可重试', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
