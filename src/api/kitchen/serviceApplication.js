import request from '@/utils/request'

export function listServiceApplication(query) {
  return request({ url: '/system/kitchen/serviceApplication/list', method: 'get', params: query })
}

export function auditServiceApplication(data) {
  return request({ url: '/system/kitchen/serviceApplication/audit', method: 'put', data })
}
