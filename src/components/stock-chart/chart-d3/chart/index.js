import * as d3 from 'd3'

import logo from './assets/logo.png'
// import {electronStorage} from '@/utils/plugins/localstorage/electron-storage'
import {RISE_COLOR, FALL_COLOR} from '@/utils/tools'
// 买
export const BUY_COLOR = '#0BC0F1'
// 卖
export const SELL_COLOR = '#FF9E0E'
// 做 T
export const T_COLOR = '#7A5CFF'
// 涨
// export let RISE_COLOR() = 'rgba(234, 61, 61, 1)'
// // 跌
// export let FALL_COLOR() = 'rgba(0, 186, 96, 1)'
// 平
export const FLAT_COLOR = '#6d6d6d'
// 宽度
export const WIDTH = 500
// 高度
export const HEIGHT = 250
// x轴元素之间的间距
export const PADDING_INNER = 0.5
export default class {
    constructor(root = '#yx-chart', options) {
        const { width = WIDTH, height = HEIGHT, xCount = 75, data = [], scaleWidth = 60, scaleRight = 45 } = options || {}
        this.root = root
        this.width = width
        this.height = height
        this.scaleRight = scaleRight
        this.svg = null
        // 十字线是否显示
        this.crossVisible = false
        // 显示的数据条数
        this.xCount = xCount
        // 渲染的数据集合
        this.data = data
        // 上下留空的比例
        this.baseY = 0.1
        // 左侧留给坐标显示位置的宽度
        this.scaleWidth = scaleWidth
        // 背景色
        this.background = 'rgb(29, 36, 53)'
        // 鼠标按下的起点
        this.mouseDownStartX = null
        // 计算拖拽的base位置
        this.calculateMouseX = null
        // 数据在纵坐标最大值
        this.maxKlineY = 0
        // 数据在纵坐标最小值
        this.minKlineY = 0
    }
    // 配置默认选项，初始化svg
    init(options) {
        const { background = 'rgb(29, 36, 53)' } = options || {}
        const svg = d3.select(this.root)
            .append('svg')
            .style('background', background)
            .style('height', '100%')
            .style('width', '100%')
        this.background = background
        // svg.attr('viewBox', [0, 0, this.width, this.height])
        this.svg = svg
        return this
    }

    setAttr(attr, v) {
        // console.log('setAtrr', attr, v)
        this[attr] = v
    }

    changeViewBox(width, height) {
        this.width = width
        this.height = height
        this.initLogo()
    }

    // 统一处理数据
    resolveData(data) {
        if (!this.xCount) {
            return data
        }
        // console.log('resolveData', data)
        data = data || []
        let r
        if (data.length > this.xCount) {
            r = data.slice(data.length - this.xCount)
        } else {
            r = data
            // r = [...data, ...new Array(this.xCount - data.length).fill(null)]
        }
        return r
        // return data
    }

    // 根据数据长度处理渲染宽度
    resolveWidth() {
        // 数据长度和设置的预期渲染长度xCount 一样的话，正常返回渲染宽度
        let width = this.width - this.scaleWidth - this.scaleRight
        if (this.xCount && this.data.length < this.xCount) {
            // 若数据长度小于预期，防止几条数据占满整屏幕的情况，需要对渲染宽度进行比例缩小
            width = width * (this.data.length / this.xCount)
        }
        return width
    }

    initLogo() {
        this.remove('.d3-logo')
        const maxWidth = 400 // 最大宽度
        let width = this.width / 2
        let height = width * 24 / 125
        if (width > maxWidth) {
            width = maxWidth
            height = width * 24 / 125
        }
        const xAxisHeight = 30 // 这里要减去 X 坐标轴所占的高度
        const imgX = (this.width - width) / 2
        const imgY = (this.height - height) / 2 - xAxisHeight
        const image = d3.create('svg:image')
            .attr('class', 'd3-logo')
            .attr('width', width)
            .attr('height', height)
            .attr('x', imgX)
            .attr('y', imgY)
            .attr('href', logo)
        this.svg.append(() => image.node())
        return image
    }

    /*
    * 绘制表格
    * @options:
    *   gridX: 列数，默认3
    *   gridY: 行数，默认4
    *   strokeWidth: 线条宽度，默认0.5
    *   stroke: 线条颜色，默认#999,
    *   className1
    * */
    initGrid(options) {
        let {
            width = this.width,
            height = this.height,
            gridX = 3, gridY = 4,
            strokeWidth = 0.6,
            stroke = '#999',
            startY = 0,
            className = 'd3-grid'
        } = options || {}
        const g = d3.create('svg:g').attr('class', className)
        const xSize = (width - this.scaleWidth - this.scaleRight) / gridX
        const ySize = (height - startY) / gridY
        const dataX = new Array(gridX + 1)
        const dataY = new Array(gridY + 1)
        // 计算坐标
        const getPosition = (base, max, scaleWidth = 0) => {
            // d：当前数据 i：索引
            return (d, i) => {
                let target = i * base
                if (target >= max) target = max - strokeWidth
                if (target <= 0) target = strokeWidth
                return target + scaleWidth
            }
        }
        // 竖线
        g.append('g')
            .selectAll('line')
            .data(dataX)
            .enter()
            .append('line')
            .attr('x1', getPosition(xSize, width - this.scaleRight, this.scaleWidth))
            .attr('x2', getPosition(xSize, width - this.scaleRight, this.scaleWidth))
            .attr('y1', startY)
            .attr('y2', height)
            .attr('stroke', stroke)
            .attr('stroke-width', strokeWidth)
        // 横线
        g.append('g')
            .selectAll('line')
            .data(dataY)
            .enter()
            .append('line')
            .attr('x1', this.scaleWidth)
            .attr('x2', width - this.scaleRight)
            .attr('y1', getPosition(ySize, height, startY))
            .attr('y2', getPosition(ySize, height, startY))
            .attr('stroke', stroke)
            .attr('stroke-width', strokeWidth)
        this.svg.append(() => g.node())
        return g
    }
    /*
    * 绘制横、竖立直线
    * @options:
    *   strokeWidth: 线条宽度，默认0.5
    *   stroke: 线条颜色，默认#fff,
    *   className
    * */
    initStraightLine(options) {
        let {
            width = this.width,
            height = this.height,
            xPos = 0,
            yPos = 0,
            maxY = 0,
            minY = 0,
            data = [],
            direction = 'x',
            strokeWidth = 0.5,
            paddingInner = PADDING_INNER,
            stroke = '#fff',
            className = 'd3-straight-line'
        } = options || {}

        width = this.resolveWidth()
        const domainMaxY = maxY
        const domainMinY = minY
        const diffY = (domainMaxY - domainMinY) * this.baseY // 纵向上下留空比例
        const scaleX = d3.scaleBand().domain(d3.range(data.length)).range([this.scaleWidth, width]).paddingInner(paddingInner)
        const scaleY = d3.scaleLinear().domain([domainMinY - diffY, domainMaxY + diffY]).range([height, 0])

        const g = d3.create('svg:g').attr('class', className)
        const dataX = new Array(1)
        const dataY = new Array(1)
        if (direction === 'x') {
            // 横线
            g.append('g')
                .selectAll('line')
                .data(dataY)
                .enter()
                .append('line')
                .attr('x1', scaleX(0))
                .attr('x2', this.width - this.scaleRight)
                .attr('y1', scaleY(yPos))
                .attr('y2', scaleY(yPos))
                .style('stroke-dasharray', '5,5') // dashed array for line
                .attr('stroke', stroke)
                .attr('stroke-width', strokeWidth)
        } else {
            // 竖线
            g.append('g')
                .selectAll('line')
                .data(dataX)
                .enter()
                .append('line')
                .attr('x1', scaleX(xPos))
                .attr('x2', scaleX(xPos))
                .attr('y1', 0)
                .attr('y2', height)
                .style('stroke-dasharray', '5,5') // dashed array for line
                .attr('stroke', stroke)
                .attr('stroke-width', strokeWidth)
        }
        this.svg.append(() => g.node())
        return g
    }

