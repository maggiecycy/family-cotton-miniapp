/**
 * 家长照片墙（本地持久化；云模式同步 timeline type=photo）
 */

const STORAGE_KEY = 'photoWallItems'

function getPhotos() {
  try {
    const list = wx.getStorageSync(STORAGE_KEY)
    return Array.isArray(list) ? list : []
  } catch (e) {
    return []
  }
}

function writePhotos(list) {
  wx.setStorageSync(STORAGE_KEY, list)
}

function addPhoto(payload) {
  const role = payload.fromRole || 'mom'
  const row = {
    _id: payload._id || `photo-${Date.now()}`,
    type: 'photo',
    image: payload.image,
    text: payload.text || '',
    fromRole: role,
    createdAt: payload.createdAt || Date.now(),
    reactions: { received: 0, like: 0, miss: 0 }
  }
  const list = getPhotos()
  list.unshift(row)
  writePhotos(list)
  return row
}

module.exports = {
  STORAGE_KEY,
  getPhotos,
  addPhoto
}
