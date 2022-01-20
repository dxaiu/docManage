import request from '@/utils/request'

export function getUserList(params) {
  return request({
    url: '/v0/user',
    method: 'get',
    params
  })
}

export function addUser(data) {
  return request({
    url: '/v0/user',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/v0/user/modify_password',
    method: 'put',
    data
  })
}

export function delUser(username) {
  return request({
    url: `/v0/user/${username}`,
    method: 'delete'
  })
}
