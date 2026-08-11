/**
 * 权限引导：拒绝后可打开系统设置
 *
 * 若控制台出现 errno 112 / privacy agreement：
 * 先到公众平台配置「用户隐私保护指引」勾选麦克风，设置页才会出现开关。
 */

function openAppSetting() {
  return new Promise((resolve) => {
    wx.openSetting({
      success: (res) => resolve(res && res.authSetting),
      fail: () => resolve(null)
    })
  })
}

function confirmOpenSetting(scopeLabel) {
  return new Promise((resolve) => {
    wx.showModal({
      title: '需要开启权限',
      content: `请在设置中开启「${scopeLabel}」，才能继续使用。`,
      confirmText: '去开启',
      cancelText: '取消',
      success: async (res) => {
        if (!res.confirm) {
          resolve(false)
          return
        }
        await openAppSetting()
        resolve(true)
      },
      fail: () => resolve(false)
    })
  })
}

function showPrivacyGuide() {
  return new Promise((resolve) => {
    wx.showModal({
      title: '需要先完成隐私配置',
      content:
        '麦克风未写入「用户隐私保护指引」。开发者请到公众平台：设置 → 用户隐私保护指引 → 勾选麦克风并发布。配置后重新编译再试。',
      showCancel: false,
      confirmText: '知道了',
      complete: () => resolve(false)
    })
  })
}

function requirePrivacyAuthorize() {
  if (typeof wx.requirePrivacyAuthorize !== 'function') {
    return Promise.resolve(true)
  }
  return new Promise((resolve) => {
    wx.requirePrivacyAuthorize({
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
}

/**
 * 检查并申请 scope；拒绝时引导 openSetting
 * @param {string} scope 如 scope.record / scope.writePhotosAlbum
 * @param {string} label 展示名
 */
async function ensureScope(scope, label) {
  const privacyOk = await requirePrivacyAuthorize()
  if (!privacyOk) {
    await showPrivacyGuide()
    return false
  }

  return new Promise((resolve) => {
    wx.getSetting({
      success: (setting) => {
        const auth = (setting && setting.authSetting) || {}
        if (auth[scope] === true) {
          resolve(true)
          return
        }
        if (auth[scope] === false) {
          confirmOpenSetting(label).then(resolve)
          return
        }
        wx.authorize({
          scope,
          success: () => resolve(true),
          fail: (err) => {
            const msg = (err && err.errMsg) || ''
            if (/privacy agreement|errno:\s*112/i.test(msg) || (err && err.errno === 112)) {
              showPrivacyGuide().then(resolve)
              return
            }
            confirmOpenSetting(label).then(resolve)
          }
        })
      },
      fail: () => resolve(false)
    })
  })
}

function ensureRecord() {
  return ensureScope('scope.record', '麦克风')
}

function ensureWritePhotosAlbum() {
  return ensureScope('scope.writePhotosAlbum', '添加到相册')
}

/**
 * 保存图片到系统相册（支持本地路径 / 网络 / 云 fileID）
 */
async function saveImageToAlbum(src) {
  if (!src) {
    wx.showToast({ title: '没有可保存的图片', icon: 'none' })
    return false
  }
  const ok = await ensureWritePhotosAlbum()
  if (!ok) return false

  try {
    let filePath = src
    if (/^cloud:\/\//.test(src)) {
      const res = await wx.cloud.getTempFileURL({ fileList: [src] })
      const url = res.fileList && res.fileList[0] && res.fileList[0].tempFileURL
      if (!url) throw new Error('cloud url empty')
      const dl = await new Promise((resolve, reject) => {
        wx.downloadFile({
          url,
          success: (r) => (r.statusCode === 200 ? resolve(r.tempFilePath) : reject(r)),
          fail: reject
        })
      })
      filePath = dl
    } else if (/^https?:\/\//.test(src)) {
      const dl = await new Promise((resolve, reject) => {
        wx.downloadFile({
          url: src,
          success: (r) => (r.statusCode === 200 ? resolve(r.tempFilePath) : reject(r)),
          fail: reject
        })
      })
      filePath = dl
    }

    await new Promise((resolve, reject) => {
      wx.saveImageToPhotosAlbum({
        filePath,
        success: resolve,
        fail: reject
      })
    })
    wx.showToast({ title: '已保存到相册', icon: 'success' })
    return true
  } catch (e) {
    console.warn('saveImageToAlbum failed', e)
    const msg = (e && (e.errMsg || e.message)) || ''
    if (/auth deny|authorize|permission/i.test(msg)) {
      await confirmOpenSetting('添加到相册')
    } else {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
    return false
  }
}

module.exports = {
  openAppSetting,
  confirmOpenSetting,
  ensureScope,
  ensureRecord,
  ensureWritePhotosAlbum,
  saveImageToAlbum
}