    /*
    * 绘制K线 蜡烛图
    * @options:
    *   data: 数据，默认为空，格式参考./data.js kLineJson
    *   riseColor: 涨颜色
    *   fallColor: 跌颜色
    *   flatColor: 平颜色
    *   strokeWidth: 线条宽度，默认1
    *   fill: 是否填充色
    *   crossStroke: 十字线颜色
    *   crossStrokeWidth: 十字线粗细,
    *   crossStrokeDasharray: 十字线虚线参数,
    *   className
    *   baseY: 上下留空的比例
    * */
    initKLine(options) {
        let {
            width = this.width,
            height = this.height,
            paddingInner = PADDING_INNER,
            data = [],
            riseColor = RISE_COLOR(),
            fallColor = FALL_COLOR(),
            fill = true,
            className = 'd3-kline'
        } = options || {}
        width = this.resolveWidth()
        // data = this.resolveData(data)
        const g = d3.create('svg:g').attr('class', className)
        const dataLen = data.length
        // x比例尺 分级
        const xScale = d3.scaleBand()
            .domain(d3.range(dataLen))
            .range([this.scaleWidth, width + this.scaleWidth])
            .paddingInner(paddingInner)
        const domainMinY = this.minKlineY || d3.min(data, d => d.low)
        const domainMaxY = this.maxKlineY || d3.max(data, d => d.high)
        const diffY = (domainMaxY - domainMinY) * this.baseY
        // y比例尺 线性
        const yScale = d3.scaleLinear()
            .domain([domainMinY - diffY, domainMaxY + diffY])
            .range([height, 0])
        // 初始化k线
        const initKItem = (d, i, xScale, yScale) => {
            const path = d3.create('svg:path')
            const startPrice = d.open // 开盘价
            const minPrice = d.low // 最低价
            const maxPrice = d.high // 最高价
            const endPrice = d.close // 收盘价
            // const orderNum = d[5] // 交易量
            // const orderSum = d[6] // 交易金额
            // 涨跌平颜色
            let color = ''
            if (endPrice > startPrice) {
                color = riseColor
            } else if (endPrice < startPrice) {
                color = fallColor
            } else if (endPrice === startPrice) {
                if (endPrice >= d.preClose) {
                    color = riseColor
                } else {
                    color = fallColor
                }
            }
            // 起始X坐标
            const startX = xScale(i)
            // 矩形宽度
            const rectWidth = xScale.bandwidth()
            // console.log(rectWidth)
            // X中位坐标
            const middleX = startX + 0.5 * rectWidth
            // 矩形的最高点
            const rectMax = yScale(d3.max([startPrice, endPrice]))
            // 矩形最低点
            const rectMin = yScale(d3.min([startPrice, endPrice]))
            // const rectHeight = rectMax - rectMin
            // 矩形路径
            const boxPoints = [
                [startX, rectMin],
                [startX + rectWidth, rectMin],
                [startX + rectWidth, rectMax],
                [startX, rectMax]
            ]
            // 上影线路径
            let topLinePoints = []
            // 下影线路径
            let bottomLinePoints = []
            if (minPrice < d3.min([startPrice, endPrice])) {
                bottomLinePoints = [
                    [middleX, rectMin],
                    [middleX, yScale(minPrice)]
                ]
            }
            if (maxPrice > d3.max([startPrice, endPrice])) {
                topLinePoints = [
                    [middleX, rectMax],
                    [middleX, yScale(maxPrice)]
                ]
            }
            // 处理path路径
            const dealPath = points => points.map((item, index) => {
                const prefix = index === 0 ? 'M' : 'L'
                return prefix + item.join(' ')
            }).join(' ') + ' Z'
            const pathD = [dealPath(boxPoints), dealPath(bottomLinePoints), dealPath(topLinePoints)].join(' ')
            path.attr('d', pathD)
                .style('fill', fill ? color : 'none')
                .style('stroke', color)
                .style('stroke-width', 1)
            return function() {
                return path.node()
            }
        }
        data.forEach((d, i) => {
            if (!d) {
                return
            }
            g.append(initKItem(d, i, xScale, yScale))
        })
        this.svg.append(() => g.node())
        return g
    }

