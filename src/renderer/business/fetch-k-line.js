import { getKlineData, timeSharing } from '@/service/quotes-dataservice-app'
import env from '@/utils/env'

// 个股详情，展示业务K线种类
export const BusinessKLineType = {
    BKLT_CURRENT_PRICE: 0, // 现价线
    BKLT_POSITION_COST: 1, // 持仓成本线
    BKLT_TRANSACTION_POINT: 2 // 成交买卖点
}

// 个股详情名
export const BusinessKLineName = {
    [BusinessKLineType['BKLT_CURRENT_PRICE']]: '现价线', // 现价线
    [BusinessKLineType['BKLT_POSITION_COST']]: '持仓成本线', // 持仓成本线
    [BusinessKLineType['BKLT_TRANSACTION_POINT']]: '成交买卖点' // 成交买卖点
}

// K线复权方向
export const KLineDirection = {
    KD_NONE: 0,
    KD_FORWARD: 1,
    KD_BACKWARD: 2
}

// K线复权方向名
export const KLineDirectionName = {
    [KLineDirection['KD_NONE']]: '不复权',
    [KLineDirection['KD_FORWARD']]: '前复权',
    [KLineDirection['KD_BACKWARD']]: '后复权'
}
// K线类型
export const KLineType = {
    TIME_SHARING: -1, // 分时数据
    TIME_SHARING_DAY5: -2, // 5日数据
    // KT_NONE: 0,
    KT_MIN1: 1, // 01分钟数据
    KT_MIN5: 2, // 05分钟数据
    KT_MIN10: 3, // 10分钟数据
    KT_MIN15: 4, // 15分钟数据
    KT_MIN30: 5, // 30分钟数据
    KT_MIN60: 6, // 60分钟数据
    KT_DAY: 7, // 日K线数据
    KT_WEEK: 8, // 周K线数据
    KT_MONTH: 9, // 月K线数据
    KT_MNT3: 10, // 季K线数据
    // KT_MNT6: 11, // 半年K线数据
    KT_MNT12: 12 // 年K线数据
}

// K线类型名
export const KLineTypeName = {
    [KLineType['TIME_SHARING']]: '分时', // 分时数据
    [KLineType['TIME_SHARING_DAY5']]: '5日', // 5日数据
    // KT_NONE: 0,
    [KLineType['KT_MIN1']]: '1分', // 01分钟数据
    [KLineType['KT_MIN5']]: '5分', // 05分钟数据
    [KLineType['KT_MIN10']]: '10分', // 10分钟数据
    [KLineType['KT_MIN15']]: '15分', // 15分钟数据
    [KLineType['KT_MIN30']]: '30分', // 30分钟数据
    [KLineType['KT_MIN60']]: '60分', // 60分钟数据
    [KLineType['KT_DAY']]: '日K', // 日K线数据
    [KLineType['KT_WEEK']]: '周K', // 周K线数据
    [KLineType['KT_MONTH']]: '月K', // 月K线数据
    [KLineType['KT_MNT3']]: '季K', // 季K线数据
    // KT_MNT6: 11, // 半年K线数据
    [KLineType['KT_MNT12']]: '年K' // 年K线数据
}
// 是折线图的k线类型集合
export const lineTypes = [KLineType.TIME_SHARING, KLineType.TIME_SHARING_DAY5]

export function isLineType(type) {
    return lineTypes.includes(type)
}

// K线类型Topic映射
const KLineTypeTopic = {
    [KLineType.KT_MIN1]: 'm1',
    [KLineType.KT_MIN5]: 'm5',
    [KLineType.KT_MIN10]: 'm10',
    [KLineType.KT_MIN30]: 'm30',
    [KLineType.KT_MIN60]: 'm60',
    [KLineType.KT_DAY]: 'd',
    [KLineType.KT_WEEK]: 'w',
    [KLineType.KT_MONTH]: 'mn1',
    [KLineType.KT_MNT3]: 'mn3',
    // [KLineType.KT_MNT6]: 'mn6',
    [KLineType.KT_MNT12]: 'y'
}

