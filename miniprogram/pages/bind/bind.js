const { bindFamily } = require('../../utils/cloud')
const { getInviteCode, setPendingInvite, consumePendingInvite } = require('../../utils/invite')

Page({
  data: {
    inviteCode: '',
    binding: false,
    tip: '选择你的身份完成绑定后，即可听女儿留言、看时光轴。'
  },

  onLoad(query) {
    const fromQuery = (query && (query.invite || query.code)) || ''
    if (fromQuery) setPendingInvite(fromQuery)
    const code = String(fromQuery || consumePendingInvite() || getInviteCode()).trim().toUpperCase()
    this.setData({ inviteCode: code })
  },

  onInput(e) {
    this.setData({ inviteCode: (e.detail.value || '').trim().toUpperCase() })
  },

  onPickRole(e) {
    const role = e.currentTarget.dataset.role
    this.doBind(role)
  },

  async doBind(role) {
    const code = (this.data.inviteCode || '').trim().toUpperCase()
    if (!code) {
      wx.showToast({ title: '请填写邀请码', icon: 'none' })
      return
    }
    this.setData({ binding: true })
    try {
      const app = getApp()
      const demoOn = !!(app && app.globalData.demoMode)
      const result = await bindFamily(code, { role, action: 'join' })
      if (result && result.ok) {
        getApp().globalData.familyId = result.familyId || 'demo-family'
        wx.setStorageSync('familyId', getApp().globalData.familyId)
        wx.setStorageSync('inviteCode', code)
        getApp().setRole(role)
        wx.showToast({
          title: demoOn || result.demo
            ? (role === 'dad' ? '演示：爸爸已绑定' : '演示：妈妈已绑定')
            : role === 'dad'
              ? '爸爸绑定成功'
              : '妈妈绑定成功',
          icon: 'success'
        })
        setTimeout(() => {
          wx.switchTab({ url: '/pages/home/home' })
        }, 600)
      } else {
        const msg = (result && result.message) || '绑定失败'
        wx.showModal({
          title: '绑定未成功',
          content: msg,
          showCancel: false
        })
      }
    } catch (e) {
      console.warn('bind failed', e)
      const errMsg = (e && (e.errMsg || e.message)) || ''
      let tip = '绑定失败'
      if (/FUNCTION_NOT_FOUND|not found/i.test(errMsg)) {
        tip = '云函数 bindFamily 未部署。请在开发者工具右键 cloudfunctions/bindFamily → 上传并部署'
      } else if (/env|501000/i.test(errMsg)) {
        tip = '云环境未就绪，请确认 app.js 环境 ID，或先打开演示模式测试'
      } else if (errMsg) {
        tip = errMsg.slice(0, 80)
      }
      wx.showModal({ title: '绑定失败', content: tip, showCancel: false })
    } finally {
      this.setData({ binding: false })
    }
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  }
})
