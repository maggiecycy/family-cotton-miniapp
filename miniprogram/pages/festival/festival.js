const { getHoliday } = require('../../utils/holiday')
const { fetchDailyLine } = require('../../utils/cloud')

Page({
  data: {
    isHoliday: false,
    todayName: '',
    todayLine: '',
    dailyLine: '',
    upcoming: []
  },

  async onShow() {
    const holiday = getHoliday(new Date())
    let dailyLine = ''
    try {
      dailyLine = await fetchDailyLine()
    } catch (e) {
      dailyLine = ''
    }

    const upcoming = []
    const base = new Date()
    for (let i = 0; i < 60; i += 1) {
      const d = new Date(base.getTime() + i * 24 * 60 * 60 * 1000)
      const h = getHoliday(d)
      if (h) {
        upcoming.push({
          key: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
          dateLabel: `${d.getMonth() + 1}月${d.getDate()}日`,
          name: h.name,
          line: h.line
        })
      }
      if (upcoming.length >= 6) break
    }

    this.setData({
      isHoliday: !!holiday,
      todayName: holiday ? holiday.name : '今天',
      todayLine: holiday ? holiday.line : '今天没有特殊节日，也要好好照顾自己。',
      dailyLine,
      upcoming
    })
  }
})
