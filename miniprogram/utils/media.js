/**
 * 云存储 fileID → 可播放/可展示的临时 HTTPS URL
 *
 * 免费云开发往往无法改存储权限（卡在「仅创建者可读写」）。
 * 因此优先走云函数 getMediaUrls（管理员权限换链），客户端 getTempFileURL 仅作兜底。
 */

function isCloudFileId(src) {
  return typeof src === 'string' && src.indexOf('cloud://') === 0
}

function cloudReady() {
  try {
    const app = getApp()
    return !!(app && app.globalData.cloudReady && !app.globalData.demoMode)
  } catch (e) {
    return false
  }
}

async function resolveViaCloudFunction(fileIDs) {
  const ids = (fileIDs || []).filter(isCloudFileId)
  if (!ids.length) return {}
  const map = {}
  const chunkSize = 50
  for (let start = 0; start < ids.length; start += chunkSize) {
    const chunk = ids.slice(start, start + chunkSize)
    try {
      const res = await wx.cloud.callFunction({
        name: 'getMediaUrls',
        data: { fileList: chunk }
      })
      const rows = (res && res.result && res.result.fileList) || []
      rows.forEach((row) => {
        if (row.fileID && row.tempFileURL) map[row.fileID] = row.tempFileURL
        else if (row && row.status) {
          console.warn('getMediaUrls status', row.fileID, row.status, row.errMsg)
        }
      })
    } catch (e) {
      console.warn('getMediaUrls call failed', e)
    }
  }
  return map
}

async function resolveViaClient(fileIDs) {
  const ids = (fileIDs || []).filter(isCloudFileId)
  if (!ids.length) return {}
  const map = {}
  try {
    const res = await wx.cloud.getTempFileURL({ fileList: ids.slice(0, 50) })
    ;(res.fileList || []).forEach((row) => {
      if (row.fileID && row.tempFileURL) map[row.fileID] = row.tempFileURL
    })
  } catch (e) {
    console.warn('client getTempFileURL failed', e)
  }
  return map
}

async function buildUrlMap(fileIDs) {
  const ids = (fileIDs || []).filter(isCloudFileId)
  if (!ids.length) return {}
  if (cloudReady()) {
    const viaFn = await resolveViaCloudFunction(ids)
    const missing = ids.filter((id) => !viaFn[id])
    if (!missing.length) return viaFn
    const viaClient = await resolveViaClient(missing)
    return Object.assign({}, viaFn, viaClient)
  }
  return resolveViaClient(ids)
}

async function resolveCloudUrl(fileID) {
  if (!fileID || !isCloudFileId(fileID)) return fileID || ''
  const map = await buildUrlMap([fileID])
  return map[fileID] || ''
}

async function resolveCloudUrls(fileIDs) {
  const list = fileIDs || []
  const map = await buildUrlMap(list)
  return list.map((id) => {
    if (!isCloudFileId(id)) return id
    return map[id] || ''
  })
}

/** 时光轴条目：语音 + 照片 + 纸条图片 */
async function resolveTimelineItem(item) {
  if (!item) return item
  const next = { ...item }
  if (item.type === 'voice' && isCloudFileId(item.fileID) && !item.localSrc) {
    next.localSrc = await resolveCloudUrl(item.fileID)
  }
  if (item.type === 'photo' && isCloudFileId(item.image)) {
    next.imageFileID = item.image
    next.image = await resolveCloudUrl(item.image)
  }
  if (item.type === 'note' && Array.isArray(item.images) && item.images.some(isCloudFileId)) {
    next.images = await resolveCloudUrls(item.images)
  }
  return next
}

async function resolveTimelineMedia(list) {
  if (!Array.isArray(list) || !list.length) return list || []

  const ids = []
  list.forEach((item) => {
    if (!item) return
    if (item.type === 'photo' && isCloudFileId(item.image)) ids.push(item.image)
    if (item.type === 'voice' && isCloudFileId(item.fileID) && !item.localSrc) ids.push(item.fileID)
    if (item.type === 'note' && Array.isArray(item.images)) {
      item.images.forEach((img) => {
        if (isCloudFileId(img)) ids.push(img)
      })
    }
  })

  const map = await buildUrlMap(ids)

  return list.map((item) => {
    if (!item) return item
    if (item.type === 'photo' && isCloudFileId(item.image)) {
      return {
        ...item,
        imageFileID: item.image,
        image: map[item.image] || ''
      }
    }
    if (item.type === 'voice' && isCloudFileId(item.fileID) && !item.localSrc) {
      return {
        ...item,
        localSrc: map[item.fileID] || ''
      }
    }
    if (item.type === 'note' && Array.isArray(item.images)) {
      return {
        ...item,
        images: item.images.map((img) => (isCloudFileId(img) ? map[img] || '' : img))
      }
    }
    return item
  })
}

module.exports = {
  isCloudFileId,
  resolveCloudUrl,
  resolveCloudUrls,
  resolveTimelineItem,
  resolveTimelineMedia
}
