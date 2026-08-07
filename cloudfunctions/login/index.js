const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const users = db.collection('users')
  const found = await users.where({ openid }).limit(1).get()

  if (found.data && found.data[0]) {
    return found.data[0]
  }

  const doc = {
    openid,
    role: 'guest',
    nickName: '',
    avatarUrl: '',
    familyId: '',
    createdAt: Date.now()
  }
  const addRes = await users.add({ data: doc })
  return { _id: addRes._id, ...doc }
}
