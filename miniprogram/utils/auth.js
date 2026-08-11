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

/** 妈妈 / 爸爸：都是观看者，可看可轻反馈，不可发布 */
function isParent() {
  const role = getRole()
  return role === 'mom' || role === 'dad' || role === 'parent'
}

function isMom() {
  return getRole() === 'mom'
}

function canPublishPhoto() {
  return isParent()
}

function canPublish() {
  return isPublisher()
}

function canReact() {
  return isParent() || isPublisher() || getRole() === 'guest'
}

function roleLabel(role) {
  const map = {
    daughter: '女儿（发布者）',
    mom: '妈妈（观看者）',
    dad: '爸爸（观看者）',
    parent: '家长（观看者）',
    guest: '访客（未绑定）'
  }
  return map[role] || map.guest
}

module.exports = {
  getRole,
  isPublisher,
  isParent,
  isMom,
  canPublishPhoto,
  canPublish,
  canReact,
  roleLabel
}
