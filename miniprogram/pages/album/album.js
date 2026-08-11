const { fetchPhotos } = require('../../utils/cloud')
const { relativeDayLabel } = require('../../utils/date')
const { saveImageToAlbum } = require('../../utils/permission')
const { canPublishPhoto } = require('../../utils/auth')

function roleShort(role) {
  if (role === 'dad') return '爸爸'
  if (role === 'grandma') return '外婆'
  if (role === 'mom') return '妈妈'
  return '家长'
}

Page({
  data: {
    list: [],
    canUpload: false
  },

  onShow() {
    this.setData({ canUpload: canPublishPhoto() })
    this.load()
  },

  async load() {
    wx.showNavigationBarLoading()
    try {
      const list = await fetchPhotos()
      this.setData({
        list: (list || []).map((item) => ({
          ...item,
          roleLabel: roleShort(item.fromRole),
          dayLabel: relativeDayLabel(item.createdAt)
        }))
      })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      wx.hideNavigationBarLoading()
    }
  },

  onPreview(e) {
    const src = e.currentTarget.dataset.src
    const urls = this.data.list.map((p) => p.image)
    wx.previewImage({ current: src, urls: urls.length ? urls : [src] })
  },

  async onSave(e) {
    const src = e.currentTarget.dataset.src
    await saveImageToAlbum(src)
  },

  goUpload() {
    wx.navigateTo({ url: '/pages/publish-photo/publish-photo' })
  }
})
