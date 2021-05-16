<template lang="pug">
    .chart(:id="chartId" ref="kline")
        detailBox(
            :stockPrice="stockPrice"
            :position="position"
            :mainIndicatorTextHeight="mainIndicatorTextHeight"
            :scaleWidth="scaleWidth"
            :scaleRight="scaleRight"
            :chartId="chartId"
            :width="width"
            :isLine="isLine"
        )
</template>
<script>
import {IndicatorFormula} from 'yl-indicator'
import Chart from './chart'
import {RISE_COLOR, FALL_COLOR} from '@/utils/tools'
import FetchKLine, { KLineType, KLineDirection, lineTypes } from '@/renderer/business/fetch-k-line'
import { formatText2Time, formatBigNumber } from '@/renderer/business/format'
import {
    YL_KLINE_COLORS,
    MACD_COLORS
} from '@/utils/color.js'
import { getKlineData } from '@/service/quotes-dataservice-app.js'
import ARBR from './chart/technicalIndicator/ARBR'
import MACD from './chart/technicalIndicator/MACD'
import DMA from './chart/technicalIndicator/DMA'
import EMV from './chart/technicalIndicator/EMV'
import KDJ from './chart/technicalIndicator/KDJ'
import RSI from './chart/technicalIndicator/RSI'
import MAVOL from './chart/technicalIndicator/MAVOL'
import WR from './chart/technicalIndicator/WR'
import CR from './chart/technicalIndicator/CR'
import detailBox from '../detail/index'

import * as d3 from 'd3'
import { throttle } from 'lodash'
import { debounce } from '@/utils/utils'
import { verticalBlockHeights, getModuleArea, divideVerticalArea, generateKey, filterServerData, scaleYdata } from './util.js'
import { renderGrid } from './chart/chart-part/grid.js'
import { renderTechnicalIndicators, removeTechnicalIndicators, removeSubIndicatorText } from './chart/chart-part/technical-indicators.js'
import { renderBusiness } from './chart/chart-part/bussiness.js'

