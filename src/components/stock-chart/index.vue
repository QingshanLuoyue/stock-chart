<template lang="pug">
    .stock-chart
        .header
            .header-title(v-if="!hideTitle && stock")
                slot(name="header-left")
                .info-wrap(
                    :class="{'color-rise': stockGroupData.pctchng > 0, 'color-fall': stockGroupData.pctchng < 0, 'color-flat': stockGroupData.pctchng === 0}"
                )
                    .symbol {{stockGroupData.symbol}}
                    .name {{stockGroupData.name}}
                    .price {{latestPrice | formatStockPrice}}
                    span.iconfont(:class='{rose:  stockGroupData.pctchng > 0,iconup:  stockGroupData.pctchng > 0,icondown:  stockGroupData.pctchng < 0, fall:  stockGroupData.pctchng < 0}')
                    .range {{netchng | formatStockPrice}}
                    .range(v-if="stockGroupData.pctchng") {{stockGroupData.pctchng / 100}}%
                slot(name="header-right")
            .option
                ul
                    li(:class="{active: activeType === KLineType.TIME_SHARING}"
                        @click="setActive(KLineType.TIME_SHARING, 'type', 'click')") {{$t('分时')}}
                    li(:class="{active: activeType === KLineType.TIME_SHARING_DAY5}"
                        @click="setActive(KLineType.TIME_SHARING_DAY5, 'type', 'click')") {{$t('5日')}}
                    li(:class="{active: activeType === KLineType.KT_DAY}"
                        @click="setActive(KLineType.KT_DAY, 'type', 'click')") {{$t('日K')}}
                    li(:class="{active: activeType === KLineType.KT_WEEK}"
                        @click="setActive(KLineType.KT_WEEK, 'type', 'click')") {{$t('周K')}}
                    li(:class="{active: activeType === KLineType.KT_MONTH}"
                        @click="setActive(KLineType.KT_MONTH, 'type', 'click')") {{$t('月K')}}
                    li(:class="{active: activeType === KLineType.KT_MNT3}"
                        @click="setActive(KLineType.KT_MNT3, 'type', 'click')") 季K
                    li(:class="{active: activeType === KLineType.KT_MNT12}"
                        @click="setActive(KLineType.KT_MNT12, 'type', 'click')") {{$t('年K')}}
                    li.more(@click.stop="more" :class="{active: moreTypeText !== $t('1分') || activeType === KLineType.KT_MIN1}")
                        span {{moreTypeText}}
                        //- img.down(src="@/renderer/assets/images/down-chartType.png")
                        .expand-wrap(v-show="showMoreType")
                            .expand-item(
                                :class="{active: activeType === KLineType.KT_MIN1}"
                                @click.stop="setActive(KLineType.KT_MIN1, 'type', 'click')") {{$t('1分')}}
                            .expand-item(
                                :class="{active: activeType === KLineType.KT_MIN5}"
                                @click.stop="setActive(KLineType.KT_MIN5, 'type', 'click')") {{$t('5分')}}
                            .expand-item(
                                :class="{active: activeType === KLineType.KT_MIN15}"
                                @click.stop="setActive(KLineType.KT_MIN15, 'type', 'click')") {{$t('15分')}}
                            .expand-item(
                                :class="{active: activeType === KLineType.KT_MIN30}"
                                @click.stop="setActive(KLineType.KT_MIN30, 'type', 'click')") {{$t('30分')}}
                            .expand-item(
                                :class="{active: activeType === KLineType.KT_MIN60}"
                                @click.stop="setActive(KLineType.KT_MIN60, 'type', 'click')") {{$t('60分')}}
                .right-part(v-if="!hideMoreOption")
                    ul
                        li.more.line(@click.stop="showBusinessType = !showBusinessType" v-clickoutside="handleBusinessTypOutside")
                            span.appear-text {{$t('显示')}}
                            //- img.down(src="@/renderer/assets/images/down-chartType.png")
                            .expand-wrap(v-show="showBusinessType")
                                .expand-item(
                                    :class="{selected: activeBusinessKLines.includes(BusinessKLineType.BKLT_CURRENT_PRICE)}"
                                    @click.stop="setActive(BusinessKLineType.BKLT_CURRENT_PRICE, 'businessKline')"
                                )
                                    .icon
                                    span {{$t('现价线')}}
                                .expand-item(
                                    :class="{selected: activeBusinessKLines.includes(BusinessKLineType.BKLT_POSITION_COST)}"
                                    @click.stop="setActive(BusinessKLineType.BKLT_POSITION_COST, 'businessKline')"
                                )
                                    .icon
                                    span {{$t('持仓成本线')}}
                                .expand-item(
                                    :class="{selected: activeBusinessKLines.includes(BusinessKLineType.BKLT_TRANSACTION_POINT)}"
                                    @click.stop="setActive(BusinessKLineType.BKLT_TRANSACTION_POINT, 'businessKline')"
                                )
                                    .icon
                                    span {{$t('成交买卖点')}}
                    ul
                        li.more.last(@click.stop="showForward = !showForward" v-clickoutside="handleForwardOutside")
                            span.appear-text {{moreDirectionText}}
                            //- img.down(src="@/renderer/assets/images/down-chartType.png")
                            .expand-wrap(v-show="showForward")
                                .expand-item(
                                    :class="{active: activeDirection === KLineDirection.KD_FORWARD}"
                                    @click.stop="setActive(KLineDirection.KD_FORWARD, 'direction', 'click')"
                                ) {{$t('前复权')}}
                                .expand-item(
                                    :class="{active: activeDirection === KLineDirection.KD_BACKWARD}"
                                    @click.stop="setActive(KLineDirection.KD_BACKWARD, 'direction')"
                                ) {{$t('后复权', 'click')}}
                                .expand-item(
                                    :class="{active: activeDirection === KLineDirection.KD_NONE}"
                                    @click.stop="setActive(KLineDirection.KD_NONE, 'direction')"
                                ) {{$t('不复权', 'click')}}
        d3-chart.chart(
            :stock="stock"
            :type="activeType"
            :direction="activeDirection"
            :businessKlines="activeBusinessKLines"
            :style="{width: this.width}"
            @changeStockInfo="changeStockInfo"
            @changeStockPrice="changeStockPrice"
            :chartId="chartId"
            :hideScale="hideScale"
            :hideCross="hideCross"
            :mainIndicator="mainIndicator"
            :technicalIndicators="technicalIndicators"
            :technicalIndicatorList="technicalIndicatorList"
            :stockDetail="stockDetail"
            :calcParamsMapper="calcParamsMapper"
            :drawLinesMapper="drawLinesMapper"
            )
        .indicator-wrap(v-show="!isLine && !hideIndicator")
            ul.indicators
                li(
                    v-for="indicaor in mainIndicatorList"
                    @click="setMainIndicator(indicaor)"
                    :class="{active: mainIndicator === indicaor}"
                ) {{indicaor}}
                .indicators__divide-line
                li(
                    v-for="item in technicalIndicatorList"
                    :class="{active: technicalIndicators.includes(item)}"
                    @click="setIndicator(item)"
                ) {{item}}
            ul
                li(@click="showDialog = true") {{$t('指标管理')}}
