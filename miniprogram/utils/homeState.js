/**
 * 首页状态：写真 + 按观看者（妈/爸）切换的文案与录音
 *
 * 录音（优先 m4a/AAC）：greet-{key}.m4a
 * 仅录妈妈版；爸爸观看时文案改「爸」，录音仍播妈妈版。
 */

const IDLE_VIDEO = '/assets/avatar/idle-loop.mp4'

const STATES = [
  {
    key: 'idle',
    label: '默认',
    src: '/assets/avatar/idle.jpg',
    audio: '/assets/audio/greet-idle.m4a',
    lineMom: '妈，我在呢。今天也要开心一点。',
    lineDad: '爸，我在呢。今天也要开心一点。'
  },
  {
    key: 'happy',
    label: '开心',
    src: '/assets/avatar/happy.jpg',
    audio: '/assets/audio/greet-happy.m4a',
    lineMom: '妈，想到你我就想笑。今天也要对你好好的。',
    lineDad: '爸，想到你我就想笑。今天也要好好照顾自己。'
  },
  {
    key: 'miss',
    label: '想你',
    src: '/assets/avatar/miss.jpg',
    audio: '/assets/audio/greet-miss.m4a',
    lineMom: '妈，有点想你了。别担心，我过得很好，也很爱你。',
    lineDad: '爸，有点想你了。别担心，我过得很好，也很爱你。'
  },
  {
    key: 'soft',
    label: '温柔',
    src: '/assets/avatar/soft.jpg',
    audio: '/assets/audio/greet-soft.m4a',
    lineMom: '妈，慢慢来就好，累了就休息。我一直在。',
    lineDad: '爸，慢慢来就好，累了就休息。我一直在。'
  },
  {
    key: 'tender',
    label: '贴心',
    src: '/assets/avatar/tender.jpg',
    audio: '/assets/audio/greet-tender.m4a',
    lineMom: '妈，记得吃饭、喝温水。你开心，我就安心。',
    lineDad: '爸，记得按时吃饭。你安心，我就安心。'
  },
  {
    key: 'speak',
    label: '说话',
    src: '/assets/avatar/speak.jpg',
    audio: '/assets/audio/greet-speak.m4a',
    lineMom: '妈，我想跟你说：你值得被好好照顾。',
    lineDad: '爸，我想跟你说：你辛苦了，也要好好照顾自己。'
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

/** 问候录音统一妈妈版（仅录一套） */
function getAudio(key) {
  return getState(key).audio
}

function nextStateKey(current) {
  const idx = STATES.findIndex((s) => s.key === current)
  const next = STATES[(idx + 1) % STATES.length]
  return next.key
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
  IDLE_VIDEO,
  getState,
  getLine,
  getAudio,
  nextStateKey,
  allSrcs,
  viewerKind,
  parentLabel
}
