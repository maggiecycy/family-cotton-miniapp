const EXPRESSIONS = ['idle', 'happy', 'miss', 'serious', 'sleepy', 'speak']

const SRC_MAP = {
  idle: '/assets/avatar/idle.png',
  happy: '/assets/avatar/happy.png',
  miss: '/assets/avatar/miss.png',
  serious: '/assets/avatar/serious.png',
  sleepy: '/assets/avatar/sleepy.png',
  speak: '/assets/avatar/speak.png'
}

Component({
  properties: {
    expression: {
      type: String,
      value: 'idle'
    },
    speaking: {
      type: Boolean,
      value: false
    },
    showHint: {
      type: Boolean,
      value: true
    }
  },

  data: {
    currentSrc: SRC_MAP.idle,
    fadeClass: 'fade-in',
    innerExpr: 'idle'
  },

  observers: {
    'expression, speaking'(expression, speaking) {
      const next = speaking ? 'speak' : expression || 'idle'
      this.switchTo(next)
    }
  },

  lifetimes: {
    attached() {
      const next = this.properties.speaking ? 'speak' : this.properties.expression || 'idle'
      this.setData({
        innerExpr: next,
        currentSrc: SRC_MAP[next] || SRC_MAP.idle
      })
    }
  },

  methods: {
    switchTo(name) {
      const target = SRC_MAP[name] ? name : 'idle'
      if (target === this.data.innerExpr) return
      this.setData({ fadeClass: 'fade-out' })
      clearTimeout(this._timer)
      this._timer = setTimeout(() => {
        this.setData({
          innerExpr: target,
          currentSrc: SRC_MAP[target],
          fadeClass: 'fade-in'
        })
      }, 160)
    },

    onTap() {
      if (this.properties.speaking) return
      const cycle = EXPRESSIONS.filter((e) => e !== 'speak')
      const idx = cycle.indexOf(this.data.innerExpr)
      const next = cycle[(idx + 1) % cycle.length]
      this.triggerEvent('change', { expression: next })
      this.switchTo(next)
    },

    onLongPress() {
      this.triggerEvent('longpress')
    }
  }
})
