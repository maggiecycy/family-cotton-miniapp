/**
 * 首页状态：写真 + 按观看者（妈/爸）切换的文案与录音
 *
 * 数据不按爸妈拆两套库：同一 family 共享时光轴。
 * 只把「称呼 / 问候录音」按当前登录身份个性化。
 *
 * 录音：
 * - 给妈妈：greet-{key}.wav
 * - 给爸爸：greet-{key}-dad.wav（没有则回退妈妈版）
 */

const STATES = [
  {
    key: 'idle',
    label: '默认',
    src: '/assets/avatar/idle.jpg',
    audio: '/assets/audio/greet-idle.wav',
    audioDad: '/assets/audio/greet-idle-dad.wav',
    lineMom: '妈，我在呢。今天也要开心一点。',
    lineDad: '爸，我在呢。今天也要开心一点。'
  },
  {
    key: 'happy',
    label: '开心',
    src: '/assets/avatar/happy.jpg',
    audio: '/assets/audio/greet-happy.wav',
    audioDad: '/assets/audio/greet-happy-dad.wav',
    lineMom: '妈，想到你我就想笑。今天也要对你好好的。',
    lineDad: '爸，想到你我就想笑。今天也要好好照顾自己。'
  },
  {
    key: 'cheer',
    label: '开朗',
    src: '/assets/avatar/cheer.jpg',
    audio: '/assets/audio/greet-cheer.wav',
    audioDad: '/assets/audio/greet-cheer-dad.wav',
    lineMom: '妈，今天也要元气满满！有我陪着你。',
    lineDad: '爸，今天也要元气满满！有我陪着你。'
  },
  {
    key: 'miss',
    label: '想你',
    src: '/assets/avatar/miss.jpg',
    audio: '/assets/audio/greet-miss.wav',
    audioDad: '/assets/audio/greet-miss-dad.wav',
    lineMom: '妈，有点想你了。别担心，我过得很好，也很爱你。',
    lineDad: '爸，有点想你了。别担心，我过得很好，也很爱你。'
  },
  {
    key: 'soft',
    label: '温柔',
    src: '/assets/avatar/soft.jpg',
    audio: '/assets/audio/greet-soft.wav',
    audioDad: '/assets/audio/greet-soft-dad.wav',
    lineMom: '妈，慢慢来就好，累了就休息。我一直在。',
    lineDad: '爸，慢慢来就好，累了就休息。我一直在。'
  },
  {
    key: 'tender',
    label: '贴心',
    src: '/assets/avatar/tender.jpg',
    audio: '/assets/audio/greet-tender.wav',
    audioDad: '/assets/audio/greet-tender-dad.wav',
    lineMom: '妈，记得吃饭、喝温水。你开心，我就安心。',
    lineDad: '爸，记得按时吃饭。你安心，我就安心。'
  },
  {
    key: 'playful',
    label: '撒娇',
    src: '/assets/avatar/playful.jpg',
    audio: '/assets/audio/greet-playful.wav',
    audioDad: '/assets/audio/greet-playful-dad.wav',
    lineMom: '嘿嘿妈，被你发现啦。给我一个鼓励的笑好不好？',
    lineDad: '嘿嘿爸，被你发现啦。夸我一句好不好？'
  },
  {
    key: 'calm',
    label: '平静',
    src: '/assets/avatar/calm.jpg',
    audio: '/assets/audio/greet-calm.wav',
    audioDad: '/assets/audio/greet-calm-dad.wav',
    lineMom: '妈，今天也平平安安的。有我在，你不用逞强。',
    lineDad: '爸，今天也平平安安的。有我在，你不用硬撑。'
  },
  {
    key: 'speak',
    label: '说话',
    src: '/assets/avatar/speak.jpg',
    audio: '/assets/audio/greet-speak.wav',
    audioDad: '/assets/audio/greet-speak-dad.wav',
    lineMom: '妈，我想跟你说：你值得被好好照顾。',
    lineDad: '爸，我想跟你说：你辛苦了，也要好好照顾自己。'
  }
]

const DEFAULT_KEY = 'idle'

function viewerKind(role) {
  if (role === 'dad') return 'dad'
  return 'mom' // mom / daughter / guest 默认按给妈妈的文案演示
}

function getState(key) {
  return STATES.find((s) => s.key === key) || STATES[0]
}

function getLine(key, role) {
  const st = getState(key)
  return viewerKind(role) === 'dad' ? st.lineDad : st.lineMom
}

function getAudio(key, role) {
  const st = getState(key)
  return viewerKind(role) === 'dad' ? st.audioDad : st.audio
}

function nextStateKey(current) {
  const idx = STATES.findIndex((s) => s.key === current)
  return STATES[(idx + 1) % STATES.length].key
}

function allSrcs() {
  return STATES.map((s) => s.src)
}

function parentLabel(role) {
  if (role === 'dad') return '爸爸'
  if (role === 'mom') return '妈妈'
  return '家长'
}

module.exports = {
  STATES,
  DEFAULT_KEY,
  getState,
  getLine,
  getAudio,
  nextStateKey,
  allSrcs,
  viewerKind,
  parentLabel
}
