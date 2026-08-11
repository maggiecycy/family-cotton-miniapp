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

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const inviteCode = (event.inviteCode || '').trim().toUpperCase()
  const action = event.action || (inviteCode ? 'join' : 'create')
  const role = event.role === 'dad' ? 'dad' : 'mom'

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

  if (!inviteCode) {
    return { ok: false, message: '请填写邀请码' }
  }

  // 演示码仅用于本地演示；云端需真实家庭邀请码
  if (inviteCode === 'COTTON888') {
    return {
      ok: false,
      message: 'COTTON888 仅演示用。请关闭演示前，先让女儿点「生成真实邀请码」'
    }
  }

  const famRes = await families.where({ inviteCode }).limit(1).get()
  const family = famRes.data && famRes.data[0]
  if (!family) {
    return { ok: false, message: '邀请码无效，请向女儿索取最新邀请码' }
  }

  await users.doc(user._id).update({
    data: {
      role,
      familyId: family._id
    }
  })

  return { ok: true, familyId: family._id, inviteCode, role }
}
