const { relativeDayLabel, formatDate } = require('../../utils/date')

function transferLabel(direction) {
  if (direction === 'daughter_to_mom') return '给妈妈的心意'
  return '妈妈的心意'
}

function directionText(direction) {
  if (direction === 'daughter_to_mom') return '女儿 → 妈妈'
  if (direction === 'mom_to_daughter') return '妈妈 → 女儿'
  return ''
}

Component({
  properties: {
    item: {
      type: Object,
      value: {}
    }
  },

  data: {
    typeLabel: '',
    timeLabel: '',
    myReaction: '',
    directionText: '',
    directionClass: ''
  },

  observers: {
    item(val) {
      if (!val) return
      const day = relativeDayLabel(val.createdAt)
      const clock = formatDate(val.createdAt).slice(11)
      let typeLabel = '纪录'
      let directionClass = ''
      let dirText = ''
      if (val.type === 'transfer') {
        typeLabel = transferLabel(val.direction)
        dirText = directionText(val.direction)
        directionClass = val.direction === 'daughter_to_mom' ? 'tag--out' : 'tag--in'
      } else if (val.type === 'voice') {
        typeLabel = '语音留言'
      } else if (val.type === 'note') {
        typeLabel = '小纸条'
      }
      this.setData({
        typeLabel,
        timeLabel: `${day} ${clock}`,
        directionText: dirText,
        directionClass
      })
    }
  },

  methods: {
    onReact(e) {
      const key = e.currentTarget.dataset.key
      this.setData({ myReaction: key })
      this.triggerEvent('react', { id: this.properties.item._id, key })
    },

    onVoicePlay() {
      this.triggerEvent('voiceplay', { id: this.properties.item._id })
    },

    onVoicePause() {
      this.triggerEvent('voicepause', { id: this.properties.item._id })
    },

    onVoiceEnded() {
      this.triggerEvent('voiceended', { id: this.properties.item._id })
    },

    onPreviewImage(e) {
      const src = e.currentTarget.dataset.src
      const images = (this.properties.item && this.properties.item.images) || []
      wx.previewImage({
        current: src,
        urls: images.length ? images : [src]
      })
    }
  }
})
