const { getReminds, toggleRemind } = require('../../utils/remind')

Page({
  data: {
    list: []
  },

  onShow() {
    this.setData({ list: getReminds() })
  },

  onToggle(e) {
    const id = e.currentTarget.dataset.id
    const enabled = e.detail.value
    this.setData({ list: toggleRemind(id, enabled) })
    wx.showToast({
      title: enabled ? '已开启（本地）' : '已关闭',
      icon: 'none'
    })
  }
})
