import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/v0/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/v0/user/logout',
    method: 'post'
  })
}
