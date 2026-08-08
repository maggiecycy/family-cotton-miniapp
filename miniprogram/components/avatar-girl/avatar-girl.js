const { getState, DEFAULT_KEY, allSrcs } = require('../../utils/homeState')

Component({
  properties: {
    expression: {
      type: String,
      value: DEFAULT_KEY
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
    srcA: getState(DEFAULT_KEY).src,
    srcB: getState(DEFAULT_KEY).src,
    opacityA: 1,
    opacityB: 0,
    activeLayer: 'a',
    innerExpr: DEFAULT_KEY,
    switching: false
  },

  observers: {
    expression(expression) {
      const next = expression || DEFAULT_KEY
      this.switchTo(next, { silent: true })
    }
  },

  lifetimes: {
    attached() {
      const key = this.properties.speaking ? 'speak' : this.properties.expression || DEFAULT_KEY
      const st = getState(key)
      this.setData({
        innerExpr: key,
        srcA: st.src,
        srcB: st.src,
        opacityA: 1,
        opacityB: 0,
        activeLayer: 'a'
      })
      allSrcs().forEach((src) => wx.getImageInfo({ src, fail() {} }))
    }
  },

  methods: {
    switchTo(name, opts = {}) {
      const target = getState(name).key
      if (target === this.data.innerExpr || this.data.switching) return
      const nextSrc = getState(target).src
      const fromA = this.data.activeLayer === 'a'

      if (fromA) {
        this.setData({
          switching: true,
          srcB: nextSrc,
          opacityB: 0,
          activeLayer: 'b'
        })
      } else {
        this.setData({
          switching: true,
          srcA: nextSrc,
          opacityA: 0,
          activeLayer: 'a'
        })
      }

      clearTimeout(this._fadeTimer)
      clearTimeout(this._doneTimer)
      this._fadeTimer = setTimeout(() => {
        if (fromA) this.setData({ opacityA: 0, opacityB: 1 })
        else this.setData({ opacityA: 1, opacityB: 0 })
      }, 40)

      this._doneTimer = setTimeout(() => {
        this.setData({ innerExpr: target, switching: false })
        if (!opts.silent) {
          this.triggerEvent('change', { expression: target, state: getState(target) })
        }
      }, 780)
    },

    /** 点图片 = 播放当前状态真实问候 */
    onTap() {
      if (this.data.switching) return
      this.triggerEvent('play', {
        expression: this.data.innerExpr,
        state: getState(this.properties.expression || this.data.innerExpr)
      })
    },

    onLongPress() {
      this.triggerEvent('play', {
        expression: this.properties.expression || this.data.innerExpr,
        state: getState(this.properties.expression || this.data.innerExpr)
      })
    }
  }
})