    /*
    * 绘制坐标
    * @options:
    *   data: 数据，默认为空，格式参考./data.js scaleJson
    *   textLength: 文字长度
    *   fontSize: 字体大小
    *   width: 宽，默认为svg的宽
    *   height: 高，默认为svg的高
    *   color: 文字颜色
    *   position: x：横坐标，y：纵坐标，默认为x
    *   style: 自定义style
    *   bottomYOffset: 最下一个坐标的向下偏移量，控制样式美观
    *   className,
    *   fullWidth: position为x的时候使用，是否使用全屏宽度（从左侧空白处右边开始算）
    *   realScaleX: 是否使用真实的横坐标，为false则最后一个坐标右对齐
    * */
    initScale(options) {
        let {
            data = [],
            fontSize = 12,
            responseFontsize = false,
            width = this.width - this.scaleRight,
            height = this.height,
            color = FLAT_COLOR,
            position = 'x',
            style,
            startY = 0,
            minY = 0,
            maxY = 0,
            className = 'd3-scale',
            fullWidth = false,
            realScaleX = false
        } = options || {}
        const g = d3.create('svg:g').attr('class', className)
        style = `font-size:${fontSize}px;` + style
        const isX = position === 'x'
        if (isX) {
            width = fullWidth ? this.width : this.resolveWidth()
        }
        let textLen = 0
        // 轴
        const targets = g.selectAll()
            .data(data)
            .enter()
            .append('text')
            .attr('fill', d => d.color || color)
            .attr('text-anchor', 'start')
            .attr('font-size', d => {
                textLen = ((d.text || d.value) + '').length
                if (responseFontsize) {
                    if (textLen >= 8) {
                        return 9
                    }
                    if (textLen >= 6) {
                        return 10
                    }
                }
                return fontSize
            })
            .text(d => d.text || d.value)
        let test
        if (this.scaleRight > 0) {
            test = g.selectAll()
                .data(data)
                .enter()
                .append('text')
                .attr('fill', d => d.color || color)
                .attr('text-anchor', 'start')
                .text(d => d.percent)
        }
        if (isX) {
            let r
            let totalCount = 0
            let middleWidth = 0
            let middleTime = 0
            let unitWidth = 0
            const dataLen = data.length
            if (dataLen === 3) {
                const firstTime = new Date(`2021/01/01 ${data[0].value}`)
                const lastTime = new Date(`2021/01/01 ${data[2].value}`)
                totalCount = lastTime - firstTime

                middleTime = data[1].value.split('/')
                if (middleTime.length === 2) {
                    totalCount -= new Date(`2021/01/01 ${middleTime[1]}`) - new Date(`2021/01/01 ${middleTime[0]}`)
                }
                const middleCount = new Date(`2021/01/01 ${middleTime[0]}`) - firstTime

                middleWidth = (middleCount / totalCount) * (this.width - this.scaleRight - this.scaleWidth)
            } else {
                unitWidth = (this.width - this.scaleRight - this.scaleWidth) / dataLen
            }

            targets.attr('x', (d, i) => {
                if (i === 0) {
                    r = this.scaleWidth
                } else if (i === data.length - 1 && !realScaleX) {
                    r = this.width - this.scaleRight
                } else if (i > 0) {
                    if (dataLen <= 3) {
                        // 30 差不多是 11:30/13:00 显示文本长度的一半
                        // 15 差不多是 12:45 显示文本长度的一半
                        r = middleWidth + this.scaleWidth - (middleTime.length === 2 ? 30 : 15)
                    } else {
                        r = unitWidth * i + unitWidth / 2 + this.scaleWidth - 15
                    }
                }
                return r
            })
                .attr('y', height - 4)
                .attr('text-anchor', (d, i) => {
                    if (i === 0) {
                        return 'start'
                    }
                    if (i === data.length - 1 && !realScaleX) {
                        return 'end'
                    }
                    return 'start'
                })
        } else {
            const min = minY || d3.min(data, d => d.value)
            const max = maxY || d3.max(data, d => d.value)

            // 处理最大值最小值都是0，导致y轴文本重叠问题
            let allZeroFlag = data.every(d => +d.value === 0)
            let len = data.length
            let count = 0
            // 比例尺
            const scale = d3.scaleLinear()
                .domain([min, max])
                .range([height, startY])
            targets.attr('y', d => {
                // 最下一个坐标的向下偏移量，为了样式美观
                const r = scale(d.value) - fontSize
                // 隐藏NAN显示
                if (isNaN(r)) {
                    return -999
                }
                count++
                if (allZeroFlag && count < len) {
                    return -999
                }
                if (r <= startY) {
                    return fontSize + startY
                }
                return r + fontSize
            })
                .attr('x', this.scaleWidth - 6)
                .attr('text-anchor', 'end')
            test && test.attr('y', d => {
                // 最下一个坐标的向下偏移量，为了样式美观
                const r = scale(d.value) - fontSize
                // 隐藏NAN显示
                if (isNaN(r)) {
                    return -999
                }
                count++
                if (allZeroFlag && count < len) {
                    return -999
                }
                if (r <= 0) {
                    return fontSize
                }
                return r + fontSize
            })
                .attr('x', width + this.scaleRight)
                .attr('text-anchor', 'end')
        }
        if (style) {
            g.attr('style', style)
        }
        this.svg.append(() => g.node())
        return g
    }

