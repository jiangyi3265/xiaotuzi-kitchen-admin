import request from '@/utils/request'

// 查询分享动态列表
export function listSharePost(query) {
  return request({ url: '/system/kitchen/sharePost/list', method: 'get', params: query })
}
// 查询分享动态详细
export function getSharePost(id) {
  return request({ url: '/system/kitchen/sharePost/' + id, method: 'get' })
}
// 修改分享动态
export function updateSharePost(data) {
  return request({ url: '/system/kitchen/sharePost', method: 'put', data: data })
}
// 审核分享动态
export function auditSharePost(data) {
  return request({ url: '/system/kitchen/sharePost/audit', method: 'put', data: data })
}
// 删除分享动态
export function delSharePost(id) {
  return request({ url: '/system/kitchen/sharePost/' + id, method: 'delete' })
}
