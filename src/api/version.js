import request from '@/utils/request'
import { getToken } from '@/utils/auth'
// 查询列表
export function getVersionList(query) {
  return request({
    url: '/v0/firmware/list',
    method: 'get',
    params: query
  })
}

// 新增
export function addVersion(data) {
  return request({
    url: '/v0/firmware',
    method: 'post',
    data: data
  })
}

// 发布固件
export function releaseFirmware(firmwareID) {
  return request({
    url: `/v0/firmware/release/${firmwareID}`,
    method: 'put'
  })
}

// 撤销固件
export function revokeFirmware(firmwareID) {
  return request({
    url: `/v0/firmware/revoke_release/${firmwareID}`,
    method: 'put'
  })
}

// 修改固件信息
export function updateInfo(firmwareID, data) {
  return request({
    url: `/v0/firmware/info/${firmwareID}`,
    method: 'put',
    data: data
  })
}

// 删除
export function delFirmware(firmwareID) {
  return request({
    url: `/v0/firmware/${firmwareID}`,
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