    /*
    * 绘制折线
    * @options:
    *   data: 数据，默认为空，格式参考./data.js lineJson
    *   strokeWidth: 折线粗细
    *   stroke: 折线颜色
    *   width: 宽，默认为svg的宽
    *   height: 高，默认为svg的高
    *   strokeDasharray: 虚线参数
    *   background: 背景色填充
    *       数组类型 [rgba1, rgba2]：渐变色
    *       字符串类型：普通颜色
    *   className
    * */
    initLine(options) {
        let {
            width = this.width,
            height = this.height,
            data = [],
            strokeWidth = 1,
            stroke = 'yellow',
            maxY = 0,
            minY = 0,
            startY = 0,
            strokeDasharray = 'none',
            style = '',
            preClose = null, // 分时图 昨收
            paddingInner = PADDING_INNER,
            background = null,
            className = 'd3-line'
        } = options
        width = this.resolveWidth()
        const g = d3.create('svg:g').attr('class', className)
        const path = d3.create('svg:path')
        const domainMaxY = maxY || d3.max(data, d => d)
        const domainMinY = minY || d3.min(data, d => d)
        // TODO 怎么居中
        const diffY = (domainMaxY - domainMinY) * this.baseY
        const scaleX = d3.scaleBand().domain(d3.range(data.length)).range([this.scaleWidth, this.scaleWidth + width]).paddingInner(paddingInner)
        const scaleY = d3.scaleLinear().domain([domainMinY - diffY, domainMaxY + diffY]).range([height, startY])
        // console.log(scaleX.bandwidth(), scaleX.paddingInner(), scaleX.step())
        // X数据有个偏移  因为十字线是往k线中心定位的
        const offsetX = scaleX.bandwidth() / 2
        let m = 0
        const pathD = data.map((d, i) => {
            // 刚开始为0的则不画
            if (!d && m === i) {
                m = i + 1
                return ''
            }
            let x = scaleX(i) + offsetX
            const y = scaleY(d)
            if (i === 0) {
                x = this.scaleWidth
            }
            if (i === data.length - 1) {
                x = width + this.scaleWidth
            }
            const ps = [[x, y]]

            return (i === m ? 'M' : 'L') + ps.map(p => p.join(' ')).join(' ')
        }).join(' ')
        path
            .attr('stroke-width', strokeWidth)
            .attr('stroke', stroke)
            .attr('d', pathD)
            .attr('fill', 'none')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-dasharray', strokeDasharray)
        // 底部阴影面积
        if (background) {
            const isGradient = Array.isArray(background)
            let pathS = pathD.replace('M', 'L')
            pathS = 'M' + this.scaleWidth + ` ${this.height} ` + pathS + 'L ' + (width + this.scaleWidth) + ` ${this.height} Z`
            const pathShadow = d3.create('svg:path')
                .attr('class', 'line-shadow')
                .attr('stroke-width', 0.1)
                .attr('stroke', 'transparent')
                .attr('d', pathS)
                .attr('stroke-linejoin', 'round')
                .attr('stroke-linecap', 'round')
                .attr('stroke-dasharray', strokeDasharray)
                .attr('style', style)
            if (isGradient) {
                const defs = d3.create('svg:defs')
                const id = 'linear_id'
                const linearGradient = d3.create('svg:linearGradient')
                    .attr('id', id)
                    .attr('x1', '0%')
                    .attr('y1', '0%')
                    .attr('x2', '0%')
                    .attr('y2', '100%')
                background.forEach((backColor, i) => {
                    const stop = d3.create('svg:stop')
                        .attr('offset', i === 0 ? '0%' : '100%')
                        .attr('style', `stop-color:${backColor};stop-opacity:1;`)
                    linearGradient.append(() => stop.node())
                })
                defs.append(() => linearGradient.node())
                g.append(() => defs.node())
                pathShadow.attr('fill', `url(#${id})`)
            } else {
                pathShadow.attr('fill', background)
            }
            g.append(() => pathShadow.node())
            g.append('line')
                .attr('x1', scaleX(0))
                .attr('x2', this.width - this.scaleRight)
                .attr('y1', scaleY(preClose))
                .attr('y2', scaleY(preClose))
                .style('stroke-dasharray', '5,5') // dashed array for line
                .style('stroke', FLAT_COLOR)
        }
        g.attr('style', style)
        g.append(() => path.node())
        this.svg.append(() => g.node())
        return g
    }

    /*
    * 绘制SAR小圆圈线
    * @options:
    *   data: 数据，默认为空，格式参考./data.js kLineJson
    *   riseColor: 涨颜色
    *   fallColor: 跌颜色
    *   flatColor: 平颜色
    *   strokeWidth: 线条宽度，默认1
    *   className
    *   baseY: 上下留空的比例
    * */
    initCircles(options) {
        let {
            width = this.width,
            height = this.height,
            paddingInner = PADDING_INNER,
            data = [],
            strokeWidth = 1,
            klineData = [],
            // riseColor = RISE_COLOR(),
            // fallColor = FALL_COLOR(),
            // flatColor = FLAT_COLOR,
            maxY = 0,
            minY = 0,
            startY = 0,
            className = 'd3-circles',
            baseY = 0
        } = options || {}
        width = this.resolveWidth()
        // data = this.resolveData(data)
        const g = d3.create('svg:g').attr('class', className)
        const dataLen = data.length
        // x比例尺 分级
        const xScale = d3.scaleBand()
            .domain(d3.range(dataLen))
            .range([this.scaleWidth, width + this.scaleWidth])
            .paddingInner(paddingInner)
        const domainMaxY = maxY || d3.max(data, d => d)
        const domainMinY = minY || d3.min(data, d => d)
        const diffY = (domainMaxY - domainMinY) * baseY
        // y比例尺 线性
        const yScale = d3.scaleLinear()
            .domain([domainMinY - diffY, domainMaxY + diffY])
            .range([height, startY])
        // 初始化k线
        const initCircle = (d, i, xScale, yScale) => {
            const r = xScale.bandwidth() // 圆圈半径
            const cx = xScale(i)
            const cy = yScale(d)
            const color = klineData[i].low < d ? FALL_COLOR() : RISE_COLOR()
            const path = d3.create('svg:circle')
                .attr('stroke-width', strokeWidth)
                .attr('r', r / 2)
                .attr('cx', cx + r / 2)
                .attr('cy', cy)
                .attr('fill', 'none')
                .style('stroke', color)
            return function() {
                return path.node()
            }
        }
        data.forEach((d, i) => {
            if (!d) {
                return
            }
            g.append(initCircle(d, i, xScale, yScale))
        })
        this.svg.append(() => g.node())
        return g
    }

