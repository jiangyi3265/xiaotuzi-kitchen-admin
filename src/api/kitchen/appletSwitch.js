import request from '@/utils/request'

// 查询固定的小程序功能总开关
export function getAppletSwitch() {
  return request({
    url: '/system/applet/switch',
    method: 'get'
  })
}

// 修改固定的小程序功能总开关；后端不接收配置 ID 或配置键
export function updateAppletSwitch(enabled) {
  return request({
    url: '/system/applet/switch',
    method: 'put',
    data: { enabled }
  })
}
