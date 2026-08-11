const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

/**
 * 保存订阅授权结果到 users 集合
 * event: {
 *   results: { [templateId]: 'accept' | 'reject' | 'ban' },
 *   kinds: { voice?: tmplId, photo?: tmplId, festival?: tmplId }
 * }
 *
 * 注意：云端测试面板没有真实用户上下文时 OPENID 为空，会返回缺 openid，属正常。
 * 真机/模拟器内 callFunction 才会带上 OPENID。
 */
exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) {
    return {
      ok: false,
      error: 'missing-openid',
      hint: '请在小程序内调用，不要用云端测试的默认 Hello World 入参'
    }
  }

  const results = event.results || {}
  const kinds = event.kinds || {}
  const users = db.collection('users')

  const found = await users.where({ openid: OPENID }).limit(1).get()
  let user = found.data && found.data[0]

  if (!user) {
    const addRes = await users.add({
      data: {
        openid: OPENID,
        role: 'guest',
        familyId: '',
        createdAt: Date.now()
      }
    })
    user = { _id: addRes._id, openid: OPENID }
  }

  const subscribe = Object.assign({}, user.subscribe || {})
  ;['voice', 'photo', 'festival'].forEach((kind) => {
    const tmplId = kinds[kind]
    if (!tmplId) return
    const status = results[tmplId]
    if (!status) return
    subscribe[kind] = {
      templateId: tmplId,
      status,
      updatedAt: Date.now()
    }
  })

  await users.doc(user._id).update({
    data: {
      openid: OPENID,
      subscribe,
      subscribeUpdatedAt: Date.now()
    }
  })

  return { ok: true, openid: OPENID, subscribe }
}
