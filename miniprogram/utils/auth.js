function getAppSafe() {
  try {
    return getApp()
  } catch (e) {
    return null
  }
}

function getRole() {
  const app = getAppSafe()
  return (app && app.globalData.role) || wx.getStorageSync('role') || 'guest'
}

function isPublisher() {
  return getRole() === 'daughter'
}

function isMom() {
  return getRole() === 'mom'
}

function canPublish() {
  // 演示模式下也允许开发者切换到女儿身份体验发布页
  return isPublisher()
}

function roleLabel(role) {
  const map = {
    daughter: '女儿（发布者）',
    mom: '妈妈（观看者）',
    guest: '访客（未绑定）'
  }
  return map[role] || map.guest
}

module.exports = {
  getRole,
  isPublisher,
  isMom,
  canPublish,
  roleLabel
}
