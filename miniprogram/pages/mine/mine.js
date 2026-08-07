const { roleLabel, canPublish } = require('../../utils/auth')
const { bindFamily } = require('../../utils/cloud')
const { setLastReadAt, refreshTimelineBadge } = require('../../utils/unread')

Page({
  data: {
    demoMode: true,
    largerFont: true,
    fontClass: 'font-larger',
    role: 'guest',
    roleText: '访客（未绑定）',
    isPublisher: false,
    inviteCode: 'COTTON888',
    weatherCity: '家里这座城'
  },

  onShow() {
    this.refresh()
    refreshTimelineBadge()
  },

  refresh() {
    const app = getApp()
    const role = app.globalData.role || 'guest'
    const largerFont = app.globalData.fontScale !== 'normal'
    this.setData({
      demoMode: !!app.globalData.demoMode,
      largerFont,
      fontClass: largerFont ? 'font-larger' : '',
      role,
      roleText: roleLabel(role),
      isPublisher: canPublish(),
      weatherCity: wx.getStorageSync('weatherCity') || '家里这座城'
    })
  },

  onDemoChange(e) {
    const on = e.detail.value
    getApp().setDemoMode(on)
    if (on) {
      // 打开演示时把已读时间拨回 3 天前，方便再看到未读角标
      setLastReadAt(Date.now() - 3 * 24 * 60 * 60 * 1000)
      refreshTimelineBadge()
    }
    this.refresh()
    wx.showToast({
      title: on ? '演示模式已开' : '演示模式已关（将走云数据）',
      icon: 'none'
    })
  },

  onFontChange(e) {
    getApp().setFontScale(e.detail.value ? 'larger' : 'normal')
    this.refresh()
  },

  onPickRole() {
    wx.showActionSheet({
      itemList: ['女儿（发布者）', '妈妈（观看者）', '访客（未绑定）'],
      success: (res) => {
        const roles = ['daughter', 'mom', 'guest']
        getApp().setRole(roles[res.tapIndex])
        this.refresh()
      }
    })
  },

  onSetCity() {
    wx.showModal({
      title: '设置天气城市',
      editable: true,
      placeholderText: '例如 北京 / 上海 / 成都',
      content: this.data.weatherCity === '家里这座城' ? '' : this.data.weatherCity,
      success: (res) => {
        if (!res.confirm) return
        const city = (res.content || '').trim() || '家里这座城'
        wx.setStorageSync('weatherCity', city)
        this.setData({ weatherCity: city })
        wx.showToast({ title: '已保存', icon: 'none' })
      }
    })
  },

  onResetUnread() {
    setLastReadAt(Date.now() - 3 * 24 * 60 * 60 * 1000)
    refreshTimelineBadge()
    wx.showToast({ title: '未读角标已刷新', icon: 'none' })
  },

  onInvite() {
    if (this.data.demoMode) {
      wx.setClipboardData({
        data: this.data.inviteCode,
        success: () => wx.showToast({ title: '演示邀请码已复制', icon: 'none' })
      })
      return
    }
    wx.showToast({ title: '请先开通并配置云开发', icon: 'none' })
  },

  onBind() {
    wx.showModal({
      title: '输入家庭邀请码',
      editable: true,
      placeholderText: '例如 COTTON888',
      success: async (res) => {
        if (!res.confirm) return
        const code = (res.content || '').trim()
        if (!code) return
        try {
          const result = await bindFamily(code)
          if (result && result.ok) {
            getApp().globalData.familyId = result.familyId
            wx.setStorageSync('familyId', result.familyId)
            getApp().setRole('mom')
            this.refresh()
            wx.showToast({ title: '绑定成功', icon: 'success' })
          } else {
            wx.showToast({ title: (result && result.message) || '绑定失败', icon: 'none' })
          }
        } catch (e) {
          wx.showToast({ title: '绑定失败', icon: 'none' })
        }
      }
    })
  },

  go(e) {
    wx.navigateTo({ url: e.currentTarget.dataset.url })
  }
})