</template>

<script>
import { KLineType, KLineDirection, lineTypes, BusinessKLineType } from '@/renderer/business/fetch-k-line'
import d3Chart from './chart-d3/index'
import NP from 'number-precision'
import { formatStockPrice } from '@/renderer/business/format'
import i18n from './i18n'
import Clickoutside from '@/utils/clickoutside.js'
export default {
    name: 'stock-chart',
    i18n: {
        分时: ['分时', '分時', 'Time of Day'],
        '5日': ['5日', '5日', '5 Days'],
        '日K': ['日K', '日K', '1 Day'],
        '周K': ['周K', '周K', '1 Week'],
        '月K': ['月K', '月K', '1 Month'],
        '季K': ['季K', '季K', '3 Month'],
        '年K': ['年K', '年K', '1 Year'],
        '1分': ['1分', '1分', '1 Min'],
        '5分': ['5分', '5分', '5 Mins'],
        '15分': ['15分', '15分', '15 Mins'],
        '30分': ['30分', '30分', '30 Mins'],
        '60分': ['60分', '60分', '60 Mins'],
        '显示': ['显示', '顯示', 'Show'],
        现价线: ['现价线', '現價線', 'Nominal Price Curve'],
        持仓成本线: ['持仓成本线', '持倉成本線', 'Position Cost Curve'],
        成交买卖点: ['成交买卖点', '成交買賣點', 'Transaction Point'],
        不复权: ['不复权', '不復權', 'Actual'],
        前复权: ['前复权', '前復權', 'Adj Fwd'],
        后复权: ['后复权', '後復權', 'Adj Bwd'],
        指标管理: ['指标管理', '指標管理', 'Indicator Settings']
    },
    components: {
        d3Chart
    },
    directives: { Clickoutside },
    props: {
        hideIndicator: {
            type: Boolean,
            default: false
        },
        stock: {
            type: String,
            default: ''
        },
        width: {
            type: String,
            default: '100%'
        },
        // 行情数据，不传的话有些状态判断不了
        stockDetail: {
            type: Object,
            default: null
        },
        // chart的唯一标识，当一个document里存在两个以上chart时，必传
        chartId: {
            type: String,
            default: 'usmart-chart'
        },
        // 是否隐藏更多选项
        hideMoreOption: {
            type: Boolean,
            default: false
        },
        // 隐藏title
        hideTitle: {
            type: Boolean,
            default: false
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
        }
    },
    data: function() {
        return {
            activeType: KLineType.TIME_SHARING,
            activeDirection: KLineDirection.KD_FORWARD,
            activeBusinessKLines: [BusinessKLineType.BKLT_CURRENT_PRICE, BusinessKLineType.BKLT_POSITION_COST, BusinessKLineType.BKLT_TRANSACTION_POINT],
            KLineType,
            KLineDirection,
            BusinessKLineType,
            showMoreType: false,
            showBusinessType: false,
            stockPrice: null,
            stockInfo: null,
            position: null,
            showForward: false,
            mainIndicatorList: ['MA', 'SAR', 'EMA', 'BOLL'], // 主要指标
            mainIndicator: 'MA', // 选中主要指标
            // ['ARBR', 'DMA', 'MACD', 'KDJ', 'RSI', 'EMV', 'WR', 'CR']
            technicalIndicatorList: ['ARBR', 'DMA', 'MACD', 'KDJ', 'RSI', 'EMV', 'WR', 'CR', 'MAVOL'],
            technicalIndicators: this.hideIndicator ? [] : ['MACD'],
            calcParamsMapper: {},
            drawLinesMapper: {},
            showDialog: false,
            // KLineDirection,
            // fetchKLine: null,
            // list: {},
            toggleTypeNum: 1,
            toggleTypeArr: [-1, -2, 7, 8, 9, 10, 12],
            toggleCycleNum: 1,
            toggleCycleArr: [1, 2, 4, 5, 6],
            toggleFwNum: 1,
            toggleFwNumArr: [1, 2, 0]
        }
    },
    computed: {
        // 是否是折线，这里特指分时线
        isLine() {
            return lineTypes.includes(this.activeType)
        },
        // 组合数据，包含stockDetail、stockInfo、stockPrice
        stockGroupData() {
            if (!this.stockDetail) {
                return {}
            }
            return Object.assign({}, this.stockInfo, this.stockDetail)
        },
        priceBase() {
            if (!this.stockGroupData) {
                return 100
            }
            return Math.pow(10, this.stockGroupData.priceBase)
        },
        netchng() {
            if (!this.stockDetail) {
                return undefined
            }
            return NP.divide(+this.stockDetail.netchng, this.priceBase)
        },
        latestPrice() {
            if (!this.stockDetail) {
                return undefined
            }
            return NP.divide(+this.stockDetail.latestPrice, this.priceBase)
        },
        marginRatio() {
            if (!this.stockDetail) {
                return
            }
            return NP.times(+this.stockDetail.marginRatio, 100).toFixed(2) + '%'
        },
        moreTypeText() {
            const map = {
                [KLineType.KT_MIN1]: i18n['1分'],
                [KLineType.KT_MIN5]: `5 ${i18n['分']}`,
                [KLineType.KT_MIN15]: `15 ${i18n['分']}`,
                [KLineType.KT_MIN30]: `30 ${i18n['分']}`,
                [KLineType.KT_MIN60]: `60 ${i18n['分']}`
            }
            return map[this.activeType] || i18n['1分']
        },
        moreDirectionText() {
            const map = {
                [KLineDirection.KD_FORWARD]: i18n['前复权'],
                [KLineDirection.KD_BACKWARD]: i18n['后复权'],
                [KLineDirection.KD_NONE]: i18n['不复权']
            }
            return map[this.activeDirection]
        }
    },
    mounted() {
        document.body.addEventListener('click', this.hideMore)
        this.calcParamsMapper = {}
        this.drawLinesMapper = {}
    },
    destroyed() {
        this.$bus.$off(['CHART_TYPE', 'KLINE_CYCLE', 'CHART_REHABILITATION'])
        document.body.removeEventListener('click', this.hideMore)
    },
    filters: {
        formatStockPrice(v) {
            return formatStockPrice(v, { def: '' })
        }
    },
    methods: {
        handleBusinessTypOutside() {
            this.showBusinessType = false
        },
        handleForwardOutside() {
            this.showForward = false
        },
        setActive(type, t, eventType) {
            if (t === 'type') {
                this.activeType = type
                this.showMoreType = false
                if (eventType === 'click') {
                    this.toggleTypeNum = this.toggleTypeArr.indexOf(type) + 1
                }
            } else if (t === 'direction') {
                this.activeDirection = type
                this.showForward = false
                if (eventType === 'click') {
                    this.toggleFwNum = this.toggleFwNumArr.indexOf(type) + 1
                }
            } else if (t === 'businessKline') {
                // 最后一次点击的显示线
                this.activeBusinessKLine = type + ''
                let findIndex = this.activeBusinessKLines.findIndex(d => d === type)
                if (findIndex === -1) {
                    this.activeBusinessKLines.push(type)
                } else {
                    this.activeBusinessKLines.splice(findIndex, 1)
                }
            }
        },
        more() {
            this.showMoreType = !this.showMoreType
        },
        hideMore() {
            this.showMoreType = false
        },
        changeStockPrice(data, position) {
            this.position = position
            this.stockPrice = data
        },
        changeStockInfo(data) {
            this.stockInfo = data
        },
        setMainIndicator(indicaor) {
            this.mainIndicator = this.mainIndicator === indicaor ? '' : indicaor
            this.indicatorCountPoint(indicaor)
        },
        setIndicator(indicator) {
            let findIndex = this.technicalIndicators.findIndex(d => d === indicator)
            this.indicatorCountPoint(indicator)
            if (findIndex === -1) {
                if (this.technicalIndicators.length >= 3) {
                    this.technicalIndicators = [...this.technicalIndicators.slice(1), indicator]
                } else {
                    this.technicalIndicators.push(indicator)
                }
            } else {
                this.technicalIndicators.splice(findIndex, 1)
            }
        },
        handleDialogClose(calcParamsMapper, drawLinesMapper) {
            this.calcParamsMapper = calcParamsMapper
            this.drawLinesMapper = drawLinesMapper
        },
        // k线切换类型
        toggleType() {
            let len = this.toggleTypeArr.length
            let index = this.toggleTypeNum % len
            this.toggleTypeNum++
            return this.toggleTypeArr[index]
        },
        // k线切换周期
        toggleCycle() {
            let len = this.toggleCycleArr.length
            let index = this.toggleCycleNum % len
            this.toggleCycleNum++
            return this.toggleCycleArr[index]
        },
        // k线切换复权
        toggleFw() {
            let len = this.toggleFwNumArr.length
            let index = this.toggleFwNum % len
            this.toggleFwNum++
            return this.toggleFwNumArr[index]
        }
    }
}
</script>

