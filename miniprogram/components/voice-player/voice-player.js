const { resolveCloudUrl, isCloudFileId } = require('../../utils/media')

Component({
  properties: {
    src: {
      type: String,
      value: ''
    },
    durationMs: {
      type: Number,
      value: 0
    },
    autoStopOthers: {
      type: Boolean,
      value: true
    }
  },

  data: {
    playing: false,
    durationText: '0″',
    bars: [40, 70, 55, 85, 45, 75, 60, 90, 50, 68, 42, 80]
  },

  lifetimes: {
    attached() {
      this._audio = wx.createInnerAudioContext()
      this._audio.obeyMuteSwitch = false
      this.bindAudioEvents()
      this.updateDurationText(this.properties.durationMs)
      this.applySrc(this.properties.src)
    },
    detached() {
      this.destroyAudio()
    }
  },

  observers: {
    src(val) {
      this.applySrc(val)
    },
    durationMs(val) {
      this.updateDurationText(val)
    }
  },

  methods: {
    async applySrc(val) {
      if (!this._audio) return
      this._audio.stop()
      let src = val || ''
      if (isCloudFileId(src)) {
        src = await resolveCloudUrl(src)
      }
      this._resolvedSrc = src
      this._audio.src = src
      this.setData({ playing: false })
    },

    bindAudioEvents() {
      this._audio.onPlay(() => {
        this.setData({ playing: true })
        this.triggerEvent('play')
      })
      this._audio.onPause(() => {
        this.setData({ playing: false })
        this.triggerEvent('pause')
      })
      this._audio.onStop(() => {
        this.setData({ playing: false })
        this.triggerEvent('stop')
      })
      this._audio.onEnded(() => {
        this.setData({ playing: false })
        this.triggerEvent('ended')
      })
      this._audio.onError((err) => {
        console.warn('voice play error', err)
        this.setData({ playing: false })
        wx.showToast({ title: '语音播放失败', icon: 'none' })
        this.triggerEvent('error', err)
      })
    },

    updateDurationText(ms) {
      const sec = Math.max(1, Math.round((ms || 0) / 1000))
      this.setData({ durationText: `${sec}″` })
    },

    toggle() {
      const src = this._resolvedSrc || this.properties.src
      if (!src) {
        wx.showToast({ title: '暂无语音', icon: 'none' })
        return
      }
      if (this.data.playing) {
        this._audio.pause()
      } else {
        this.triggerEvent('beforeplay')
        this._audio.play()
      }
    },

    stop() {
      if (this._audio) this._audio.stop()
    },

    destroyAudio() {
      if (!this._audio) return
      this._audio.stop()
      this._audio.destroy()
      this._audio = null
    }
  }
})
