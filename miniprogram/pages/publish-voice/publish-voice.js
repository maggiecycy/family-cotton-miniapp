const { createTimelineItem, isDemo } = require('../../utils/cloud')
const { canPublish } = require('../../utils/auth')

const MAX_MS = 60 * 1000

Page({
  data: {
    fontClass: 'font-larger',
    recording: false,
    statusText: '准备好了就按住说话',
    durationText: '0″',
    tempFilePath: '',
    durationMs: 0,
    uploading: false
  },

  onLoad() {
    this._recorder = wx.getRecorderManager()
    this._recorder.onStart(() => {
      this._startedAt = Date.now()
      this.setData({ recording: true, statusText: '正在听你说…', tempFilePath: '' })
      this._tick = setInterval(() => {
        const ms = Date.now() - this._startedAt
        this.setData({ durationText: `${Math.floor(ms / 1000)}″` })
        if (ms >= MAX_MS) this.onStop()
      }, 200)
    })
    this._recorder.onStop((res) => {
      clearInterval(this._tick)
      const durationMs = res.duration || Date.now() - (this._startedAt || Date.now())
      this.setData({
        recording: false,
        statusText: '可以预听，确认后再上传',
        tempFilePath: res.tempFilePath,
        durationMs,
        durationText: `${Math.max(1, Math.round(durationMs / 1000))}″`
      })
    })
    this._recorder.onError((err) => {
      clearInterval(this._tick)
      console.warn(err)
      this.setData({ recording: false, statusText: '录音失败，请重试' })
      wx.showToast({ title: '录音失败', icon: 'none' })
    })
  },

  onShow() {
    if (!canPublish()) {
      wx.showToast({ title: '仅女儿可发语音', icon: 'none' })
      setTimeout(() => wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/mine/mine' }) }), 500)
      return
    }
    const app = getApp()
    this.setData({
      fontClass: app.globalData.fontScale === 'larger' ? 'font-larger' : ''
    })
  },

  onUnload() {
    clearInterval(this._tick)
    if (this._preview) {
      this._preview.stop()
      this._preview.destroy()
    }
  },

  onStart() {
    this._recorder.start({
      duration: MAX_MS,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3'
    })
  },

  onStop() {
    if (!this.data.recording) return
    this._recorder.stop()
  },

  onPreview() {
    if (!this.data.tempFilePath) return
    if (!this._preview) {
      this._preview = wx.createInnerAudioContext()
    }
    this._preview.src = this.data.tempFilePath
    this._preview.play()
  },

  async onUpload() {
    if (!this.data.tempFilePath) return
    this.setData({ uploading: true })
    try {
      let fileID = this.data.tempFilePath
      if (!isDemo()) {
        const cloudPath = `voices/${getApp().globalData.familyId || 'unknown'}/${Date.now()}.mp3`
        const up = await wx.cloud.uploadFile({
          cloudPath,
          filePath: this.data.tempFilePath
        })
        fileID = up.fileID
      }
      await createTimelineItem({
        type: 'voice',
        fileID,
        localSrc: isDemo() ? fileID : '',
        durationMs: this.data.durationMs,
        message: '一条新的语音留言'
      })
      wx.showToast({ title: isDemo() ? '演示模式已记录' : '上传成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 500)
    } catch (e) {
      console.warn(e)
      wx.showToast({ title: '上传失败，可重试', icon: 'none' })
    } finally {
      this.setData({ uploading: false })
    }
  }
})
