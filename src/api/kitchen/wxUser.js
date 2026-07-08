import request from '@/utils/request'

// 查询小程序用户列表
export function listWxUser(query) {
  return request({ url: '/system/kitchen/wxUser/list', method: 'get', params: query })
}
// 查询小程序用户详细
export function getWxUser(id) {
  return request({ url: '/system/kitchen/wxUser/' + id, method: 'get' })
}
// 修改小程序用户
export function updateWxUser(data) {
  return request({ url: '/system/kitchen/wxUser', method: 'put', data: data })
}
// 删除小程序用户
export function delWxUser(id) {
  return request({ url: '/system/kitchen/wxUser/' + id, method: 'delete' })
}
