/*
 * @Description:
 * @Author: Lynn Qin
 * @Date: 2020-12-29 09:35:09
 * @LastEditTime: 2021-01-12 15:46:10
 */
import jyHttp from '@/utils/http/jyHttp'
const http = jyHttp.createPrefix('/stock-order-server')

// 接口文档：http://admin-dev.yxzq.com/stock-order-server/doc/doc.html

/**
 * 获取最大可用数量
 * http://jy-dev.yxzq.com/stock-order-server/doc/doc.html#/%E8%82%A1%E7%A5%A8%E8%AE%A2%E5%8D%95%E4%B8%AD%E5%BF%83-%E9%9D%A2%E5%90%91%E5%A7%94%E6%89%98/%E4%BA%A4%E6%98%93%E6%9F%A5%E8%AF%A2%E7%9B%B8%E5%85%B3api/getTradeQuantityUsingPOST_2
 * @param data
 * @returns {*}
 */
export const getTradeQuantity = http.post('/api/trade-quantity/v2')
/**
 * 委托下单
 * http://jy-dev.yxzq.com/stock-order-server/doc/doc.html#/%E8%82%A1%E7%A5%A8%E8%AE%A2%E5%8D%95%E4%B8%AD%E5%BF%83-%E9%9D%A2%E5%90%91%E5%A7%94%E6%89%98/%E4%BA%A4%E6%98%93%E4%B8%8B%E5%8D%95%E7%9B%B8%E5%85%B3api/entrustOrderUsingPOST_2
 * @returns {*}
 */
export const entrustOrder = http.post('/api/entrust-order/v1')

// 查询用户持仓
export const stockHoldingV1 = http.post(`/api/stock-holding/v1`)

/**
 * 条件单下单（智能订单下单）
 * http://jy-dev.yxzq.com/stock-order-server/doc/doc.html#/%E8%82%A1%E7%A5%A8%E8%AE%A2%E5%8D%95%E4%B8%AD%E5%BF%83-%E9%9D%A2%E5%90%91%E6%9D%A1%E4%BB%B6%E5%8D%95/%E6%9D%A1%E4%BB%B6%E5%8D%95api/conditionOrderUsingPOST
 * @param data
 * @returns {*}
 */
export const addCondition = http.post('/api/add-condition/v1')

// 查询用户资产
export const stockAssetV1 = http.post(`/api/stockasset/v1`)

// 今日订单
export const getTodayEntrust = http.post('/api/today-entrust/v1')

// 全部订单
export const getAllEntrustList = http.post('/api/his-entrust/v1')

// 智能订单
export const getConditionOrder = http.post('/api/condition-order/v2')

// 订单详情
export const getEntrustRecordDetail = http.post('/api/entrust-recorddetail/v2')
/**
 * 获取IPO日历信息
 * http://jy-dev.yxzq.com/stock-order-server/doc/doc.html#/%E8%82%A1%E7%A5%A8%E8%AE%A2%E5%8D%95%E4%B8%AD%E5%BF%83-%E9%9D%A2%E5%90%91ipo/IPO%20app%E7%AB%AF%E7%9B%B8%E5%85%B3api/ipoCalendarDataUsingPOST
 * @param data
 * @returns {*}
 */
export const getIpoCalendarData = http.post('/api/ipo-calendar-data/v1')

// 查询交易状态
export const tradeStatus = http.post('/api/trade-status/v1')

// 获取ipo已递表列表
export const ipoDeliveredList = http.post('/api/ipo-delivered-list/v1')
// 日内融-下单建仓
export const intradayCreateOrder = http.post('/api/intradayCreateOrder/v1')

// 日内融-交易页面初始化，计算最大可买
export const intradayTransInit = http.post('/api/intradayTransInit/v1')

// 日内融资产
export const intradayHoldListV1 = http.post('/api/intradayHoldList/v1')

// 日内融持仓
export const intradayHoldListGroupByStockV1 = http.post('/api/intradayHoldListGroupByStock/v1')

// 日内融今日订单
export const intradayToDayOrderV1 = http.post('/api/intradayToDayOrder/v1')

// 日内融全部订单
export const intradayOrderDetailListV1 = http.post('/api/intradayOrderDetailList/v1')

// 日内融快速平仓
export const intradayCloseOrderV1 = http.post('/api/intradayCloseOrder/v1')

// 日内融修改止盈止损
export const intradayModifyRateV1 = http.post('/api/intradayModifyRate/v1')

// 日内融订单详情
export const intradayOrderDetailInfoV1 = http.post('/api/intradayOrderDetailInfo/v1')

// 日内融获取交易倒计时
export const intradayEndTransTimeV1 = http.post('/api/intradayEndTransTime/v1')

// 普通订单撤单
export const cancelOrderV1 = http.post('/api/cancel-order/v1')

// 条件单撤单
export const delCondition = http.post('/api/del-condition/v1')

// 日内融撤单
export const intradayCancelOrderV1 = http.post('/api/intradayCancelOrder/v1')

// 日内融账户市场开通情况
export const allMarketPurchasePowerV1 = http.post('/api/all-market-purchase-power/v1')

// 客户股票持仓查询
export const stockHoldingSingle = http.post('/api/stock-holding-single/v1')

// 碎股卖出
export const oddEntrust = http.post('/api/odd-entrust/v1')
// 碎股撤单
export const oddModifyV1 = http.post('/api/odd-modify/v1')
// 保证金账户打通购买力
export const crossMarketMarginDetail = http.post(`/api/cross-market-margin-detail/v1`)
// 保证金账户未打通购买力
export const marginDetail = http.post(`/api/margin-detail/v1`)

// 正股改单 (不包含碎股) 增强限价单、竞价单、市价单、竞价限价单
export const modifyOrder = http.post(`/api/modify-order/v1`)
// 条件单改单
export const updateCondition = http.post(`/api/update-condition/v1`)
// 获取融资股数
export const tradeMarginQuantity = http.post(`/api/trade-margin-quantity/v1`)
