import request from '@/utils/request'

// 查询配送员列表
export function listRider(query) {
  return request({ url: '/system/kitchen/rider/list', method: 'get', params: query })
}
// 查询配送员详细
export function getRider(id) {
  return request({ url: '/system/kitchen/rider/' + id, method: 'get' })
}
// 新增配送员
export function addRider(data) {
  return request({ url: '/system/kitchen/rider', method: 'post', data: data })
}
// 修改配送员
export function updateRider(data) {
  return request({ url: '/system/kitchen/rider', method: 'put', data: data })
}
// 删除配送员
export function delRider(id) {
  return request({ url: '/system/kitchen/rider/' + id, method: 'delete' })
}
