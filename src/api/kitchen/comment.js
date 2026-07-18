import request from '@/utils/request'

// 查询评论列表
export function listComment(query) {
  return request({ url: '/system/kitchen/comment/list', method: 'get', params: query })
}
// 查询评论详细
export function getComment(id) {
  return request({ url: '/system/kitchen/comment/' + id, method: 'get' })
}
// 修改评论
export function updateComment(data) {
  return request({ url: '/system/kitchen/comment', method: 'put', data: data })
}
// 审核评论
export function auditComment(data) {
  return request({ url: '/system/kitchen/comment/audit', method: 'put', data: data })
}
// 删除评论
export function delComment(id) {
  return request({ url: '/system/kitchen/comment/' + id, method: 'delete' })
}
