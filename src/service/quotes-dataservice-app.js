/*
 * @Description:
 * @Author: Lynn Qin
 * @Date: 2020-12-10 13:58:35
 * @LastEditTime: 2020-12-15 09:55:33
 */
import hzHttp from '@/utils/http/hzHttp'
const http = hzHttp.createPrefix('/quotes-dataservice-app')

/**
 * 行情聚合接口
 * 接口对接人：黄志云
 * 接口文档：http://szshowdoc.youxin.com/web/#/23?page_id=828
 */
export const getQuotesData = (params) => {
    return http.post('/api/v3/detail')({
        ...params,
        ids: params.ids.map(d => {
            return {
                market: d.slice(0, 2),
                symbol: d.slice(2)
            }
        })
    })
}

/**
 * 基础信息接口
 * 接口对接人：黄志云
 * 接口文档：http://szshowdoc.youxin.com/web/#/23?page_id=1902
 */
export const getQuotesInfo = http.post('/api/v2-3/info')

/**
 * 轮证中心聚合接口
 * 接口对接人：黄志云
 * 接口文档：http://szshowdoc.youxin.com/web/#/23?page_id=364
 */

export const getWarrantsData = http.post('/api/v2/warrants')

/**
 * 排行版聚合接口
 * 接口对接人：黄志云
 * 接口文档：http://szshowdoc.youxin.com/web/#/23?page_id=495
 */
export const getRank = http.post('/api/v2-2/rank')

/**
 * K线接口
 * 接口对接人：邹颖玖
 * 接口文档：http://szshowdoc.youxin.com/web/#/23?page_id=440
 */
export const getKlineData = http.get('/api/v2-2/kline')

/*
* 获取priceStep配置
* @market: hk
* */
export const getSpreadtable = http.get('/api/v2-1/spreadtable')

/**
 * 成交明细接口
 * 接口对接人：黄志云
 * 接口文档：http://szshowdoc.youxin.com/web/#/23?page_id=1190
 */
export const getTickData = http.get('/api/v2-3/tick')

/**
 * 资金分布接口
 * 接口对接人：苏晓达
 * 接口文档：http://szshowdoc.youxin.com/web/#/23?page_id=365
 */
export const getMoneyData = http.get('/api/v2/mincapflow')

/**
 * 资金流向接口
 * 接口对接人：苏晓达
 * 接口文档：http://szshowdoc.youxin.com/web/#/23?page_id=535
 */
export const getMoneyFlowData = http.get('/api/v2-2/capflow')
/**
 * 沪深港通资金额度接口
 * 接口对接人：黄志云
 * 接口文档：http://szshowdoc.youxin.com/web/#/23?page_id=438
 */
export const getMoneyAmount = http.get('/api/v2-2/scm')

/**
 * 轮证发行人列表接口
 * 接口对接人：黄志云
 * 接口文档：http://szshowdoc.youxin.com/web/#/23?page_id=1297
 */
export const getWarrantissuer = http.get('/api/v1/warrantissuer')
/**
 * 分時接口
 * 接口对接人：黄志云
 * 接口文档：http://szshowdoc.youxin.com/web/#/23?page_id=1191
 */
export const timeSharing = http.get('/api/v2-3/timesharing')
export const timeSharingV3 = http.get('/api/v3/timesharing')

/**
 * 分时接口
 * 接口对接人：黄志云
 * 接口文档：
 */
export const batchTimeSharing = http.post('/api/v3/batchtimesharing ')

/**
 * 关联行情接口
 * 接口对接人：黄志云
 * 接口文档：http://szshowdoc.youxin.com/web/#/23?page_id=539
 */
export const getRelatedToStock = http.post('/api/v2-2/extquote')

export const getListedStock = http.post('/api/v2-2/rank')
