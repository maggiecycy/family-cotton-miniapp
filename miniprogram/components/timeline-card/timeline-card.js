const { relativeDayLabel, formatDate } = require('../../utils/date')

function transferLabel(direction, fromRole) {
  if (direction === 'daughter_to_mom' || direction === 'daughter_to_parent') {
    if (fromRole === 'dad') return '给爸爸的心意'
    if (fromRole === 'mom') return '给妈妈的心意'
    return '给家长的心意'
  }
  if (fromRole === 'dad') return '爸爸的心意'
  if (fromRole === 'mom') return '妈妈的心意'
  return '家长的心意'
}

function directionText(direction, fromRole) {
  if (direction === 'daughter_to_mom' || direction === 'daughter_to_parent') {
    if (fromRole === 'dad') return '女儿 → 爸爸'
    if (fromRole === 'mom') return '女儿 → 妈妈'
    return '女儿 → 家长'
  }
  if (direction === 'mom_to_daughter' || direction === 'parent_to_daughter') {
    if (fromRole === 'dad') return '爸爸 → 女儿'
    if (fromRole === 'mom') return '妈妈 → 女儿'
    return '家长 → 女儿'
  }
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
        typeLabel = transferLabel(val.direction, val.fromRole)
        dirText = directionText(val.direction, val.fromRole)
        directionClass =
          val.direction === 'daughter_to_mom' || val.direction === 'daughter_to_parent'
            ? 'tag--out'
            : 'tag--in'
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