// k线一屏渲染的条数
const XCOUNT = 120
// 分时交易时间
// 港股交易时间 9:30-12:00 13:00-16:00 共计5.5小时
// 美股交易时间 21: 30-04: 00 （或22: 30-05: 00） 共计6.5小时
// A股交易时间 9:30-11:30 13:00-15:00 共计4小时
// A股创业板/科创板为15:30 共计4.5小时
const DEALING_MINS = {
    hk: 332,
    us: 391,
    a: 242,
    a_cyb_kcb: 272
}
// 分时中线时间
const DEALING_MINS_TIMES = {
    hk: {
        middle: '12:00/13:00',
        end: '16:00'
    },
    us: {
        middle: '12:45',
        end: '16:00'
    },
    sh: {
        middle: '11:30/13:00',
        end: '15:00'
    },
    sz: {
        middle: '11:30/13:00',
        end: '15:00'
    },
    gray_market: {
        middle: '16:15',
        end: '18:30'
    },
    cyb_kcb: {
        middle: '11:30/13:00',
        end: '15:30'
    }
}
export default {
    components: {
        detailBox
    },
    props: {
        mainIndicator: {
            type: String,
            default: ''
        },
        stock: {
            type: String,
            required: true
        },
        type: {
            type: Number,
            default: KLineType.KT_DAY
        },
        direction: {
            type: Number,
            default: KLineDirection.KD_NONE
        },
        // 需要展示的业务k线: 现价线，持仓成本，买卖点
        businessKlines: {
            type: Array,
            default: () => []
        },
        // 正常来说不传，取父盒子的宽度，如果想固定宽度可传
        width: {
            type: Number,
            default: 692
        },
        height: {
            type: Number,
            default: 340
        },
        chartId: {
            type: String,
            default: 'usmart-chart'
        },
        // 隐藏十字线
        hideCross: {
            type: Boolean,
            default: false
        },
        // 隐藏坐标
        hideScale: {
            type: Boolean,
            default: false
        },
        // 技术指标
        technicalIndicators: {
            type: Array,
            default: () => []
        },
        technicalIndicatorList: {
            type: Array,
            default: () => []
        },
        // 行情数据
        stockDetail: {
            type: Object,
            default: null
        },
        // 不同技术指标的参数设置
        calcParamsMapper: {
            type: Object,
            default: () => {}
        },
        // 不同技术指标的指标线是否绘制
        drawLinesMapper: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        return {
            timer: 0,
            // eslint-disable-next-line vue/no-reserved-keys
            _fetchKLine: null,
            list: [],
            // 用于和当前的list进行对比
            tmpList: [],
            // type: KLineType.KT_DAY,
            // direction: KLineDirection.KD_FORWARD,
            from: null,
            chart: null,
            // modules: {},
            // technicalIndicators: ['MACD', 'DMA'],
            wrapperWidth: 0,
            wrapperHeight: 0,
            // 一页K线展示的数量，不足的话缩小宽度以保证柱状宽度一致
            xCount: XCOUNT,
            // 股价对象
            stockPrice: null,
            // 选中的点位坐标
            position: null,
            scaleWidth: 54,
            scaleRight: 0,
            // 选中的数据下标
            selectedIndex: 0,
            // 指标配置
            indicatorConfig: {
                fontSize: 12,
                padInner: 5
            },
            // 渲染节流
            renderChart: throttle(this.doRenderChart, 100),
            moveCandlestick: throttle(this.doMoveCandlestick, 100),
            // _mutationObserver: null
            mainIndicatorTextHeight: 0,
            // K线 的最大最小坐标
            maxKLineY: 0,
            minKlineY: 0,

            moveLastIdx: 0,
            moveStartIdx: 0,
            requestMoveTime: 2000,
            isRequestMoreData: false,
            isNoMoreData: false,
            isResetChartData: true // 是否需要重置图表数据, 切换股票、 type（分时、日k、分钟、复权等）将重置图表数据
        }
    },
    computed: {
        subIndicatorList() {
            return Object.keys(this.subIndicatorObj)
        },
        subIndicatorObj() {
            return {
                RSI,
                KDJ,
                DMA,
                ARBR,
                WR,
                CR,
                EMV
            }
        },
        // 是否是折线，这里特指分时线
        isLine() {
            return lineTypes.includes(this.type)
        },
        // 是否展示技术指标
        showTechnicalIndicators() {
            return !this.isLine && this.technicalIndicators.length
        },
        showMainIndicator() {
            return !this.isLine && !!this.mainIndicator
        },
        market() {
            if (!this.stock) {
                return ''
            }
            return this.stock.substring(0, 2)
        },
        // 分时k线分钟数
        dealingMins() {
            return DEALING_MINS[this.market] || (this.isCYBOrKCB ? DEALING_MINS.a_cyb_kcb : DEALING_MINS.a)
        },
        // 分时k
        isTimeSharing() {
            return this.type === KLineType.TIME_SHARING
        },
        // 5日分时k
        isTimeSharing5() {
            return this.type === KLineType.TIME_SHARING_DAY5
        },
        // 创业板或者科创板
        isCYBOrKCB() {
            // 上市板块
            // enum ListedSector
            // {
            //     LS_NONE = 0;
            //     LS_MAIN = 1; // 主板，港股主板(MAIN)
            //     LS_SMEB = 2; // 中小企业板 Small and Medium Enterprise Board
            //     LS_GEMB = 3; // 创业板 Growth Enterprises Market Board，港股创业板(GEM)
            //     LS_STB  = 4; // 新三板 National Equities Exchange and Quotations
            //     LS_STAR = 12; // 科创板
            //     //港股
            //     LS_NASD = 21; //港股(NASD) OMD-C 10号消息
            //     LS_ETS = 22; //港股(ETS)，OMD-C 10号消息
            // }
            if (!this.stockDetail) return false
            return this.stockDetail.listSector === 3 || this.stockDetail.listSector === 12
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.chartDom = document.getElementById(this.chartId)
            window.addEventListener('resize', this.initDebounce)
            this.timer = setInterval(() => {
                this.initDebounce()
            }, 200)
        })
    },
    destroyed() {
        this._fetchKLine && this._fetchKLine.destroy()
        this._fetchKLine = null
        this.chart && this.chart.destroy()
        this.chart = null
        // 因为renderChart使用了节流操作
        // 在组件销毁之后，可能还会继续执行，导致初始化图表的操作会继续执行
        // 这里把该函数设置为空函数
        this.renderChart = function() {}
        clearInterval(this.timer)
    },
    watch: {
        mainIndicator(val) {
            this.removeMainIndicator()
            let data
            if (this.moveLastIdx > 0 || this.moveStartIdx > 0) {
                data = this.list.slice(this.moveStartIdx, this.moveLastIdx)
            }
            this.renderChart(data)
        },
        stock: {
            handler(v, oldV) {
                if (!v) {
                    return
                }
                this.setResetChartSwitch(true)
                this.init()
            },
            immediate: true
        },
        type: {
            handler() {
                this.setResetChartSwitch(true)
                this.init()
            }
        },
        direction: {
            handler() {
                this.setResetChartSwitch(true)
                this.init()
            }
        },
        businessKlines: {
            handler() {
                this.setResetChartSwitch(true)
                this.init()
            }
        },
        technicalIndicators: {
            handler(v) {
                // 由於這裡newV和oldV是一樣的，所以強制全部指標清除
                // if (oldV && oldV.length < newV.length) {
                //     let diff = diffArr(oldV, newV)
                //     console.log(diff)
                // }
                this.technicalIndicatorList.forEach(indicatorsType => {
                    if (!v.includes(indicatorsType)) {
                        removeTechnicalIndicators.apply(this, [indicatorsType, this.subIndicatorList, this.drawLinesMapper])
                    }
                })
                this.init(true)
            },
            deep: true
        },
        calcParamsMapper: {
            handler() {
                this.technicalIndicators.forEach(indicatorsType => {
                    removeTechnicalIndicators.apply(this, [indicatorsType, this.subIndicatorList, this.drawLinesMapper])
                })
                this.init(true)
            }
        },
        drawLinesMapper: {
            handler() {
                this.technicalIndicators.forEach(indicatorsType => {
                    removeTechnicalIndicators.apply(this, [indicatorsType, this.subIndicatorList, this.drawLinesMapper])
                })
                this.init(true)
            }
        }
    },
    methods: {
        initDebounce: debounce(function() {
            if (this._isDestroyed) {
                return
            }
            if (this.wrapperWidth === 0 && this.wrapperHeight === 0) {
                return
            }
            if (this.wrapperWidth !== this.chartDom.offsetWidth ||
                this.wrapperHeight !== this.chartDom.offsetHeight) {
                this.init(true)
            }
        }, 150),
        // 初始化
        init(noFetch = false) {
            if (noFetch) {
                this.renderChart(this.list)
                return
            }
            this.fetchData(data => {
                this.$nextTick(() => {
                    this.renderChart(data)
                })
            })
        },
        // 获取数据
        async fetchData(callback) {
            if (!this._fetchKLine) {
                this._fetchKLine = new FetchKLine()
            }

            this._fetchKLine.start(
                this.stock,
                data => {
                    // 若返回数据不是当前股票的，则不渲染
                    // 防止频繁切换股票详情，导致多个股票详情返回，引起图表切换渲染
                    if (data.symbol !== this.stock.slice(2)) return
                    let list = filterServerData(data, { isLine: this.isLine, type: this.type })

                    let newAddData = []
                    let finalData = []
                    if (this.isResetChartData) {
                        this.setResetChartSwitch(false)
                        this.tmpList = list
                        callback(list)
                        this.list = list
                        // 是否需要重置图表数据, 切换股票、 type（分时、日k、分钟等）、direction（复权）将重置图表数据
                        this.resetStockRelevantStatus()
                    } else {
                        // 只是行情数据更新
                        let idx = list.findIndex(value => value.latestTime === this.list[this.list.length - 1].latestTime)
                        // console.log('新行情数据长度 :>> ', list.length)
                        // console.log('旧行情数据长度 :>> ', this.list.length)
                        // console.log('旧有行情最后一条数据在新行情数据中的下标 :>> ', idx)
                        if (idx > -1) {
                            newAddData = list.slice(idx + 1)
                        }
                        finalData = this.list.concat(newAddData)
                        this.tmpList = finalData
                        this.list = finalData
                    }
                    if (!this.list || !this.list.length) {
                        return
                    }
                    const last = this.list[this.list.length - 1]
                    this.changeStockInfo(last)
                    // 如果十字线选中了最后一条数据，实时更新左上角/右上角数据展示的内容
                    const dataCount = this.isLine ? this.list.length : Math.min(this.count || XCOUNT, this.list.length)
                    if (this.position && +this.selectedIndex === dataCount - 1) {
                        this.changeStockPrice(last, this.position)
                    }
                },
                {
                    type: this.type,
                    direction: this.direction,
                    from: this.from
                }
            )
        },
        resetStockRelevantStatus() {
            // 重置股票相关状态
            this.xCount = XCOUNT
            this.moveLastIdx = this.list.length
            if (this.list.length <= this.xCount) {
                this.moveStartIdx = 0
            } else {
                this.moveStartIdx = this.moveLastIdx - this.xCount
            }

            this.isRequestMoreData = false
            this.isNoMoreData = false
        },
        // 设置重置图表开关
        setResetChartSwitch(val) {
            this.isResetChartData = val
        },
        // 图表渲染入口方法
        doRenderChart(data) {
            // svg 的宽高
            let width = this.width
            let height = this.height
            if (this.chartDom) {
                // 图表或者其父级若被隐藏后，比如display:none，则获取offsetWidth为0
                // 此时图表被隐藏了，不隐藏进行渲染
                if (this.chartDom.offsetWidth === 0 && this.chartDom.offsetHeight === 0) {
                    return
                }
                this.wrapperWidth = this.chartDom.offsetWidth
                this.wrapperHeight = this.chartDom.offsetHeight
                width = this.chartDom.offsetWidth - 5
                height = this.chartDom.offsetHeight - 9
            }

            // 初始化图表实例
            this.initChart(width, height)

            // 主指标提示的高度
            this.mainIndicatorTextHeight = 0
            if (this.showMainIndicator) {
                this.mainIndicatorTextHeight = 15
            }

            // Y轴坐标系的宽度（双侧展示的价格区间所占的宽度）
            this.scaleWidth = 10
            this.scaleRight = 0
            const fontSize = 12
            // 除去X轴坐标系（底部日期标签所占高度）得到的用来绘制内容区域的高度
            const contentHeight = height - (fontSize + 6)
            // 将该内容区域，进行纵向分区，绘制不同的元素，如蜡烛图、指标线等
            // 例如：partHeights: [300, 100] 表示划分为两块纵向区域，顶部区域300高度，底部区域绘制100高度
            const partHeights = verticalBlockHeights(this.isLine, contentHeight)
            if (data[0] && data[0].price > 0) {
                this.scaleWidth = (parseInt(data[data.length - 1].price) + '').length * 10 + 24
                this.scaleWidth = this.scaleWidth < 50 ? 50 : this.scaleWidth
            }

            // 计算图表应该展示的数据数量
            const count = this.calcShowCount(data[0])

            // 修改图表实例的内部属性
            this.chart.setAttr('data', data)
            this.chart.setAttr('scaleWidth', this.scaleWidth)
            this.chart.setAttr('scaleRight', this.scaleRight)
            this.chart.setAttr('xCount', count)

            // 鼠标缩放
            this.initMouseScale()

            const xPadding = 0 // x 轴左右边距
            const yPadding = 2 // y 轴上下边距
            // 基础系数，可用来求取上下边距。
            // 如渲染内容高度为 maxY - minY = 300, 则上下边距为 300 * base = 30
            // 此时总体渲染高度依旧为 300，但是实际用来渲染内容的区域为 300 - 30 = 270
            const base = 0.1
            const gridUnitHeight = 30 // 纵向区域，每行网格的高度
            let options = {
                data,
                width,
                height,
                partHeights,
                xPadding,
                yPadding,
                startY: this.mainIndicatorTextHeight,
                base,
                fontSize,
                technicalIndicatorDatas: [],
                xCount: count
            }
            // 渲染技术指标
            // 这里重新计算了 partHeights , 所以和下面计算 gridY、renderGrid 顺序不可变
            options = this.initTechnicalIndicators(options, { contentHeight })

            options.gridY = Math.floor(options.partHeights[0] / gridUnitHeight)
            // 渲染图表网格
            renderGrid.call(this, {
                width: width - xPadding,
                height: options.partHeights[0],
                gridY: options.gridY,
                mainIndicatorTextHeight: this.mainIndicatorTextHeight
            })
            // 因为要保证，即使没有数据也要保证logo和网格出现，所以数据为空的逻辑放到这里
            if (!data || data.length === 0) {
                this.chart && this.chart.removeAll()
                return
            }
            // 渲染图表相关模块
            this.renderModules(options)
        },
        // 渲染chart一些固定的模块
        renderModules({
            data,
            width,
            height,
            partHeights,
            gridY,
            xPadding,
            yPadding,
            base,
            startY,
            fontSize,
            technicalIndicatorDatas,
            xCount
        }) {
            // 计算渲染数据中，在Y轴方向上的最大最小值
            const { maxKLineY, minKlineY, sliceData } = this.calcYaxisRange({ data, xCount, isLine: this.isLine, market: this.market })
            data = sliceData
            this.chart.setAttr('maxKlineY', maxKLineY)
            this.chart.setAttr('minKlineY', minKlineY)

            // 计算X轴底部时间坐标渲染数据
            const scaleXData = this.calcXaxisData(data)
            // 渲染 X 轴底部坐标
            this.renderModule('Scale', 'usmart-chart-scaleX', {
                data: scaleXData.map(item => ({ value: item.time })),
                position: 'x',
                startY,
                fontSize: fontSize,
                color: 'rgba(109, 109, 109, 1)',
                fullWidth: this.isTimeSharing,
                // 5日分时按照实际坐标位置显示，如果数据有5日整，则填满，否则最后一个坐标会溢出
                // TODO 可以不在这里判断，在绘图时优化，待优化
                realScaleX: this.isTimeSharing5 && scaleXData.length < 5
            }, ['time'])

            const preClose = data[0] && data[0].preClose
            // Y 轴坐标
            this.renderModule('Scale', 'usmart-chart-scaleY', {
                data: scaleYdata(maxKLineY, minKlineY, gridY + 1, preClose, this.isLine),
                position: 'y',
                startY,
                height: partHeights[0],
                fontSize: fontSize
            }, ['price'])

            // 成交量
            const maxVolume = d3.max(data, d => d.volume)
            const minVolume = d3.min(data, d => d.volume)

            if (this.isLine) {
                // 分时、五日分时折线
                this.initTimeSharingChart({
                    width,
                    xPadding,
                    partHeights,
                    data,
                    base,
                    minKlineY,
                    maxKLineY,
                    maxVolume,
                    minVolume,
                    fontSize
                })
            } else {
                // 实体柱状，蜡烛图
                this.initCandleChart({ width: width - xPadding, height: partHeights[0], data })
            }
            // 渲染买卖点\现价线\持仓成本
            renderBusiness.apply(this,
                [
                    { data, height: partHeights[0], width: width - xPadding, base, maxKLineY, minKlineY },
                    { isLine: this.isLine, stock: this.stock, stockDetail: this.$store.getters.stockDetail, type: this.type, businessKlines: this.businessKlines }
                ]
            )

            // 主要指标
            let mainIndicatorDatas = this.renderMainIndicator({
                width: width - xPadding,
                height: partHeights[0],
                startY,
                data: data,
                baseY: base
            })

            // 鼠标悬浮时候显示的 十字线
            this.initChartCross({
                data,
                width,
                height,
                xPadding,
                yPadding,
                partHeights,
                startY,
                maxKLineY,
                minKlineY,
                maxVolume,
                minVolume,
                technicalIndicatorDatas,
                mainIndicatorDatas,
                fontSize
            })
        },
        // 初始化图表实例
        initChart(width, height) {
            if (!this.chart) {
                this.chart = new Chart(`#${this.chartId}`, {
                    width,
                    height
                })
                    .init({
                        background: '#1a1a1a'
                    })
            } else {
                this.chart.changeViewBox(width, height)
            }
        },
        // 渲染折线图，这里是分时和5日分时
        initTimeSharingChart(options) {
            const { width, xPadding, partHeights, data, base, minKlineY, maxKLineY, fontSize, maxVolume, minVolume } = options
            // 移除蜡烛图
            this.removeModule('usmart-chart-KLine')
            // 渲染折线图
            this.renderModule('Line', 'usmart-chart-line', {
                data: data.map(item => item.price),
                width: width,
                height: partHeights[0],
                preClose: data[0] && data[0].preClose,
                baseY: base,
                minY: minKlineY,
                maxY: maxKLineY,
                stroke: '#0BC0F1',
                strokeWidth: 0.6,
                background: ['rgba(4, 132, 206, 0.29)', 'rgba(4, 132, 206, 0)']
            }, ['price'])
            // 渲染均线
            this.renderModule('Line', 'usmart-chart-line__avg', {
                data: data.map(item => item.avg),
                width: width,
                height: partHeights[0],
                preClose: data[0] && data[0].preClose,
                baseY: base,
                minY: minKlineY,
                maxY: maxKLineY,
                stroke: '#ff9e0e',
                strokeWidth: 0.6
            })

            // 成交量柱状图
            const riseColor = RISE_COLOR()
            const fallColor = FALL_COLOR()
            let stockType = this.$electronStorage.get('stockColor')
            let variableName = 'volume' // 成交量
            if (maxVolume === 0 && minVolume === 0) {
                // 某些指数没有成交量，只有成交额
                variableName = 'amount' // 成交额
            }
            this.renderModule('Bar', 'usmart-chart-bar', {
                width: width - xPadding,
                height: partHeights[1],
                data: data.map((item, index) => {
                    let color
                    // console.log(stockType)
                    if (index === 0) {
                        color = item.netchng > 0 ? riseColor : fallColor
                    } else {
                        // 比较上一分时的数据
                        color = item.pctchng > data[index - 1].pctchng ? riseColor : fallColor
                    }
                    // 0红涨绿跌 1绿涨红跌
                    if (stockType === 1 && color === riseColor) {
                        color = fallColor
                    }
                    if (stockType === 1 && color === fallColor) {
                        color = riseColor
                    }

                    return {
                        time: item.time,
                        value: item[variableName],
                        color
                    }
                }),
                style: `transform: translateY(${partHeights[0]}px)`,
                fill: true,
                showText: false
            }, [variableName, 'time'])

            // 成交量Y坐标轴
            this.renderModule('Scale', 'usmart-chart-scaleY_volumn', {
                data: [
                    {
                        value: Number((d3.max(data, d => d[variableName])).toFixed(3)),
                        text: formatBigNumber((d3.max(data, d => d[variableName])))
                    },
                    {
                        value: Number((d3.min(data, d => d[variableName])).toFixed(3)),
                        text: formatBigNumber((d3.min(data, d => d[variableName])))
                    }
                ],
                position: 'y',
                height: partHeights[1],
                baseY: base,
                fontSize: fontSize,
                responseFontsize: true,
                style: `transform:translateY(${partHeights[0]}px)`
            }, [variableName])
        },
        // 渲染蜡烛图
        initCandleChart(options) {
            const { width, height, data } = options
            // 移除 成交量柱状图
            this.removeModule('usmart-chart-bar')
            // 移除 成交量Y坐标轴
            this.removeModule('usmart-chart-scaleY_volumn')
            // 移除 分时折线图
            this.removeModule('usmart-chart-line')
            this.removeModule('usmart-chart-line__avg')
            // 渲染蜡烛图
            this.renderModule('KLine', 'usmart-chart-KLine', {
                width,
                height,
                data: data
            }, ['high', 'low', 'close'])
        },
        // 渲染十字线
        initChartCross(options) {
            const {
                data,
                width,
                height,
                xPadding,
                yPadding,
                partHeights,
                startY,
                maxKLineY,
                minKlineY,
                maxVolume,
                minVolume,
                technicalIndicatorDatas,
                mainIndicatorDatas,
                fontSize
            } = options
            let maxY = maxVolume
            let minY = minVolume
            if (maxY === 0 && minY === 0) {
                // 某些指数没有成交量，只有成交额
                maxY = d3.max(data, d => d.amount)
                minY = d3.min(data, d => d.amount)
            }
            // 鼠标悬浮时候显示的 十字线
            const crossY = [
                {
                    ...getModuleArea(partHeights, 0, startY),
                    data: [
                        maxKLineY,
                        minKlineY
                    ]
                }
            ]
            if (this.isLine) {
                // 分时、五日分时 Y 轴数据
                crossY.push({
                    ...getModuleArea(partHeights, 1),
                    data: [
                        maxY,
                        minY
                    ],
                    formatBigNumber,
                    baseY: 0
                })
            } else {
                // 蜡烛图 Y 轴数据
                crossY.push(...technicalIndicatorDatas.map((d, i) => {
                    // let areaHeight = partHeights[i + 1] - this.indicatorConfig.fontSize - this.indicatorConfig.padInner * 2
                    let p = getModuleArea(partHeights, i + 1)
                    return {
                        ...{
                            start: p.start + this.indicatorConfig.fontSize + this.indicatorConfig.padInner * 2 + this.mainIndicatorTextHeight,
                            end: p.end
                        },
                        data: [
                            d3.max(d, d => d3.max(Object.values(d))),
                            d3.min(d, d => d3.min(Object.values(d)))
                        ]
                    }
                }))
            }
            // 移除旧的十字线 解决十字线层级在下面的问题
            this.removeModule('usmart-chart-cross')
            // 渲染十字线 X、Y 轴数据
            this.renderModule('Cross', 'usmart-chart-cross', {
                width: width - xPadding,
                height: height - yPadding,
                startY,
                targetSelector: `#${this.chartId}`,
                preClose: data[0] && data[0].preClose,
                data: {
                    x: [
                        {
                            start: 0,
                            end: width,
                            data: data.map(d => d.time),
                            // 当showPoint为true时，取relateKey的字段来定义point的纵坐标
                            relateKey: 'price'
                        }
                    ],
                    y: crossY
                },
                cb: (selectedData, position, selectedIndex) => {
                    this.selectedIndex = selectedIndex
                    this.renderTiText(technicalIndicatorDatas, partHeights)
                    this.renderMainIndicatorText(mainIndicatorDatas, selectedIndex)
                    // console.log('crossCb:', selectedData, point)
                    this.changeStockPrice(selectedData, position)
                },
                hideCb: () => {
                    this.selectedIndex = -1
                    this.removeTiText()
                    this.changeStockPrice(null)
                },
                mousemoveCb: this.moveCandlestick,
                showPoint: this.isLine,
                fontSize: fontSize,
                kLineData: data
            },
            null,
            true
            )
        },
        // 渲染技术指标
        initTechnicalIndicators(options, otherOption) {
            const { partHeights } = options
            const { contentHeight } = otherOption

            // 展示技术指标，渲染技术图表
            if (this.showTechnicalIndicators) {
                // 根据指标数量，切分相应指标的纵向区域范围
                options.partHeights = divideVerticalArea(contentHeight, partHeights, this.technicalIndicators.length)
                options.technicalIndicatorDatas = []
                this.technicalIndicators.forEach((indicatorsType, index) => {
                    options.technicalIndicatorDatas.push(
                        renderTechnicalIndicators.apply(this,
                            [
                                indicatorsType,
                                // calcParamsMapper: 不同技术指标的参数设置
                                // drawLinesMapper: 不同技术指标的指标线是否绘制
                                {
                                    ...options,
                                    calcParams: this.calcParamsMapper[indicatorsType],
                                    drawLines: this.drawLinesMapper[indicatorsType],
                                    indicatorConfig: this.indicatorConfig,
                                    subIndicatorList: this.subIndicatorList
                                },
                                index
                            ]
                        )
                    )
                })
                return options
            }
            // 不展示技术指标，移除现有技术图表
            if (this.technicalIndicators.length) {
                this.technicalIndicators.forEach(indicatorsType => {
                    removeTechnicalIndicators.apply(this, [indicatorsType, this.subIndicatorList, this.drawLinesMapper])
                })
            }
            return options
        },
        // 鼠标缩放操作
        initMouseScale() {
            // 鼠标缩放
            this.chart.initMouseScroll({
                cb: (isUp, percent) => {
                    if (this.isLine) {
                        return
                    }
                    let c = Math.ceil((isUp ? 0.8 : 1.2) * this.xCount)
                    if (c <= 30) {
                        c = 30
                    }
                    if (c > 300) {
                        c = 300
                    }
                    const listLen = this.list.length
                    const dif = listLen >= this.xCount ? (this.xCount - c) : (listLen - c)
                    // console.log('当前数据条数 :>> ', listLen)
                    // console.log('需要展示的蜡烛图条数 :>> ', c)
                    // console.log('缩小放大的差值dif :>> ', dif)
                    this.xCount = c

                    const leftC = parseInt(dif * percent)
                    const rightC = dif - leftC
                    // console.log('左侧变化数量leftC :>> ', leftC)
                    // console.log('右侧变化数量rightC :>> ', rightC)

                    this.moveStartIdx += leftC
                    this.moveLastIdx -= rightC
                    if (this.moveLastIdx >= listLen) {
                        this.moveLastIdx = listLen
                        this.moveStartIdx = c <= listLen ? (listLen - c) : 0
                    }
                    if (this.moveStartIdx <= 0) {
                        this.moveStartIdx = 0
                        this.moveLastIdx = c <= listLen ? c : listLen
                    }
                    // console.log('起始数据下标>this.moveStartIdx :>> ', this.moveStartIdx)
                    // console.log('终点数据下标>this.moveLastIdx :>> ', this.moveLastIdx)
                    // console.log('起始与终点差值>this.moveLastIdx :>> ', this.moveLastIdx - this.moveStartIdx)
                    const data = this.list.slice(this.moveStartIdx, this.moveLastIdx)
                    this.renderChart(data)
                }
            })
        },
        // 移动蜡烛图
        async doMoveCandlestick(direction) {
            if (this.isRequestMoreData) return

            let listLen = (this.list && this.list.length) || 0
            if (!this.isLine && listLen) {
                // if (this.moveLastIdx >= listLen && this.moveStartIdx <= 0) return

                let rate = this.xCount / XCOUNT
                // 默认左移动
                let dis = parseInt(10 * rate)
                // console.log('dis :>> ', dis)
                if (direction === 2) {
                    // 右移动
                    dis = -dis
                }

                this.moveLastIdx += dis
                this.moveStartIdx += dis

                if (this.moveLastIdx >= listLen) {
                    this.moveLastIdx = listLen
                    this.moveStartIdx = listLen <= this.xCount ? 0 : (this.moveLastIdx - this.xCount)
                }
                if (this.moveStartIdx <= 0) {
                    this.moveStartIdx = 0
                    this.moveLastIdx = listLen <= this.xCount ? listLen : this.xCount
                }

                let movedata = this.list.slice(this.moveStartIdx, this.moveLastIdx)
                // requestMoveTime
                // 移动到最左端了
                if (this.moveStartIdx <= 0) {
                    this.isRequestMoreData = true
                    // 尝试去后端拉取以前日期的数据
                    if (!this.isNoMoreData) {
                        // 上次请求到的后端数据不为空，当前可以继续请求
                        let newData = await getKlineData({
                            id: this.stock,
                            type: this.type,
                            start: this.list[0].latestTime,
                            level: 4,
                            direction: this.direction,
                            // start: this.from,
                            count: this.xCount + 1
                        })
                        // 如果没有请求到数据，或者数据只有一条（该条为当前请求的时间段数据，需要过滤）则不再让他继续请求
                        if (!newData.list || !newData.list.length || newData.list.length === 1) {
                            this.isNoMoreData = true
                            this.isRequestMoreData = false
                            return
                        }
                        // 去掉最后一个重复的数据
                        newData.list = newData.list.slice(0, -1)
                        let list = filterServerData(newData, { isLine: this.isLine, type: this.type })
                        this.list.unshift(...list)
                        this.moveLastIdx += list.length
                        this.moveStartIdx += list.length

                        // 加载到数据之后，等待 requestMoveTime 时间之后，方可再次移动
                        setTimeout(() => {
                            this.isRequestMoreData = false
                        }, this.requestMoveTime)
                        return
                    } else {
                        this.isRequestMoreData = false
                    }
                }

                // console.log('movedata :>> ', movedata)
                this.renderChart(movedata)
            }
        },
        // 计算图表需要展示的数据条数
        calcShowCount(dataItem) {
            let count = 0
            if (this.isLine && dataItem) {
                this.scaleRight = 45
                if (this.isTimeSharing) {
                    count = this.dealingMins
                } else if (this.isTimeSharing5) {
                    count = this.dealingMins * 5
                }
            } else {
                count = this.xCount
            }
            return count
        },
        // 计算渲染数据中，在Y轴方向上的最大最小值
        calcYaxisRange({ data, xCount, isLine, market }) {
            let maxKLineY = 0
            let minKlineY = 0
            let maxDis = 0
            const yesterdayPrice = data[0].preClose
            if (xCount && data.length > xCount) {
                data = data.slice(data.length - xCount)
            }
            if (isLine) {
                // 分时、五日分时
                maxKLineY = d3.max(data, d => d.price)
                minKlineY = d3.min(data, d => d.price)

                // 根据昨收价，对半展示图表
                // 只对 A 股做对半，其他市场不做，因为 A 股有涨停限制
                // 港美股没有限制，可能存在涨停如 200% 等情况，导致对半展示的话，整个图表给人感觉空空
                if (['sh', 'sz'].includes(market)) {
                    maxDis = Math.max(Math.abs(maxKLineY - yesterdayPrice), Math.abs(minKlineY - yesterdayPrice))
                    maxKLineY = yesterdayPrice + maxDis
                    minKlineY = yesterdayPrice - maxDis
                } else {
                    if (minKlineY > yesterdayPrice) {
                        minKlineY = yesterdayPrice
                    }
                    if (maxKLineY < yesterdayPrice) {
                        maxKLineY = yesterdayPrice
                    }
                }
            } else {
                maxKLineY = d3.max(data, d => d.high)
                minKlineY = d3.min(data, d => d.low)
            }
            if (+maxKLineY < +minKlineY) {
                const tmp = maxKLineY
                maxKLineY = minKlineY
                minKlineY = tmp
            }
            return {
                maxKLineY,
                minKlineY,
                sliceData: data
            }
        },
        // 计算X轴底部坐标渲染数据
        calcXaxisData(data) {
            let scaleXData = []
            if (this.isTimeSharing) {
                // 分时
                const ftHour = data[0].time.substring(11)
                const firstTime = new Date(`2021/01/01 ${ftHour}`)
                const lastTime = new Date(`2021/01/01 16:00`)
                let scaleX = DEALING_MINS_TIMES[this.market]
                if (this.isCYBOrKCB) {
                    scaleX = DEALING_MINS_TIMES.cyb_kcb
                } else if (firstTime > lastTime) {
                    // 若获取的数据的第一个时间大于 16:00,说明是新股
                    // 从 16：15分开始才有数据
                    scaleX = DEALING_MINS_TIMES.gray_market
                }

                if (data.length) {
                    scaleXData = [
                        { time: ftHour },
                        { time: scaleX.middle },
                        { time: scaleX.end }
                    ]
                    if (firstTime > lastTime) {
                        scaleXData.shift()
                    }
                }
            } else if (this.isTimeSharing5) {
                // 五日分时
                let timeStr = ''
                scaleXData = data.reduce((r, d) => {
                    timeStr = formatText2Time(d.latestTime, 'date')
                    timeStr = timeStr.substring(5).replace('-', '/')
                    if (!r.find(day => day.time === timeStr)) {
                        r.push({
                            time: timeStr
                        })
                    }
                    return r
                }, [])
            } else {
                // 实体柱状，蜡烛图
                scaleXData = data.length ? [
                    data[0],
                    data[data.length - 1]
                ] : []
            }
            return scaleXData
        },
        /*
            单个模块的渲染
            @module 模块名
            @key 模块唯一标识
            @option 模块参数
            @renderKeys 当key改变时，该模块重新渲染
            @noRemove 重新渲染时，不删除改模块，默认删除
        */
        renderModule(module, key, option, renderKeys, noRemove = false) {
            // console.log(module, key, option)
            if (this.hideCross && module === 'Cross') {
                return
            }
            if (this.hideScale && module === 'Scale') {
                return
            }
            // 判断如果没有更新的字段，模块不重新渲染 待优化
            // if (renderKeys && !isUpdate(this.tmpList, this.list, renderKeys)) {
            //     return
            // }
            this.removeModule(key, noRemove)
            key = generateKey(this.chartId, key)
            this.chart[`init${module}`]({
                ...option,
                className: key
            })
        },
        // 移除模块
        removeModule(key, noRemove) {
            // console.log('removeModule', key)
            // this.chart.remove(`.${[key]}`)
            key = generateKey(this.chartId, key)
            if (!noRemove) {
                this.chart && this.chart.remove(`.${[key]}`)
            }
        },
        // 渲染所有技术指标文本
        renderTiText(technicalIndicatorDatas, partHeights) {
            // console.log(technicalIndicatorDatas, this.technicalIndicators)
            this.technicalIndicators.forEach((d, i) => {
                const start = getModuleArea(partHeights, i + 1).start + this.indicatorConfig.fontSize + this.indicatorConfig.padInner
                const style = `transform: translateY(${start}px)`
                if (this.subIndicatorList.includes(d)) {
                    this.renderSubIndicatorText(technicalIndicatorDatas[i], style, d)
                    return
                }
                // console.log(style)
                this[`render${d}Text`](technicalIndicatorDatas[i], style)
            })
        },
        // 移除所有技术指标文本
        removeTiText() {
            this.technicalIndicators.forEach(indicatorsType => {
                if (this.subIndicatorList.includes(indicatorsType)) {
                    removeSubIndicatorText.call(this, indicatorsType)
                    return
                }
                this[`remove${indicatorsType}Text`]()
            })
        },
        renderMainIndicator(option) {
            if (this.showMainIndicator) {
                const Indicator = IndicatorFormula.getClass(this.mainIndicator)
                const type = this.mainIndicator === 'SAR' ? 'Circles' : 'Line'
                const indic = new Indicator()
                let data = indic.calculate(this.list, this.calcParamsMapper[this.mainIndicator])
                data = data.slice(this.moveStartIdx, this.moveLastIdx)
                let tempData = this.list.slice(this.moveStartIdx, this.moveLastIdx)
                Object.keys(data[0]).forEach((key, i) => {
                    this.drawLinesMapper[this.mainIndicator][i] && this.renderModule(type, `usmart-chart-Line_main_indicaor_${i}`, {
                        ...option,
                        klineData: tempData,
                        maxY: d3.max(tempData, d => d.high),
                        minY: d3.min(tempData, d => d.low),
                        stroke: YL_KLINE_COLORS[`YL_KLINE_${i + 1}_COLOR`],
                        data: data.map((item) => item[key])
                    })
                })
                data && this.renderMainIndicatorText(data, data.length - 1)
                return data
            } else {
                this.removeMainIndicator()
            }
        },
        renderMainIndicatorText(mainIndicatorDatas, selectedIndex) {
            if (!mainIndicatorDatas) {
                return
            }
            let obj = mainIndicatorDatas[selectedIndex]
            let showDataList = Object.keys(obj).map((key, i) => {
                return {
                    show: this.drawLinesMapper[this.mainIndicator][i],
                    label: key + ': ',
                    value: obj[key].toFixed(3),
                    color: YL_KLINE_COLORS[`YL_KLINE_${i + 1}_COLOR`]
                }
            })
            showDataList.unshift({
                show: true,
                label: this.mainIndicator,
                value: '',
                color: '#979797'
            })
            this.renderModule('Text', 'usmart-chart-text_mainInicator', {
                data: showDataList.filter(item => item.show),
                style: `transform: translateY(10px)`
            })
        },
        removeMainIndicator() {
            for (let i = 0; i < 10; i++) {
                this.removeModule(`usmart-chart-Line_main_indicaor_${i}`)
            }
            this.removeModule('usmart-chart-text_mainInicator')
        },
        renderSubIndicator({
            data,
            width,
            fontSize,
            calcParams = [26]
        }, areaHeight, index, style, type) {
            data = this.list
            let indicatorData = this.subIndicatorObj[type](data, calcParams)
            indicatorData = indicatorData.slice(this.moveStartIdx, this.moveLastIdx)
            const maxList = indicatorData.map(item => d3.max(Object.values(item)))
            const minList = indicatorData.map(item => d3.min(Object.values(item)))
            let max = Number(d3.max(maxList, d => d).toFixed(3))
            let min = Number(d3.min(minList, d => d).toFixed(3))
            // 副指标坐标长度修正scaleWidth
            const scaleWidth = (parseInt(max) + '').length * 10 + 24
            this.scaleWidth = this.scaleWidth < scaleWidth ? scaleWidth : this.scaleWidth
            this.chart.setAttr('scaleWidth', this.scaleWidth)
            let showObj = this.drawLinesMapper[type]
            Object.keys(indicatorData[0]).forEach((key, i) => {
                if (key === 'value') {
                    return
                }
                showObj[i] && this.renderModule('Line', `usmart-chart-sub_${type}_${i + 1}`, {
                    data: indicatorData.map(item => item[key] || 0),
                    width: width,
                    height: areaHeight,
                    maxY: max,
                    minY: min,
                    stroke: YL_KLINE_COLORS[`YL_KLINE_${i + 1}_COLOR`],
                    strokeWidth: 1,
                    style
                })
            })
            // 技术指标Y坐标轴
            this.renderModule('Scale', `usmart-chart-scaleY_${type}`, {
                data: [
                    {
                        value: min.toFixed(3)
                    },
                    {
                        value: max.toFixed(3)
                    }
                ],
                position: 'y',
                maxY: max,
                minY: min,
                height: areaHeight,
                fontSize: fontSize,
                style
            })
            return indicatorData
        },
        renderSubIndicatorText(data, style, type) {
            let selectCrossObj = data[this.selectedIndex]
            delete selectCrossObj.value
            const showList = Object.keys(selectCrossObj).map((key, index) => {
                return {
                    show: this.drawLinesMapper[type][index],
                    label: `${key.toUpperCase()}: `,
                    value: selectCrossObj[key].toFixed(3),
                    color: YL_KLINE_COLORS[`YL_KLINE_${index + 1}_COLOR`]
                }
            })
            showList.unshift({
                show: true,
                label: type,
                value: '',
                color: '#979797'
            })
            this.renderModule('Text', `usmart-chart-text_${type}`, {
                data: showList.filter(item => item.show),
                style
            })
        },
        // MACD指标
        renderMACD({
            data,
            width,
            height,
            partHeights,
            xPadding,
            yPadding,
            base,
            fontSize,
            xCount,
            calcParams = [12, 26, 9],
            drawLines = [true, true, true]
        }, areaHeight, index, style) {
            let macdData = MACD(data, calcParams)
            let minY = d3.min(macdData, d => d.value) || 0
            let maxY = d3.max(macdData, d => d.diff) || 0
            // 副指标坐标长度修正scaleWidth
            const scaleWidth = (parseInt(maxY) + '').length * 10 + 24
            this.scaleWidth = this.scaleWidth < scaleWidth ? scaleWidth : this.scaleWidth
            this.chart.setAttr('scaleWidth', this.scaleWidth)
            macdData[macdData.length - 1].value = maxY
            if (xCount && macdData.length > xCount) {
                macdData = macdData.slice(macdData.length - xCount)
            }
            let riseColor = RISE_COLOR()
            let fallColor = FALL_COLOR()
            this.renderModule('Bar', 'usmart-chart-bar_MACD', {
                width: width - xPadding,
                height: areaHeight,
                data: macdData.map(item => {
                    let color
                    if (this.$electronStorage.get('stockColor') === 1) {
                        color = item.macd > 0 ? fallColor : riseColor
                    } else {
                        color = item.macd > 0 ? riseColor : fallColor
                    }
                    return {
                        // time: item.time,
                        value: item.macd,
                        color
                    }
                }),
                minY,
                maxY,
                style,
                fill: true,
                showText: false,
                scattered: true
            })
            drawLines[1] && this.renderModule('Line', 'usmart-chart-Line_MACD_1', {
                data: macdData.map(item => item.dea),
                width: width,
                height: areaHeight,
                baseY: base,
                maxY,
                minY,
                stroke: MACD_COLORS.DEA,
                strokeWidth: 1,
                style
            })
            drawLines[0] && this.renderModule('Line', 'usmart-chart-Line_MACD_2', {
                data: macdData.map(item => item.diff),
                width: width,
                height: areaHeight,
                baseY: base,
                maxY,
                minY,
                stroke: MACD_COLORS.DIF,
                strokeWidth: 1,
                style
            })
            // drawLines[3] && this.renderModule('Line', 'usmart-chart-Line_MACD_3', {
            //     data: macdData.map(item => item.macd),
            //     width: width,
            //     height: areaHeight,
            //     baseY: base,
            //     stroke: 'purple',
            //     strokeWidth: 1,
            //     style
            // })
            // 技术指标Y坐标轴
            // let max = d3.max(macdData, d => d.value) || 0
            // let min = d3.min(macdData, d => d.value) || 0
            this.renderModule('Scale', `usmart-chart-scaleY_MACD`, {
                data: [
                    {
                        value: maxY.toFixed(3)
                    },
                    {
                        value: minY.toFixed(3)
                    }
                ],
                minY,
                maxY,
                position: 'y',
                height: areaHeight,
                fontSize: fontSize,
                style
            })
            return macdData
        },
        renderMACDText(data, style) {
            let d = data[this.selectedIndex]
            this.renderModule('Text', 'usmart-chart-text_MACD', {
                data: [
                    {
                        label: 'MACD',
                        value: '',
                        color: 'grey'
                    },
                    {
                        label: 'DIF: ',
                        value: d.diff && d.diff.toFixed(3),
                        color: MACD_COLORS.DIF
                    },
                    {
                        label: 'DEA: ',
                        value: d.dea && d.dea.toFixed(3),
                        color: MACD_COLORS.DEA
                    },
                    {
                        label: 'MACD: ',
                        value: d.macd && d.macd.toFixed(3),
                        color: 'red'
                    }
                ],
                style
            })
        },
        removeMACDText() {
            this.removeModule('usmart-chart-text_MACD')
        },
        removeMACD() {
            this.removeModule('usmart-chart-bar_MACD')
            this.removeModule('usmart-chart-Line_MACD_1')
            this.removeModule('usmart-chart-Line_MACD_2')
            this.removeModule('usmart-chart-Line_MACD_3')
            this.removeMACDText()
            this.removeModule('usmart-chart-scaleY_MACD')
        },
        renderMAVOL({
            data,
            width,
            height,
            partHeights,
            xPadding,
            yPadding,
            base,
            fontSize
        }, areaHeight, index, style) {
            let list = this.list.slice(this.moveStartIdx, this.moveLastIdx)
            let mavolData = MAVOL(this.list)
            mavolData = mavolData.slice(this.moveStartIdx, this.moveLastIdx)
            const maxList = mavolData.map(item => d3.max(Object.values(item)))
            const minList = mavolData.map(item => d3.min(Object.values(item)))
            let maxY = Number(d3.max(maxList, d => d).toFixed(3))
            let minY = Number(d3.min(minList, d => d).toFixed(3))
            let riseColor = RISE_COLOR()
            let fallColor = FALL_COLOR()
            this.renderModule('Bar', 'usmart-chart-bar_MAVOL', {
                width: width - xPadding,
                height: areaHeight,
                data: list.map((item, index) => {
                    let color = item.close > item.open ? riseColor : fallColor
                    if (index === 0) {
                        color = riseColor
                    }
                    return {
                        time: item.time,
                        value: mavolData[index].vol1,
                        color
                    }
                }),
                style,
                fill: true,
                showText: false
            }, ['volume', 'time'])
            // 第一个为柱状图
            this.renderModule('Line', 'usmart-chart-Line_MAVOL_1', {
                data: mavolData.map(item => item.vol5 || 0),
                width: width,
                height: areaHeight,
                baseY: base,
                maxY,
                minY,
                stroke: YL_KLINE_COLORS.YL_KLINE_1_COLOR,
                strokeWidth: 1,
                style
            })
            this.renderModule('Line', 'usmart-chart-Line_MAVOL_2', {
                data: mavolData.map(item => item.vol10 || 0),
                width: width,
                height: areaHeight,
                baseY: base,
                stroke: YL_KLINE_COLORS.YL_KLINE_2_COLOR,
                strokeWidth: 1,
                style
            })
            this.renderModule('Line', 'usmart-chart-Line_MAVOL_3', {
                data: mavolData.map(item => item.vol20 || 0),
                width: width,
                height: areaHeight,
                baseY: base,
                stroke: YL_KLINE_COLORS.YL_KLINE_3_COLOR,
                strokeWidth: 1,
                style
            })
            this.renderModule('Scale', `usmart-chart-scaleY_MAVOL`, {
                data: [
                    {
                        value: minY
                    },
                    {
                        value: maxY
                    }
                ],
                minY,
                maxY,
                position: 'y',
                height: areaHeight,
                fontSize: fontSize,
                responseFontsize: true,
                style
            })
            return mavolData
        },
        renderMAVOLText(data, style) {
            this.renderModule('Text', 'usmart-chart-text_MAVOL', {
                data: [
                    {
                        label: 'MAVOL',
                        value: '',
                        color: '#979797'
                    },
                    {
                        label: 'VOL1:',
                        value: data[this.selectedIndex].vol1.toFixed(3),
                        color: YL_KLINE_COLORS.YL_KLINE_1_COLOR
                    },
                    {
                        label: 'VOL5:',
                        value: data[this.selectedIndex].vol5.toFixed(3),
                        color: YL_KLINE_COLORS.YL_KLINE_2_COLOR
                    },
                    {
                        label: 'VOL10:',
                        value: data[this.selectedIndex].vol10.toFixed(3),
                        color: YL_KLINE_COLORS.YL_KLINE_3_COLOR
                    },
                    {
                        label: 'VOL20:',
                        value: data[this.selectedIndex].vol20.toFixed(3),
                        color: YL_KLINE_COLORS.YL_KLINE_4_COLOR
                    }
                ],
                style
            })
        },
        removeMAVOL() {
            this.removeModule('usmart-chart-bar_MAVOL')
            this.removeModule('usmart-chart-Line_MAVOL_1')
            this.removeModule('usmart-chart-Line_MAVOL_2')
            this.removeModule('usmart-chart-Line_MAVOL_3')
            this.removeModule('usmart-chart-scaleY_MAVOL')
        },
        removeMAVOLText() {
            this.removeModule('usmart-chart-text_MAVOL')
        },
        removeDMAText() {
            this.removeModule('usmart-chart-text_DMA')
        },
        changeStockPrice(data, position) {
            this.stockPrice = data
            this.position = position
            this.$emit('changeStockPrice', data, position)
        },
        changeStockInfo(data) {
            // console.log('changeStockInfo', data)
            this.$emit('changeStockInfo', data)
        }
    }
}
</script>
<style lang="scss">
.chart {
    position: relative;
    width: 100%;
    height: 100%;
    flex: 1;
}
</style>
