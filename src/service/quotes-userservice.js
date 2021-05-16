/*
 * @Description:
 * @Author: jolin
 * @Date: 2021-01-20
 * @LastEditTime: 2021-01-20
 */
import hzHttp from '@/utils/http/hzHttp'
const http = hzHttp.createPrefix('/quotes-userservice')

/**
 * 行情打点聚合接口: 获取分时、k线上的打点信息
 * 接口对接人：黄志云
 * 接口文档：http://szshowdoc.youxin.com/web/#/23?page_id=2078
 */
export const getEvents = http.get('/api/v1/events')
