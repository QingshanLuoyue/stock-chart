// 渲染显示模块
// import { market2Exchange } from '@/renderer/biz-components/stock-trade/map.js'
const EXCHANGE_TYPE = {
    HK: 0,
    US: 5,
    SH: 6,
    SZ: 7
}
const market2Exchange = {
    'hk': EXCHANGE_TYPE.HK,
    'us': EXCHANGE_TYPE.US,
    'sh': EXCHANGE_TYPE.SH,
    'sz': EXCHANGE_TYPE.SZ
}
import { BusinessKLineType, KLineType } from '@/renderer/business/fetch-k-line.js'
import { formatStockPrice } from '@/renderer/business/format.js'
import { getEvents } from '@/service/quotes-userservice.js'
import { stockHoldingSingle } from '@/service/stock-order-server.js'
export function renderBusiness({ data, width, height, base, maxKLineY, minKlineY }, otherOption) {
    // type: k 线类型
    const { isLine, stock, stockDetail, type, businessKlines } = otherOption
    const stockMarket = stock.slice(0, 2)
    const stockCode = stock.slice(2)

    const renderOption = {
        width,
        height,
        baseY: base,
        direction: 'x',
        data,
        strokeWidth: 1,
        maxY: maxKLineY,
        minY: minKlineY
    }
    const map = {
        // 现价线
        [BusinessKLineType.BKLT_CURRENT_PRICE]: () => {
            const currentPrice = stockDetail && stockDetail.latestPrice
            const priceBase = stockDetail && stockDetail.priceBase
            const formatPrice = formatStockPrice(currentPrice, { base: priceBase })
            // ! 待提取
            this.renderModule('StraightLine', `usmart-chart-Line_BKLT_${BusinessKLineType.BKLT_CURRENT_PRICE}`, {
                ...renderOption,
                yPos: formatPrice,
                stroke: '#FF9E0E'
            })
        },
        // 持仓成本
        [BusinessKLineType.BKLT_POSITION_COST]: async() => {
            try {
                const holdingData = await stockHoldingSingle({
                    exchangeType: market2Exchange[stockMarket],
                    stockCode: stockCode
                })
                if (holdingData) {
                    // ! 待提取
                    this.renderModule('StraightLine', `usmart-chart-Line_BKLT_${BusinessKLineType.BKLT_POSITION_COST}`, {
                        ...renderOption,
                        yPos: holdingData.costPriceAccurate || 0,
                        stroke: '#0BC0F1'
                    })
                }
            } catch (e) {
                console.log('stockHoldingSingle:error:>> ', e)
            }
        },
        // 交易买卖点
        [BusinessKLineType.BKLT_TRANSACTION_POINT]: async() => {
            // 只有日k才展示买卖点
            if (![KLineType.KT_DAY].includes(type)) return

            const market = stockMarket
            const symbol = stockCode
            const buyAndSoldData = await getEvents({
                market,
                symbol,
                type: isLine ? 'timeline1Day' : 'kline1Day', // kline1Day（默认）: 日K，timeline1Day: 一日分时
                beginDate: data[0].latestTime,
                endDate: data[data.length - 1].latestTime
            })
            // let d = new Date('2020-07-27 00:00:00:000')
            // let cd = []
            // let dc = (new Date('2021-03-10') - new Date('2020-09-14')) / 1000 / 60 / 60 / 24
            // for (let i = 0; i < dc / 10; i++) {
            //     d.setDate(d.getDate() + 8)

            //     cd.push({// 某一日的订单列表
            //         'latestTime': '' + d.getFullYear() + addZero(d.getMonth() + 1) + addZero(d.getDate()) + '000000000', // 交易日期，与日K日期对应 20200728000000000
            //         'bought': [ // 买订单
            //             {
            //                 'price': 6, // 金额
            //                 'volume': 2000, // 量
            //                 'orderType': 0 // 订单类型，0: 普通，1: 日内融，2: 期权
            //             },
            //             {
            //                 'price': 50.15,
            //                 'volume': 1500,
            //                 'orderType': 0 // 订单类型，0: 普通，1: 日内融，2: 期权
            //             }
            //         ],
            //         'sold': [ // 卖订单
            //             {
            //                 'price': 5, // 金额
            //                 'volume': 2000, // 量
            //                 'orderType': 0 // 订单类型，0: 普通，1: 日内融，2: 期权
            //             }
            //         ]
            //     })
            // }
            // 20200728-20210120
            // console.log('buyAndSoldData :>> ', buyAndSoldData)
            if (buyAndSoldData && buyAndSoldData.list) {
                // 0：交易订单，1：发布财报，2：分红派息
                const fData = []
                buyAndSoldData.list.forEach(perDayEvent => {
                    let obj = null
                    // 每天发生的事件列表
                    perDayEvent.list.forEach(trade => {
                        if (trade.type === 0) {
                            // 只关注 交易订单 类型事件
                            obj = {
                                ...trade.content
                            }
                        }
                    })
                    if (obj) {
                        obj.latestTime = perDayEvent.latestTime
                        fData.push(obj)
                    }
                })
                // console.log('fData :>> ', fData)
                if (fData.length) {
                    // ! 待提取
                    this.renderModule('BuySoldPoint', `usmart-chart-Line_BKLT_${BusinessKLineType.BKLT_TRANSACTION_POINT}`, {
                        width: renderOption.width,
                        height: renderOption.height,
                        baseY: renderOption.baseY,
                        klineData: renderOption.data,
                        data: fData
                    })
                }
            }
        }
    }
    // 先删除，后渲染新的
    Object.values(BusinessKLineType).forEach(businessType => {
        // ! 待提取
        this.removeModule(`usmart-chart-Line_BKLT_${businessType}`)
    })
    businessKlines && businessKlines.forEach(businessType => {
        map[businessType]()
    })
}
