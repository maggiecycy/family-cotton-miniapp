const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

/**
 * 云函数以管理员权限换临时 HTTPS 链接。
 * 免费环境无法把云存储改成「所有用户可读」时，用这个绕过「仅创建者可读写」。
 *
 * event: { fileList: string[] }  // cloud:// fileID 列表，建议 ≤50
 */
exports.main = async (event = {}) => {
  const raw = event.fileList || event.fileIDs || []
  const fileList = Array.isArray(raw) ? raw.filter((id) => typeof id === 'string' && id.indexOf('cloud://') === 0) : []

  if (!fileList.length) {
    return { ok: true, fileList: [] }
  }

  try {
    const res = await cloud.getTempFileURL({
      fileList: fileList.slice(0, 50)
    })
    return {
      ok: true,
      fileList: (res.fileList || []).map((row) => ({
        fileID: row.fileID,
        tempFileURL: row.tempFileURL || '',
        status: row.status,
        errMsg: row.errMsg
      }))
    }
  } catch (e) {
    console.warn('getMediaUrls failed', e)
    return {
      ok: false,
      error: (e && (e.message || e.errMsg)) || String(e),
      fileList: []
    }
  }
}
