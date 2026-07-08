import request from '@/utils/request'

// 查询厨师列表
export function listChef(query) {
  return request({ url: '/system/kitchen/chef/list', method: 'get', params: query })
}
// 查询厨师详细
export function getChef(id) {
  return request({ url: '/system/kitchen/chef/' + id, method: 'get' })
}
// 新增厨师
export function addChef(data) {
  return request({ url: '/system/kitchen/chef', method: 'post', data: data })
}
// 修改厨师
export function updateChef(data) {
  return request({ url: '/system/kitchen/chef', method: 'put', data: data })
}
// 删除厨师
export function delChef(id) {
  return request({ url: '/system/kitchen/chef/' + id, method: 'delete' })
}
