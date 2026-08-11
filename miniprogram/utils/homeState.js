/**
 * 首页状态：写真 + 按观看者（妈/爸）切换的文案与录音
 *
 * 6 态：idle / happy / miss / soft / tender / calm
 * 录音：greet-{key}.m4a（爸爸版 greet-{key}-dad.m4a，无则回退）
 */

const STATES = [
  {
    key: 'idle',
    label: '默认',
    src: '/assets/avatar/idle.jpg',
    audio: '/assets/audio/greet-idle.m4a',
    audioDad: '/assets/audio/greet-idle-dad.m4a',
    lineMom: '妈，我在呢。今天也要开心一点哦。',
    lineDad: '爸，我在呢。今天也要开心一点哦。'
  },
  {
    key: 'happy',
    label: '开心',
    src: '/assets/avatar/happy.jpg',
    audio: '/assets/audio/greet-happy.m4a',
    audioDad: '/assets/audio/greet-happy-dad.m4a',
    lineMom: '妈，想到你我就想笑。今天也要对自己好一点。',
    lineDad: '爸，想到你我就想笑。今天也要好好照顾自己。'
  },
  {
    key: 'miss',
    label: '想你',
    src: '/assets/avatar/miss.jpg',
    audio: '/assets/audio/greet-miss.m4a',
    audioDad: '/assets/audio/greet-miss-dad.m4a',
    lineMom: '妈，我在呢。今天也要开心一点。',
    lineDad: '爸，我在呢。今天也要开心一点。'
  },
  {
    key: 'soft',
    label: '温柔',
    src: '/assets/avatar/soft.jpg',
    audio: '/assets/audio/greet-soft.m4a',
    audioDad: '/assets/audio/greet-soft-dad.m4a',
    lineMom: '妈，慢慢来就好。累了就休息，我一直在。',
    lineDad: '爸，慢慢来就好。累了就休息，我一直在。'
  },
  {
    key: 'tender',
    label: '贴心',
    src: '/assets/avatar/tender.jpg',
    audio: '/assets/audio/greet-tender.m4a',
    audioDad: '/assets/audio/greet-tender-dad.m4a',
    lineMom: '妈，记得吃饭、喝温水。你开心，我就安心。',
    lineDad: '爸，记得按时吃饭。你安心，我就安心。'
  },
  {
    key: 'calm',
    label: '平静',
    src: '/assets/avatar/calm.jpg',
    audio: '/assets/audio/greet-calm.m4a',
    audioDad: '/assets/audio/greet-calm-dad.m4a',
    lineMom: '妈，今天也平平安安的。有我在，你不用逞强。',
    lineDad: '爸，今天也平平安安的。有我在，你不用硬撑。'
  }
]

const DEFAULT_KEY = 'idle'

function viewerKind(role) {
  if (role === 'dad') return 'dad'
  return 'mom'
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
