import request from '@/utils/request'

export function listFeedback(query) {
  return request({ url: '/system/kitchen/feedback/list', method: 'get', params: query })
}

export function handleFeedback(data) {
  return request({ url: '/system/kitchen/feedback/handle', method: 'put', data })
}
