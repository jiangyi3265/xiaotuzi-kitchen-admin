import request from '@/utils/request'
export const listGroupRooms=params=>request({url:'/system/kitchen/social/group/list',method:'get',params})
export const listCoupleSpaces=params=>request({url:'/system/kitchen/social/couple/list',method:'get',params})
export const updateGroupStatus=data=>request({url:'/system/kitchen/social/group/status',method:'put',data})
export const updateCoupleStatus=data=>request({url:'/system/kitchen/social/couple/status',method:'put',data})
