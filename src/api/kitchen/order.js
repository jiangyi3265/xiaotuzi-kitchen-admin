import request from '@/utils/request'

// 查询订单列表
export function listOrder(query) {
  return request({ url: '/system/kitchen/order/list', method: 'get', params: query })
}
// 查询订单详细
export function getOrder(id) {
  return request({ url: '/system/kitchen/order/' + id, method: 'get' })
}
// 修改订单
export function updateOrder(data) {
  return request({ url: '/system/kitchen/order', method: 'put', data: data })
}
// 修改订单状态
export function changeOrderStatus(data) {
  return request({ url: '/system/kitchen/order/changeStatus', method: 'put', data: data })
}
// 确认线下收款状态
export function changeOrderPayStatus(data) {
  return request({ url: '/system/kitchen/order/changePayStatus', method: 'put', data: data })
}
// 删除订单
export function delOrder(id) {
  return request({ url: '/system/kitchen/order/' + id, method: 'delete' })
}
