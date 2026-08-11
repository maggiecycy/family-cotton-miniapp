/** 家庭邀请码与分享配置 */

const DEFAULT_INVITE_CODE = 'COTTON888'
const PENDING_KEY = 'pendingInviteCode'

function getInviteCode() {
  try {
    const stored = wx.getStorageSync('inviteCode')
    if (stored) return String(stored).trim().toUpperCase()
  } catch (e) {
    // ignore
  }
  return DEFAULT_INVITE_CODE
}

function setPendingInvite(code) {
  const c = String(code || '').trim().toUpperCase()
  if (!c) return
  wx.setStorageSync(PENDING_KEY, c)
}

function consumePendingInvite() {
  try {
    const c = wx.getStorageSync(PENDING_KEY)
    if (c) {
      wx.removeStorageSync(PENDING_KEY)
      return String(c).trim().toUpperCase()
    }
  } catch (e) {
    // ignore
  }
  return ''
}

function peekPendingInvite() {
  try {
    return String(wx.getStorageSync(PENDING_KEY) || '').trim().toUpperCase()
  } catch (e) {
    return ''
  }
}

/** 分享卡片：进独立绑定页 */
function buildShareAppMessage() {
  const code = getInviteCode()
  return {
    title: '云端小棉袄 · 女儿留给家人的陪伴',
    path: `/pages/bind/bind?invite=${encodeURIComponent(code)}`,
    imageUrl: '/assets/avatar/idle.jpg'
  }
}

function buildShareTimeline() {
  const code = getInviteCode()
  return {
    title: '云端小棉袄 · 给爸妈的小陪伴',
    query: `invite=${encodeURIComponent(code)}`,
    imageUrl: '/assets/avatar/idle.jpg'
  }
}

module.exports = {
  DEFAULT_INVITE_CODE,
  getInviteCode,
  setPendingInvite,
  consumePendingInvite,
  peekPendingInvite,
  buildShareAppMessage,
  buildShareTimeline
}
