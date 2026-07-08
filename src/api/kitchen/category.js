import request from '@/utils/request'

// 查询菜品分类列表
export function listCategory(query) {
  return request({
    url: '/system/kitchen/category/list',
    method: 'get',
    params: query
  })
}

// 查询分类树
export function treeCategory(query) {
  return request({
    url: '/system/kitchen/category/tree',
    method: 'get',
    params: query
  })
}

// 查询菜品分类详细
export function getCategory(id) {
  return request({
    url: '/system/kitchen/category/' + id,
    method: 'get'
  })
}

// 新增菜品分类
export function addCategory(data) {
  return request({
    url: '/system/kitchen/category',
    method: 'post',
    data: data
  })
}

// 修改菜品分类
export function updateCategory(data) {
  return request({
    url: '/system/kitchen/category',
    method: 'put',
    data: data
  })
}

// 删除菜品分类
export function delCategory(id) {
  return request({
    url: '/system/kitchen/category/' + id,
    method: 'delete'
  })
}