// 复权方向Topic映射
const directionTypeTopic = {
    [KLineDirection.KD_FORWARD]: 'fw',
    [KLineDirection.KD_NONE]: 'none',
    [KLineDirection.KD_BACKWARD]: 'bw'
}

// 获取对应市场的行情权限
const getQuoteLevel = market => {
    const fields = {
        'hk': 'hkQuoteLevel',
        'us': 'usQuoteLevel',
        'sh': 'hsQuoteLevel',
        'sz': 'hsQuoteLevel'
    }
    return fields.hk
}

export default class FetchKLine {
    /**
     * @param options
     * @param options.httpInterval http请求时的间隔，单位ms（毫秒），默认：5000
     */
    constructor(options = {}) {
        // 默认值
        this.callback = null
        // this.httpProps = options.httpProps || ['name', 'latestPrice', 'pctchng', 'priceBase']
        this.httpInterval = options.httpInterval || 5000

        this.id = null
        this.type = null
        this.direction = null
        this.data = []
        this.interval = null
        this.from = null
        this.count = null
        this.lastTopic = null
        this.level = 4
        return this
    }

    async start(id, callback, { type, direction, count = 300 }) {
        this.cancelSubscribe()
        if (!id) {
            return
        }
        this.id = id
        this.type = type
        this.direction = direction
        this.count = count
        this.callback = callback
        this.market = id.slice(0, 2)
        this.interval && clearInterval(this.interval)
        this.level = getQuoteLevel(this.market)
        this.renewHttp()
        // 实时
        if (this.level === 2 || this.level === 3) {
            this.renewSocket()
        } else if (this.level === 0) {
            // 延时
            this.loadIntervalData()
        }
        return this
    }

    getTopic(id) {
        const market = id.slice(0, 2)
        const symbol = id.slice(2)
        if (isLineType(this.type)) {
            return `q.ts.v2.${market}.${symbol}`
        } else {
            return `q.kl.v2.${market}.${symbol}.${KLineTypeTopic[this.type]}.${directionTypeTopic[this.direction]}`
        }
    }
    async renewHttp() {
        try {
            if (this.id) {
                let data
                if (isLineType(this.type)) {
                    // 分时线
                    data = await timeSharing({
                        id: this.id,
                        // 五日分时，一日分时
                        days: this.type === KLineType.TIME_SHARING_DAY5 ? 5 : 1,
                        level: this.level
                    })
                } else {
                    // K线
                    data = await getKlineData({
                        id: this.id,
                        type: this.type,
                        level: 4,
                        direction: this.direction,
                        // start: this.from,
                        count: this.count
                    })
                }
                if (data && data.list) {
                    this.callback(data)
                }
                this.data = data || {}
            }
        } catch (e) {
            console.log('==========>获取行情失败')
            console.log(e)
        }
    }
    // 取消订阅上一次的topic
    cancelSubscribe() {
        if (this.lastTopic && this.socket) {
            this.socket.cancelSubscribe(this.lastTopic)
        }
        this.interval && clearInterval(this.interval)
    }
    // 获取实时行情
    renewSocket() {
        if (!this.socket) {
            this.socket = {}
        }
        const topics = this.getTopic(this.id)
        this.lastTopic = topics
        this.socket.subscribe(
            topics,
            data => {
                let type = isLineType(this.type) ? 'ts' : 'kl'
                if (!data || !data.quote || !data.quote[0] || !data.quote[0][type]) {
                    return
                }
                let d = {
                    ...data.quote[0][type].data,
                    priceBase: data.quote[0][type].priceBase
                }
                if (this.data && this.data.list && this.data.list.length > 0) {
                    if (this.data.list[this.data.list.length - 1].latestTime < d.latestTime) {
                        this.data.list.push(d)
                    } else {
                        this.data.list[this.data.list.length - 1] = d
                    }
                    this.callback(this.data)
                }
            }
        )
    }
    // 获取延迟行情
    loadIntervalData() {
        this.interval = setTimeout(async() => {
            await this.renewHttp()
            this.loadIntervalData()
        }, this.httpInterval)
    }
    destroy() {
        this.socket && this.socket.destroy()
        this.interval && clearInterval(this.interval)
    }
}
