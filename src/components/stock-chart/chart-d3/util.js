import { KLineType } from '@/renderer/business/fetch-k-line.js'
import { formatStockPrice, formatText2Time } from '@/renderer/business/format.js'
import { FALL_COLOR, RISE_COLOR } from '@/utils/tools.js'
import { FLAT_COLOR } from './chart/index.js'
/**
 * 初始化分时和其他k线时，图表纵向划分为几块，且设置块区域高度
 * @param {Boolean} isTimeSharing  是否是分时
 * @param {Number} contentHeight 图表中，除去坐标系的高度
 * @returns
 */
export const verticalBlockHeights = function(isTimeSharing = true, contentHeight = 0) {
    return isTimeSharing ? [0.8 * contentHeight, 0.2 * contentHeight] : [contentHeight]
}

/**
 * 分割区域，用于添加技术指标时用
 * @param {Number} height
 * @param {Number} verticalBlockHeights 图表中已经划分的区域高度数组。如 [300, 100] 表示整个图表纵向被划分成2分，第一份高度300，第二份高度100
 * @param {Number} technicalIndicators 需要展示的指标数量
 * @returns
 */
export const divideVerticalArea = function(height, verticalBlockHeights, technicalIndicators = 1) {
    let length = verticalBlockHeights.length
    if (length >= 5) {
        return
    }
    // 划分图表纵向区域
    // 比如现在是日k且3个指标
    // 设置整体高度为 1
    // 蜡烛图区域： 1 - 0.2(指标在高度中所占比例) * 3(3为指标个数) = 0.4
    // 指标1: 0.2
    // 指标2: 0.2
    // 指标3: 0.2
    return new Array(length + technicalIndicators).fill('').map((d, i) => {
        let base
        if (i === 0) {
            base = 1 - (length + technicalIndicators - 1) * 0.2
        } else {
            base = 0.2
        }
        return base * height
    })
}
/**
 * 根据下标获取模块的start、end高度
 * @param {Array} verticalBlockHeights 纵向区域块高度数组
 * @param {Number} moduleIdx 模块所在的序号
 * @param {Number} startY 模块开始的纵向数值
 * @returns 返回模块在纵向区域上的 起始和终点值
 */
export const getModuleArea = function(verticalBlockHeights, moduleIdx = 0, startY) {
    let start = 0
    let end = 0
    verticalBlockHeights.forEach((d, i) => {
        if (moduleIdx > i) {
            start += verticalBlockHeights[i]
            end += verticalBlockHeights[i]
        } else if (moduleIdx === i) {
            end += verticalBlockHeights[i]
        }
    })
    if (moduleIdx === 0) {
        start = startY
    }
    return {
        start,
        end
    }
}

/**
 * 生成模块唯一标识
 * @param {String} chartId 图表的名称
 * @param {String} key 模块的名称
 * @returns String
 */
export function generateKey(chartId, key) {
    return `${chartId}-${key}`
}

/**
 * 是否list字段更新
 * @param {Array} templist list 暂存数据
 * @param {Array} currentlist 当前 list 数据
 * @param {Array} keys 需要判断 list 中元素对象的 属性值是否发生变化
 * @returns Boolean
 */
export function isUpdate(templist, currentlist, keys) {
    if (!currentlist || !currentlist.length || templist.length !== currentlist.length) {
        return true
    }
    // 只要有一个不相等，就说明更新了
    return keys.some((key) => {
        return templist[templist.length - 1][key] !== currentlist[currentlist.length - 1][key]
    })
}

/**
 * 处理接口返回的数据，筛选需要的属性返回
 * @param {Array} data 接口请求到的图表数据
 * @param {Object} options 包含判断属性
 * @returns 处理后的图表数据数组
 */
export function filterServerData(data, options) {
    // type 表示 k 线类型
    let { list = [], priceBase = 2 } = data
    let timeType = ''
    const base = Math.pow(10, priceBase)
    const { isLine, type } = options
    if (!isLine) {
        if ([KLineType.KT_MIN1, KLineType.KT_MIN5, KLineType.KT_MIN10, KLineType.KT_MIN15, KLineType.KT_MIN30, KLineType.KT_MIN60].includes(type)) {
            timeType = ''
        } else {
            timeType = 'date'
        }
    }
    const format = time => {
        return formatText2Time(time, timeType)
    }
    list = list.map(item => {
        // console.log('yy', priceBase, item)
        return Object.assign({}, item, {
            time: format(item.latestTime),
            open: item.open / base,
            high: item.high / base,
            low: item.low / base,
            close: item.close / base,
            volume: item.volume,
            preClose: item.preClose / base,
            price: (isLine ? item.price : item.close) / base,
            avg: item.avg / base,
            netchng: item.netchng / base,
            amount: item.amount / base
        })
    })
    return list
}

const riseColor = RISE_COLOR()
const fallColor = FALL_COLOR()
/**
 * 与昨收价格对比，返回对应的涨跌颜色
 * @param {Number} val 图表元素历史价格
 * @param {Number} preClose 股票昨收价格
 * @returns 返回上涨红色，下跌绿色，相等 平色
 */
function statusColor(val, preClose) {
    if (val < preClose) {
        return fallColor
    }
    if (val > preClose) {
        return riseColor
    }
    return FLAT_COLOR
}
/**
 * Y 轴数据格式化
 * @param {Number} maxKLineY k 线 Y 轴最大数值
 * @param {Number} minKlineY k 线 Y轴最小数值
 * @param {Number} n
 * @param {Number} preClose 昨收价格
 * @returns
 */
export function scaleYdata(maxKLineY, minKlineY, n = 10, preClose, isLine) {
    let arr = []
    const diff = (maxKLineY - minKlineY) * 0.1 // 上下留空间距
    const unit = (maxKLineY - minKlineY + 2 * diff) / (n - 1) // 每一个表格行的高度
    const startY = minKlineY - diff // Y 轴起始点
    for (let i = 0; i < n; i++) {
        const value = startY + i * unit // 当前Y轴表格行的绘制起点
        arr.push({
            percent: ((value - preClose) / preClose * 100).toFixed(2) + '%',
            value,
            color: isLine ? statusColor(value, preClose) : null,
            text: formatStockPrice(value)
        })
    }
    return arr
}
