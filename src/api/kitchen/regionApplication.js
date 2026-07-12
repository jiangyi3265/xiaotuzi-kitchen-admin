import request from '@/utils/request'
export function listRegionApplication(query) { return request({ url:'/system/kitchen/regionApplication/list', method:'get', params:query }) }
export function auditRegionApplication(data) { return request({ url:'/system/kitchen/regionApplication/audit', method:'put', data }) }
export function setRegionEnabled(data) { return request({ url:'/system/kitchen/regionApplication/enabled', method:'put', data }) }
