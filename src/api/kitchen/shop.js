import request from '@/utils/request'

// 查询店铺设置
export function getShop() {
  return request({ url: '/system/kitchen/shop', method: 'get' })
}
// 保存店铺设置
export function saveShop(data) {
  return request({ url: '/system/kitchen/shop', method: 'post', data: data })
}