    /*
    * 绘制柱状图
    * @options:
    *   data: 数据，默认为空，支持每个item自定义颜色，格式参考./data.js kLineJson
    *   strokeWidth: 折线粗细
    *   stroke: 折线颜色
    *   width: 宽，默认为svg的宽
    *   height: 高，默认为svg的高,
    *   fill: 是否填充
    *   baseYMin: Y轴的最小值比例
    *   baseYMax：Y轴的最大值比例
    *   showText: 是否自动展示文本,
    *   fontSize: 文字字体大小
    *   textLength：文字长度
    *   textColor：文字颜色
    *   textYPadding：文字距离柱状图顶部的间距
    *   className
    *   scattered: 交错模式，负值绘制在基线下面，指标用，默认false
    *   itemWidth: 柱的宽度比例，默认0.1
    * */
    initBar(options) {
        // const { width = this.width, height = this.height, data = [], strokeWidth = 1, riseColor = RISE_COLOR(), fallColor = FALL_COLOR(), flatColor = FLAT_COLOR, fill = true } = options || {}
        let {
            width = this.width,
            height = this.height,
            data = [],
            strokeWidth = 1,
            stroke = RISE_COLOR(),
            paddingInner = PADDING_INNER,
            fill = true,
            minY,
            maxY,
            baseY = 0,
            style = '',
            showText = false,
            fontSize = 5,
            textColor = '#fff',
            textYPadding = 2,
            className = 'd3-bar',
            itemWidth = 1
            // scattered = false
        } = options || {}
        width = this.resolveWidth()
        // data = this.resolveData(data)
        const g = d3.create('svg:g').attr('class', className)
        const dataLength = data.length
        const dataYMin = minY || d3.min(data, d => d.value)
        const dataYMax = maxY || d3.max(data, d => d.value)
        const maxDomainY = dataYMax * (dataYMax > 0 ? (1 + baseY) : baseY)
        const minDomainY = dataYMin * (dataYMin > 0 ? baseY : (1 + baseY))
        // X比例尺
        const xScale = d3.scaleBand().domain(d3.range(dataLength)).range([this.scaleWidth, width + this.scaleWidth]).paddingInner(paddingInner)
        const domainY = [minDomainY, maxDomainY]
        // baseYMax 和 baseYMin 是为了扩大Y轴的范围，可配
        const yScale = d3.scaleLinear().domain(domainY).range([height, 0])
        function initItem(d, i, xScale, yScale) {
            const g = d3.create('svg:g')
            const path = d3.create('svg:path')
            // 柱状宽度 居中
            const bandWidth = xScale.bandwidth()
            // console.log(scattered)
            const color = d.color || stroke
            // const yMax = yScale(maxDomainY)
            const y = yScale(d.value)
            const x1 = xScale(i) + bandWidth * (0.5 - itemWidth / 2)
            const y1 = yScale(0)
            const x2 = x1 + bandWidth * (0.5 + itemWidth / 2)
            let y2
            // if (scattered && color === FALL_COLOR()) {
            //     y2 = yMax + (yMax - y)
            // } else {
            //     y2 = y
            // }
            y2 = y
            const points = [
                [x1, y1], // 左下
                [x1, y2], // 左上
                [x2, y2], // 右上
                [x2, y1] // 右下
            ]
            const pathD = points.map((item, index) => (index === 0 ? 'M' : 'L') + item.join(' ')).join(' ') + ' Z'
            path.attr('d', pathD).attr('stroke', color).attr('stroke-width', strokeWidth).attr('fill', fill ? color : 'none')
            g.append(() => path.node())
            if (showText) {
                const text = d3.create('svg:text')
                    .text(d.value)
                    .attr('fill', textColor)
                    .attr('text-anchor', 'start')
                    .attr('font-size', fontSize)
                    // .attr('textLength', textLength)
                    .attr('lengthAdjust', 'spacingAndGlyphs')
                    .attr('x', x1)
                    .attr('y', y2 - textYPadding)
                g.append(() => text.node())
            }
            return () => g.node()
        }
        data.forEach((d, i) => {
            g.append(initItem(d, i, xScale, yScale))
        })
        if (style) {
            g.attr('style', style)
        }
        this.svg.append(() => g.node())
        return g
    }
    // 隐藏元素
    hide(options) {
        const { selector } = options
        d3.selectAll(selector).style('visibility', 'hidden')
    }
    // 显示元素
    show(options) {
        const { selector } = options
        d3.selectAll(selector).style('visibility', 'visible')
    }
    // 移除十字线
    clearCross(options) {
        const { className = 'cross' } = options || {}
        d3.selectAll(`.${className}`).remove()
    }
    /*
    * 设置十字线
    * @options:
    *   data: 显示的时候坐标数据
    *   width: 宽，默认为svg的宽
    *   height: 高，默认为svg的高,
    *   stroke: 颜色
    *   strokeWidth: 宽度
    *   strokeDasharray：虚线参数
    *   className: 如有多个，需要自定义设置cross的class避免重复,
    *   targetSelector: 目标选择器，可以自定义需要监听图表
    *   textColor
    *   textBackground
    *   paddingInner
    *   pointFill: 定位圓顏色
    *   pointR: 定位圓半徑
    *   showPoint: 是否展示定位圓，默認false不展示
    *   kLineData: k线的总数据，用于光标选中时动态显示当前选中时刻的股价信息
    *   cb: 十字线变化/显示时的回调，两个参数：
    *       @param1: selectedData  选中的数据
    *       @param2: point  定位点位
    *   hideCb: 十字线隐藏时的回调,无参数
    * */
    initCross(options) {
        let {
            data = null,
            width = this.width,
            height = this.height,
            stroke = '#979797',
            strokeWidth = '1',
            strokeDasharray = '1,2',
            className = 'd3-cross',
            targetSelector = '',
            cb = null,
            preClose,
            startY = 0,
            fontSize = 8,
            textColor = '#1a1a1a',
            paddingInner = PADDING_INNER,
            pointFill = 'rgba(11, 192, 241, 1)',
            pointR = 2.5,
            showPoint = false,
            kLineData = [],
            hideCb = null,
            mousemoveCb = null
        } = options || {}
        if (!data) {
            return
        }
        width = this.resolveWidth()
        // 设置监听区域
        let area = this.svg
        let cross = d3.select(`.${className}`)
        const crossLineClassName = `${className}-line` // 十字线
        const crossTextClassName = `${className}-text` // 鼠标当前位置左侧纵坐标 `价格` 与底部横坐标 `日期` 提示文本
        const crossPointClassName = `${className}-point` // 蓝点
        const crossChgClassName = `${className}-chg` // 鼠标当前位置右侧纵坐标 `涨跌幅` 提示文本
        const crossChgRectClassName = `${className}-chg-rect`
        let crossText = d3.select(`.${crossTextClassName}`)
        let crossPoint = d3.select(`.${crossPointClassName}`)
        let crossLine = d3.select(`.${crossLineClassName}`)
        let chgRect = d3.select(`.${crossChgRectClassName}`)
        let crossChg = d3.select(`.${crossChgClassName}`) // 涨跌幅
        let getScale,
            scaleXList,
            scaleYList
        const dataX = data.x
        const dataY = data.y
        if (targetSelector) {
            // 自定义监听区域
            area = d3.select(targetSelector)
        }
        // X轴一般是日期，是升序的
        scaleXList = dataX.map(d => {
            // 控制精度
            const domain = [this.scaleWidth, width + this.scaleWidth]
            const base = 10
            const scale = d3.scaleLinear().domain(domain).range([0, (d.data.length - 1) * base])
            const scaleBand = d3.scaleBand().domain(d3.range(d.data.length)).range(domain).paddingInner(paddingInner)
            const bandWidth = scaleBand.bandwidth()
            const itemWidth = scaleBand.step()
            // TODO 这个scale的计算有误差，导致准星定位不准确，待解决
            const compute = p => (scale(p) / base).toFixed(0)
            const scaleWidth = this.scaleWidth
            // 这里无法invert映射band类型，手动写一个映射关系
            return Object.assign({}, d, {
                getIndex: function(p) {
                    return compute(p)
                },
                scale: function(p) {
                    return d.data[compute(p)]
                },
                middle: function(p) {
                    return compute(p) * itemWidth + bandWidth / 2 + scaleWidth
                }
            })
        }, [])
        // Y轴
        scaleYList = dataY.map(d => {
            const min = d3.min(d.data)
            const max = d3.max(d.data)
            const baseY = d.baseY === undefined ? this.baseY : d.baseY
            const diff = (max - min) * baseY
            // y轴
            return Object.assign({}, d, {
                scale: d3.scaleLinear().domain([max + diff, min - diff]).range([d.start, d.end])
            })
        })
        // 根据鼠标位置获取对应的坐标系
        getScale = (position, scaleList) => scaleList.find(item => {
            return item.start <= position && item.end >= position
        })
        const renderCross = e => {
            if (!this.crossVisible) {
                return
            }
            const pointer = d3.pointer(e)
            const x = pointer[0]
            const y = pointer[1]
            const scaleXObj = getScale(x, scaleXList)
            const scaleYObj = getScale(y, scaleYList)
            // 判断当前鼠标在分时坐标上
            const isLine = scaleYList[0].start < y && scaleYList[0].end >= y
            if (!scaleXObj || !scaleYObj) {
                return
            }
            // 是否在分时范围内
            if (x < this.scaleWidth || y < startY || x > width + this.scaleWidth || y > height) {
                return
            }
            const scaleX = scaleXObj.scale
            const scaleY = scaleYObj.scale
            const middleX = scaleXObj.middle(x)
            const crossPointsX = [
                [this.scaleWidth, y],
                [this.width - this.scaleRight, y]
            ]
            const crossPointsY = [
                [middleX, startY],
                [middleX, height]
            ]
            const points = [crossPointsX, crossPointsY]
            // 画十字线
            if (crossLine.empty()) {
                crossLine = d3.create('svg:g').attr('class', crossLineClassName)
                points.forEach(d => {
                    const line = d3.create('svg:line')
                        .attr('x1', d[0][0])
                        .attr('y1', d[0][1])
                        .attr('x2', d[1][0])
                        .attr('y2', d[1][1])
                        .attr('stroke', stroke)
                        .attr('stroke-width', strokeWidth)
                        .attr('stroke-dasharray', strokeDasharray)
                    crossLine.append(() => line.node())
                })
            } else {
                crossLine.selectChildren(function(child, i) {
                    const d = points[i]
                    d3.select(child)
                        .attr('x1', d[0][0])
                        .attr('y1', d[0][1])
                        .attr('x2', d[1][0])
                        .attr('y2', d[1][1])
                })
            }
            // scaleY.invert(y): 根据在 range 中的值 y，得到 domain 中对应的值
            let textY = Math.floor(scaleY.invert(y) * 1000) / 1000
            if (scaleYObj.formatBigNumber) {
                textY = scaleYObj.formatBigNumber(textY)
            }
            const textX = scaleX(x)
            if (!textX) return
            // text 矩形的x边距
            const rectXPadding = 4
            // text 矩形的y边距
            const rectYPadding = 2
            const textPoints = [
                [middleX, height - rectYPadding, textX, 'middle'], // X 坐标text和rect的配置：[x 位置，y位置，文本，文本布局位置]
                [rectXPadding, y, textY, 'end'] // Y 坐标text和rect 的配置：[x 位置，y位置，文本，文本布局位置]
            ]
            // 鼠标当前位置左侧纵坐标 `价格` 与底部横坐标 `日期` 提示文本
            if (crossText.empty()) {
                crossText = d3.create('svg:g').attr('class', crossTextClassName)
                textPoints.forEach(d => {
                    const text = d3.create('svg:text')
                        .attr('lengthAdjust', 'spacingAndGlyphs')
                        .attr('text-anchor', d[3])
                        .attr('fill', textColor)
                        .attr('font-size', fontSize)
                        .attr('class', 'text')
                    const rect = d3.create('svg:rect')
                        .attr('style', `fill:#ebebeb;transform:translateY(-${fontSize - 2}px);`)
                        .attr('height', fontSize + rectYPadding * 2)
                        .attr('rx', 1)
                        .attr('ry', 1)
                    crossText.append(() => rect.node())
                    crossText.append(() => text.node())
                })
            }
            crossText.selectChildren((child, i) => {
                const selection = d3.select(child)
                // 这里可选到 child 有x坐标的 rect 和 text，序号为 0 和 1
                // 还有y坐标的 rect 和 text，序号为 2 和 3
                // 所以 i <= 1 的表示 X 坐标，设置 index 为 0
                // 所以 i > 1 的表示 Y 坐标，设置 index 为 1
                // 而后使用 index ，在 textPoints 中，取相应设置的值
                const index = i > 1 ? 1 : 0
                let xPos = textPoints[index][0]
                let yPos = textPoints[index][1]
                const text = textPoints[index][2]
                const textLength = text.toString().length * fontSize / 2
                // 十字坐标系宽
                let rectWidth = textLength + rectXPadding * 2
                if (index === 1) { // Y轴的 rect
                    rectWidth = this.scaleWidth
                }
                // text外围的矩形
                if (selection.filter('text').empty()) {
                    if (index === 0) { // X轴的 rect
                        xPos = xPos - rectWidth / 2
                    }
                    if (xPos + textLength >= this.width + this.scaleRight) {
                        xPos = this.width - textLength - rectXPadding + this.scaleRight
                    }
                    if (yPos - fontSize <= 0) {
                        yPos = fontSize
                    }
                    selection
                        .attr('x', xPos - rectXPadding)
                        .attr('y', yPos)
                        .attr('width', rectWidth)
                } else {
                    // text文本
                    // 纠正文本溢出
                    if (index === 1) { // Y 轴的 text
                        xPos = this.scaleWidth - 4
                    }
                    if (xPos + textLength >= this.width + this.scaleRight + rectWidth / 2) {
                        xPos = this.width - textLength - rectXPadding + this.scaleRight + rectWidth / 2
                    }
                    yPos += rectYPadding // 此处文本需要和矩形设置上边距
                    if (yPos - fontSize <= 0) {
                        yPos = fontSize + rectYPadding
                    }
                    selection
                        .attr('x', xPos - rectXPadding)
                        .attr('y', yPos)
                        .text(text)
                        .attr('textLength', textLength)
                }
            })
            // 选中的数据的下标
            const selectedIndex = scaleXObj.getIndex(x)
            // 涨跌幅坐标选中显示 条件是分时图的时候
            if (this.scaleRight > 0 && showPoint && !!kLineData[selectedIndex] && isLine) {
                // 画十字线选中的K线的点
                if (chgRect.empty()) {
                    chgRect = d3.create('svg:rect').attr('class', `${crossChgRectClassName}`)
                        .attr('style', `fill:#ebebeb;transform:translateY(-${fontSize - 2}px);`)
                        .attr('height', fontSize + rectYPadding * 2)
                    crossChg = d3.create('svg:text').attr('class', `${crossChgClassName}`)
                        .attr('lengthAdjust', 'spacingAndGlyphs')
                        .attr('fill', textColor)
                        .attr('font-size', fontSize)
                        .attr('text-anchor', 'end')
                }
                const text = (((textY - preClose) / preClose) * 100).toFixed(2)

                let chgRectY = crossPointsX[0][1] - rectYPadding
                if (chgRectY - fontSize <= 0) {
                    chgRectY = fontSize
                }
                let chgTextY = crossPointsX[0][1]
                if (chgTextY - fontSize <= 0) {
                    chgTextY = fontSize + rectYPadding
                }
                chgRect
                    .attr('x', this.width - this.scaleRight)
                    .attr('y', chgRectY)
                    .attr('width', this.scaleRight + rectXPadding)
                crossChg
                    .attr('x', this.width)
                    .attr('y', chgTextY)
                    .text(text + '%')
                cross.append(() => chgRect.node())
                cross.append(() => crossChg.node())
            } else {
                !crossChg.empty() && crossChg.remove()
                !chgRect.empty() && chgRect.remove()
            }
            if (showPoint && !!kLineData[selectedIndex]) {
                // 画十字线选中的K线的点
                if (crossPoint.empty()) {
                    crossPoint = d3.create('svg:circle').attr('class', crossPointClassName)
                        .attr('stroke', 'transparent')
                        .attr('stroke-width', '0')
                        .attr('fill', pointFill)
                        .attr('r', pointR)
                }
                crossPoint
                    .attr('cx', middleX)
                    // 当showPoint为true时，取relateKey的字段来定义point的纵坐标
                    // 这里dataX默认长度为1，如果长度大于一这样的写法是不支持的
                    .attr('cy', scaleYList[0].scale(kLineData[selectedIndex][dataX[0].relateKey]))
            } else {
                !crossPoint.empty() && crossPoint.remove()
            }
            if (cross.empty()) {
                cross = d3.create('svg:g').attr('class', className)
                cross.append(() => crossLine.node())
                cross.append(() => crossText.node())
                this.svg.append(() => cross.node())
            }
            if (showPoint && !!kLineData[selectedIndex]) {
                cross.append(() => crossPoint.node())
            }
            this.show({
                selector: `.${className}`
            })
            if (cb) {
                cb(kLineData[selectedIndex], pointer, selectedIndex)
            }
        }
        // 设置鼠标移上去十字虚线的效果
        area.on('mousemove', e => {
            if (this.mouseDownStartX !== null) {
                if (this.calculateMouseX === null) {
                    this.calculateMouseX = this.mouseDownStartX
                }
                const x = d3.pointer(e)[0]
                const moveV = x - this.calculateMouseX
                const absMoveV = Math.abs(moveV)
                this.calculateMouseX = x

                let direction = 1 // 1：左移动 2：右移动
                if (absMoveV > 1) {
                    if (moveV < -1) {
                        direction = 1
                    } else if (moveV > 1) {
                        direction = 2
                    }
                    mousemoveCb && mousemoveCb(direction)
                }
            }
            renderCross(e)
        })
        area.on('mouseout', e => {
            // 解决mouseout在子元素也生效的问题
            if (area._groups[0][0] === e.toElement || area._groups[0][0].contains(e.toElement)) return

            this.hide({
                selector: `.${className}`
            })
            hideCb && hideCb()
        })
        this.svg.on('click', e => {
            if (this.crossVisible) {
                this.crossVisible = false
                this.hide({
                    selector: `.${className}`
                })
                hideCb && hideCb()
            } else {
                this.crossVisible = true
                renderCross(e)
                this.show({
                    selector: `.${className}`
                })
            }
        })
        this.svg.on('mousedown', e => {
            this.mouseDownStartX = d3.pointer(e)[0]
        })
        this.svg.on('mouseup', () => {
            this.calculateMouseX = null
            this.mouseDownStartX = null
        })
        return cross
    }
    /*
    * 设置文本
    * @options:
    *   data: 设置文本的数据，格式为[{label: '', value: '', color: ''}]
    *   fontSize: 字体大小
    *   className
    * */
    initText(options) {
        let { data = [], fontSize = 12, className = 'd3-text', style } = options || {}
        const g = d3.create('svg:g').attr('class', className)
        let padLeft = 6
        data.forEach(d => {
            const t = `${d.label}${d.value}`
            const textLength = t.length * fontSize / 2 + 20
            const text = d3.create('svg:text')
                .text(t)
                .attr('fill', d.color)
                .attr('text-anchor', 'start')
                .attr('font-size', fontSize)
                // .attr('textLength', textLength)
                .attr('lengthAdjust', 'spacingAndGlyphs')
                .attr('x', padLeft)
            padLeft += textLength
            g.append(() => text.node())
        })
        if (style) {
            g.attr('style', style)
        }
        this.svg.append(() => g.node())
    }
    /*
    * 买卖点
    * @options:
    *   width: 宽，默认为svg的宽
    *   height: 高，默认为svg的高
    *   data: 买卖点数据
    *   klineData: K 线数据
    *   fontSize: 字体大小
    *   paddingInner: 内边距
    *   className: 类名
    *   buyColor: 买入标志颜色
    *   sellColor: 卖出标志颜色
    *   baseY： 上下留空的比例
    * */
    initBuySoldPoint(options) {
        let {
            width = this.width,
            height = this.height,
            data = [],
            klineData = [],
            fontSize = 12,
            paddingInner = PADDING_INNER,
            className = 'd3-buy-sell-flag',
            buyColor = BUY_COLOR,
            sellColor = SELL_COLOR,
            tColor = T_COLOR,
            baseY = 0
        } = options || {}
        const g = d3.create('svg:g').attr('class', className)

        // x 比例尺 分级
        width = this.resolveWidth()
        const klineDataLen = klineData.length
        const xScale = d3.scaleBand()
            .domain(d3.range(klineDataLen))
            .range([this.scaleWidth, this.scaleWidth + width])
            .paddingInner(paddingInner)

        // y 比例尺 分级
        const domainMinY = d3.min(klineData, d => d.low)
        const domainMaxY = d3.max(klineData, d => d.high)
        const diffY = (domainMaxY - domainMinY) * baseY
        const yScale = d3.scaleLinear()
            .domain([domainMinY - diffY, domainMaxY + diffY])
            .range([height, 0])

        // console.log('klineData :>> ', klineData)
        let resolveData = []
        // 筛选K线数据，时间段之内的买卖点数据
        data.forEach(d => {
            let idx = klineData.findIndex(kd => {
                return kd.latestTime === +d.latestTime
            })
            if (idx > -1) {
                d.idx = idx
                resolveData.push(d)
            }
        })
        console.log('resolveData :>> ', resolveData)
        let flagMap = {
            buy: 1,
            sold: 2,
            t: 3
        }
        // 初始化
        const reactWidth = 12
        const dis = -(reactWidth - xScale.bandwidth()) / 2 // 取 "-(买卖点宽度-每个柱状图的宽度) 除 2" 得到买卖点跟柱状图的居中位置的位移距离
        const initBSItem = (d, xScale, yScale) => {
            // <rect x='1' y='1' width='198' height='118' fill='#cccccc' />
            // <text fill='#FFFFFF' stroke='red' font-size='45' font-family='Verdana' x='66' y='76'>SVG</text>
            // 背景块
            const rect = d3.create('svg:rect')
            // 文本
            const text = d3.create('svg:text')
            // const startPrice = d.isBuy ? klineData[d.idx].high : klineData[d.idx].high + 10
            const startPrice = klineData[d.idx].high
            // 起始 X 坐标
            const startX = xScale(d.idx) + dis
            // 起始 Y 坐标
            const startY = yScale(startPrice) - 25

            let opColorMap = {
                [flagMap.buy]: buyColor,
                [flagMap.sold]: sellColor,
                [flagMap.t]: tColor
            }
            const color = opColorMap[d.operateFlag]

            let opTextMap = {
                [flagMap.buy]: 'B',
                [flagMap.sold]: 'S',
                [flagMap.t]: 'T'
            }
            const opText = opTextMap[d.operateFlag]

            rect.attr('x', startX)
                .attr('y', startY)
                .attr('width', reactWidth)
                .attr('height', 16)
                .attr('fill', color)
            text.attr('x', startX + 2.5)
                .attr('y', startY + reactWidth)
                .attr('font-size', fontSize)
                .attr('font-family', 'SFUIDisplay-Regular, SFUIDisplay')
                .attr('stroke', '#fff')
                .attr('fill', '#fff')
                .text(opText)

            return [
                function() {
                    return rect.node()
                },
                function() {
                    return text.node()
                }
            ]
        }
        resolveData.forEach((d) => {
            if (!d) {
                return
            }
            // 做T
            if (d.bought && d.sold) {
                d.operateFlag = flagMap.t
                g.append(initBSItem(d, xScale, yScale)[0])
                g.append(initBSItem(d, xScale, yScale)[1])
                return
            }
            // 买点
            if (d.bought) {
                d.operateFlag = flagMap.buy
                g.append(initBSItem(d, xScale, yScale)[0])
                g.append(initBSItem(d, xScale, yScale)[1])
                return
            }
            // 卖点
            if (d.sold) {
                d.operateFlag = flagMap.sold
                g.append(initBSItem(d, xScale, yScale)[0])
                g.append(initBSItem(d, xScale, yScale)[1])
            }
        })
        this.svg.append(() => g.node())
        return g
    }
    destroy() {
        this.svg.remove()
    }
    remove(selector) {
        // console.log('remove', selector, d3.select(selector))
        const target = d3.select(selector)
        if (target && !target.empty()) {
            d3.select(selector).remove()
        }
    }
    removeAll() {
        // g标签中，只要类名里面不包括 “chart-grid” 的都要删除
        d3.select('svg').selectChildren('g:not([class*=chart-grid])').remove()
    }
    // 初始化滚轮事件
    // cb: 必传，一个参数isUp判断是向上滚轮还是向下滚轮
    initMouseScroll(option) {
        const { cb } = option || {}
        let width = this.resolveWidth()
        let percent = 0
        this.svg.on('mousewheel', e => {
            // e.stopPropagation()
            // console.log(e)
            // console.log('width :>> ', width)
            percent = e.layerX / (width - 92)
            // console.log('percent :>> ', percent)
            cb && cb(e.wheelDeltaY > 0, percent)
            // if (e.wheelDeltaY > 0) {
            //     console.log('up')
            // } else {
            //     console.log('down')
            // }
        })
    }
}