<style lang="scss" scoped>
.stock-chart {
    width: 100%;
    height: 100%;
    background: $foreground;
    position: relative;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    padding-bottom: 4px;
    .header {
        display: flex;
        flex-direction: column;
        .header-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }
    // padding: 0 12px;
    // padding: $padding-levelone-top-bottom 0;
    .option {
        display: flex;
        justify-content: space-between;
        .right-part {
            display: flex;
        }
        ul {
            display: flex;
            text-align: center;
            margin-bottom: 10px;
            z-index: 1;
            user-select: none;
            li {
                font-size: 12px;
                font-family: $PingFangSCRegular;
                font-weight: 400;
                color: $light-color;
                line-height: 28px;
                margin-right: 12px;
                cursor: pointer;
                &.active {
                    color: $checked-color;
                    position: relative;
                    &::after {
                        content: '';
                        width: 12px;
                        height: 2px;
                        background: $checked-color;
                        position: absolute;
                        left: 50%;
                        bottom: 0;
                        transform: translateX(-50%);
                    }
                }
                &.more {
                    position: relative;
                    padding-right: 16px;
                    margin-right: 15px;
                    &.line {
                        &:after {
                            content: '';
                            position: absolute;
                            top: 9px;
                            right: 0;
                            width: 1px;
                            height: 11px;
                            background: $form-border-color;
                        }
                    }
                    &.last {
                        padding-right: 0;
                        margin-right: 0;
                    }
                    .appear-text {
                        color: $font-color;
                    }
                    .expand-wrap {
                        position: absolute;
                        border-radius: $form-radius;
                        padding: 8px 0;
                        background: $foreground-light;
                        .expand-item {
                            display: flex;
                            align-items: center;
                            padding: 4px 12px;
                            font-size: $text-font-mini-size;
                            font-weight: 400;
                            color: $form-color;
                            min-width: 50px;
                            text-align: left;
                            white-space: nowrap;
                            line-height: 16px;
                            &:hover,
                            &.active {
                                color: $primary-color;
                            }
                            &:hover{
                                background: $hover-color;
                            }
                            &.selected {
                                .icon {
                                    // background: url('~@/renderer/assets/images/icon-selected.png') no-repeat;
                                    background-size: 12px;
                                }
                                color: $primary-color;
                            }
                            .icon {
                                width: 12px;
                                height: 12px;
                                margin-right: 4px;
                                // background: url('~@/renderer/assets/images/icon-unselected.png') no-repeat;
                                background-size: 12px;
                            }
                        }
                    }
                    &.active::after {
                        left: 10px;
                    }
                    .down {
                        position: relative;
                        top: -1px;
                        width: 12px;
                        height: 12px;
                        margin-left: 4px;
                        vertical-align: middle;
                    }
                }
            }
            li:hover {
                color: $checked-color;
            }
        }
    }
    .info-wrap {
        display: flex;
        align-items: center;
        border-bottom: 1px solid $background-color;
        padding: 4px 0;
        flex: 1;
        .symbol {
            @include font($DINPro-Medium, $text-font-large-size, $form-color, 500);
        }
        .name {
            @include font($PingFangSCRegular, $text-font-large-size, $form-color, 500);
            margin-left: 4px;
        }
        .price {
            font-family: $DINPro-Medium;
            font-size: $text-font-large-size;
            font-weight: 500;
            margin-left: 4px;
        }
        .icon {
            width: 16px;
            height: 16px;
            margin-left: 4px;
        }
        .range {
            font-family: $DINPro-Medium;
            font-size: $text-font-middle-size;
            font-weight: 500;
            margin-left: 4px;
        }
        .type {
            font-size: $text-font-mini-size;
            color: #3b3b3b;
            background-color: $flat-color;
            padding: 0 5px;
            border-radius: $form-radius;
            margin-left: 4px;
            height: 20px;
        }
        .rate {
            font-size: $text-font-mini-size;
            color: #3b3b3b;
            background-color: $label-color-financial;
            padding: 0 5px;
            border-radius: $form-radius;
            margin-left: 4px;
            height: 20px;
        }
    }
    .chart {
        flex: 1;
    }
    .indicator-wrap {
        display: flex;
        height: 22px;
        align-items: center;
        justify-content: space-between;
        border: 0.5px solid $table-line;
        padding: 0 2px;
        width: 100%;
        ul {
            display: flex;
            align-items: center;
            padding: 3px 6px 4px 6px;
            .indicators__divide-line {
                width: 1px;
                height: 10px;
                background: #434343;
                margin-right: 5px;
            }
            li {
                @include font($SFUIDisplaRegular, $text-font-mini-size, $font-color, 400);
                &.active {
                    color: $primary-color;
                }
                cursor: pointer;
                margin-right: 12px;
                user-select: none;
                line-height: 1;
                &:last-child {
                    margin-right: 0;
                }
            }
        }
    }

}
</style>
