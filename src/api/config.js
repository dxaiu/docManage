import request from '@/utils/request'
import { getToken } from '@/utils/auth'
// 查询列表
export function getConfigList(query) {
  return request({
    url: '/v0/item/list',
    method: 'get',
    params: query
  })
}

export function getConfigInfo(code) {
  return request({
    url: `/v0/item/info/${code}`,
    method: 'get'
  })
}

// 新增
export function addConfig(data) {
  return request({
    url: '/v0/item',
    method: 'post',
    data: data
  })
}

// 修改
export function updateConfig(code, data) {
  return request({
    url: `/v0/item/${code}`,
    method: 'put',
    data: data
  })
}

// 删除
export function delConfig(code) {
  return request({
    url: `/v0/item/${code}`,
    method: 'delete'
  })
}

// 上传
export function uploadImages(data) {
  return request({
    url: '/v0/res' + '?authorization=Bearer ' + getToken(),
    method: 'post',
    data
  })
}

export function getImagesInfo(id) {
  return request({
    url: '/v0/res/' + id + '?authorization=Bearer ' + getToken(),
    method: 'get'
  })
}
