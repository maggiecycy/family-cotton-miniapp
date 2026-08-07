const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 8; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const inviteCode = (event.inviteCode || '').trim().toUpperCase()
  const action = event.action || (inviteCode ? 'join' : 'create')

  const users = db.collection('users')
  const families = db.collection('families')

  const userRes = await users.where({ openid }).limit(1).get()
  let user = userRes.data && userRes.data[0]
  if (!user) {
    const created = await users.add({
      data: {
        openid,
        role: 'guest',
        nickName: '',
        avatarUrl: '',
        familyId: '',
        createdAt: Date.now()
      }
    })
    user = { _id: created._id, openid, role: 'guest', familyId: '' }
  }

  if (action === 'create') {
    const code = randomCode()
    const fam = await families.add({
      data: {
        inviteCode: code,
        createdBy: openid,
        createdAt: Date.now()
      }
    })
    await users.doc(user._id).update({
      data: {
        role: 'daughter',
        familyId: fam._id
      }
    })
    return { ok: true, familyId: fam._id, inviteCode: code, role: 'daughter' }
  }

  const famRes = await families.where({ inviteCode }).limit(1).get()
  const family = famRes.data && famRes.data[0]
  if (!family) {
    return { ok: false, message: '邀请码无效' }
  }

  await users.doc(user._id).update({
    data: {
      role: 'mom',
      familyId: family._id
    }
  })

  return { ok: true, familyId: family._id, inviteCode, role: 'mom' }
}
