/**
 * 云存储 fileID → 可播放/可展示的临时 URL
 */

function isCloudFileId(src) {
  return typeof src === 'string' && src.indexOf('cloud://') === 0
}

async function resolveCloudUrl(fileID) {
  if (!fileID || !isCloudFileId(fileID)) return fileID || ''
  try {
    const res = await wx.cloud.getTempFileURL({ fileList: [fileID] })
    const row = res.fileList && res.fileList[0]
    if (row && row.tempFileURL) return row.tempFileURL
  } catch (e) {
    console.warn('resolveCloudUrl failed', fileID, e)
  }
  return fileID
}

async function resolveCloudUrls(fileIDs) {
  const ids = (fileIDs || []).filter(isCloudFileId)
  if (!ids.length) return fileIDs || []
  try {
    const res = await wx.cloud.getTempFileURL({ fileList: ids })
    const map = {}
    ;(res.fileList || []).forEach((row) => {
      if (row.fileID && row.tempFileURL) map[row.fileID] = row.tempFileURL
    })
    return (fileIDs || []).map((id) => map[id] || id)
  } catch (e) {
    console.warn('resolveCloudUrls failed', e)
    return fileIDs || []
  }
}

/** 时光轴条目：语音 + 纸条图片 */
async function resolveTimelineItem(item) {
  if (!item) return item
  const next = { ...item }
  if (item.type === 'voice' && isCloudFileId(item.fileID) && !item.localSrc) {
    next.localSrc = await resolveCloudUrl(item.fileID)
  }
  if (item.type === 'note' && Array.isArray(item.images) && item.images.some(isCloudFileId)) {
    next.images = await resolveCloudUrls(item.images)
  }
  return next
}

async function resolveTimelineMedia(list) {
  if (!Array.isArray(list) || !list.length) return list || []
  return Promise.all(list.map((item) => resolveTimelineItem(item)))
}

module.exports = {
  isCloudFileId,
  resolveCloudUrl,
  resolveCloudUrls,
  resolveTimelineItem,
  resolveTimelineMedia
}
