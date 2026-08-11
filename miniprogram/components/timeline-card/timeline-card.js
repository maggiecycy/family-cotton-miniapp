function transferLabel(direction, fromRole) {
  if (direction === 'daughter_to_mom' || direction === 'daughter_to_parent') {
    if (fromRole === 'dad') return '给爸爸的心意'
    if (fromRole === 'mom') return '给妈妈的心意'
    return '给爸妈的心意'
  }
  if (fromRole === 'grandma') return '外婆的心意'
  if (fromRole === 'dad') return '爸爸的心意'
  if (fromRole === 'mom') return '妈妈的心意'
  if (direction === 'dad_to_daughter') return '爸爸的心意'
  if (direction === 'mom_to_daughter') return '妈妈的心意'
  return '爸妈的心意'
}

function directionText(direction, fromRole) {
  if (direction === 'daughter_to_mom' || direction === 'daughter_to_parent') {
    if (fromRole === 'dad') return '女儿 → 爸爸'
    if (fromRole === 'mom') return '女儿 → 妈妈'
    return '女儿 → 爸妈'
  }
  if (direction === 'dad_to_daughter' || fromRole === 'dad') return '爸爸 → 女儿'
  if (fromRole === 'grandma') return '外婆 → 女儿'
  if (direction === 'mom_to_daughter' || fromRole === 'mom') return '妈妈 → 女儿'
  if (direction === 'parent_to_daughter') return '家长 → 女儿'
  return ''
}

const INCOME_DIRECTIONS = ['mom_to_daughter', 'dad_to_daughter', 'parent_to_daughter']

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
      const { relativeDayLabel, formatDate } = require('../../utils/date')
      const day = relativeDayLabel(val.createdAt)
      const clock = formatDate(val.createdAt).slice(11)
      let typeLabel = '纪录'
      let directionClass = ''
      let dirText = ''
      if (val.type === 'transfer') {
        typeLabel = transferLabel(val.direction, val.fromRole)
        dirText = directionText(val.direction, val.fromRole)
        directionClass = INCOME_DIRECTIONS.includes(val.direction) ? 'tag--in' : 'tag--out'
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
    }
  }
})
