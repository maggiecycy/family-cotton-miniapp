const { roleLabel, canPublish, isParent } = require('../../utils/auth')
const { createFamilyInvite } = require('../../utils/cloud')
const { setLastReadAt, refreshTimelineBadge } = require('../../utils/unread')
const { getInviteCode, buildShareAppMessage, buildShareTimeline } = require('../../utils/invite')
const { openAppSetting } = require('../../utils/permission')

Page({
  data: {
    demoMode: true,
    role: 'guest',
    roleText: '访客（未绑定）',
    isPublisher: false,
    isParent: false,
    inviteCode: 'COTTON888',
    weatherCity: '家里这座城'
  },

  onLoad() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  onShareAppMessage() {
    return buildShareAppMessage()
  },

  onShareTimeline() {
    return buildShareTimeline()
  },

  onShow() {
    this.refresh()
    refreshTimelineBadge()
  },

  refresh() {
    const app = getApp()
    const role = app.globalData.role || 'guest'
    this.setData({
      demoMode: !!app.globalData.demoMode,
      role,
      roleText: roleLabel(role),
      isPublisher: canPublish(),
      isParent: isParent(),
      inviteCode: getInviteCode(),
      weatherCity: wx.getStorageSync('weatherCity') || '家里这座城'
    })
  },

  onDemoChange(e) {
    const on = e.detail.value
    getApp().setDemoMode(on)
    if (on) {
      setLastReadAt(Date.now() - 3 * 24 * 60 * 60 * 1000)
      refreshTimelineBadge()
    }
    this.refresh()
    wx.showToast({
      title: on ? '演示模式已开' : '演示模式已关（将走云数据）',
      icon: 'none'
    })
  },

  onPickRole() {
    wx.showActionSheet({
      itemList: ['女儿（发布者）', '妈妈（观看者）', '爸爸（观看者）', '访客（未绑定）'],
      success: (res) => {
        const roles = ['daughter', 'mom', 'dad', 'guest']
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
    wx.setClipboardData({
      data: this.data.inviteCode,
      success: () => wx.showToast({ title: '邀请码已复制', icon: 'none' })
    })
  },

  async onCreateInvite() {
    wx.showLoading({ title: '生成中' })
    try {
      const result = await createFamilyInvite()
      wx.hideLoading()
      if (result && result.ok && result.inviteCode) {
        wx.setStorageSync('inviteCode', result.inviteCode)
        if (result.familyId) {
          getApp().globalData.familyId = result.familyId
          wx.setStorageSync('familyId', result.familyId)
        }
        getApp().setRole('daughter')
        this.refresh()
        wx.showModal({
          title: result.demo ? '演示邀请码' : '真实邀请码已生成',
          content: `请把邀请码发给爸妈：\n${result.inviteCode}`,
          showCancel: false
        })
      } else {
        wx.showToast({ title: (result && result.message) || '生成失败', icon: 'none' })
      }
    } catch (e) {
      wx.hideLoading()
      console.warn(e)
      wx.showModal({
        title: '生成失败',
        content: '请先部署云函数 bindFamily；或暂时打开演示模式用 COTTON888。',
        showCancel: false
      })
    }
  },

  onOpenSetting() {
    openAppSetting()
  },

  onBind() {
    wx.navigateTo({ url: `/pages/bind/bind?invite=${encodeURIComponent(this.data.inviteCode)}` })
  },

  go(e) {
    wx.navigateTo({ url: e.currentTarget.dataset.url })
  }
})
