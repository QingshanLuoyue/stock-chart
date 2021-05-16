<template lang="pug">
    .detail-box(v-show="stockPrice" :style="style")
        .time {{stockPrice && stockPrice.time}}
        ul
            li(v-if="isLine")
                .label {{$t('价格')}}
                .content(:class="color") {{stockPrice && stockPrice.price | formatStockPrice}}
            template(v-else)
                li
                    .label {{$t('开盘价')}}
                    .content(:class="color") {{stockPrice && stockPrice.open | formatStockPrice}}
                li
                    .label {{$t('收盘价')}}
                    .content(:class="color") {{stockPrice && stockPrice.close | formatStockPrice}}
                li
                    .label {{$t('最高价')}}
                    .content(:class="color") {{stockPrice && stockPrice.high | formatStockPrice}}
                li
                    .label {{$t('最低价')}}
                    .content(:class="color") {{stockPrice && stockPrice.low | formatStockPrice}}
            li
                .label {{$t('涨跌额')}}
                .content(:class="color") {{stockPrice && stockPrice.netchng | formatStockPrice}}
            li
                .label {{$t('涨跌幅')}}
                .content(:class="color") {{stockPrice && stockPrice.pctchng && stockPrice.pctchng / 100 + '%' || '--'}}
            li
                .label {{$t('均价')}}
                .content {{stockPrice && stockPrice.avg | formatStockPrice}}
            li
                .label {{$t('成交额')}}
                .content {{stockPrice && stockPrice.amount | amountFilter}}
            li
                .label {{$t('成交量')}}
                .content {{stockPrice && stockPrice.volume | volumeFilter}}
</template>
<script>
import { formatBigNumber, formatStockPrice } from '@/renderer/business/format'

const detailWidth = 105
let direction = 1 // 方向转换标志 1：表示一开始鼠标向右移动 2: 表示向左
export default {
    i18n: {
        价格: ['价格', '價格', 'Price'],
        开盘价: ['开盘价', '開盤價', 'Opening Price'],
        收盘价: ['收盘价', '收盤價', 'Closing Price'],
        最高价: ['最高价', '最高價', 'Highest price'],
        最低价: ['最低价', '最低價', 'Lowest price'],
        涨跌额: ['涨跌额', '升跌額', 'Chg Amount'],
        涨跌幅: ['涨跌幅', '升跌幅', 'Chg'],
        均价: ['均价', '均價', 'Average price'],
        成交额: ['成交额', '成交額', 'turnover'],
        成交量: ['成交量', '成交量', 'vol']
    },
    props: {
        stockPrice: {},
        position: {},
        width: {},
        // eslint-disable-next-line vue/require-prop-type-constructor
        mainIndicatorTextHeight: '',
        // eslint-disable-next-line vue/require-prop-type-constructor
        scaleWidth: '',
        // eslint-disable-next-line vue/require-prop-type-constructor
        scaleRight: '',
        isLine: {},
        chartId: {}
    },
    data() {
        return {
            boxWidth: 0
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.getBoxWidth()
            window.addEventListener('resize', this.getBoxWidth, false)
        })
    },
    destroyed() {
        window.removeEventListener('resize', this.getBoxWidth)
    },
    filters: {
        amountFilter(v) {
            return formatBigNumber(v)
        },
        volumeFilter(v) {
            return formatBigNumber(v)
        },
        formatStockPrice(v) {
            return formatStockPrice(v)
        }
    },
    computed: {
        color() {
            if (this.stockPrice && this.stockPrice.netchng > 0) {
                return 'color-rise'
            }
            if (this.stockPrice && this.stockPrice.netchng < 0) {
                return 'color-fall'
            }
            return ''
        },
        style() {
            if (!this.position) {
                return ''
            }
            let top = this.mainIndicatorTextHeight
            // svg图表宽度小于十字线`2倍详情框宽度`时，需要进行位置优化
            if (this.boxWidth < 2 * detailWidth + this.scaleWidth + this.scaleRight + 10) {
                top = this.position[1] - 160
            }
            if (direction === 1) {
                // 鼠标向左移动
                if (this.scaleRight + this.position[0] + detailWidth - 30 >= this.boxWidth) {
                    direction = 2
                }
                return `top:${top}px;right:${this.scaleRight + 4}px;left:auto;`
            } else {
                // 鼠标向右移动
                if (this.position[0] <= this.scaleWidth + detailWidth - 30) {
                    direction = 1
                }
                return `top:${top}px;left:${this.scaleWidth}px;right:auto;`
            }
        }
    },
    methods: {
        getBoxWidth() {
            let el = document.getElementById(this.chartId)
            if (!el) return
            this.boxWidth = el.clientWidth
        }
    }
}
</script>
<style lang="scss" scoped>
.detail-box {
    position: absolute;
    right: 0;
    top: 0;
    width: 105px;
    background: rgba($color: $foreground-light, $alpha: 0.8);
    border-radius: $form-radius;
    padding: 8px 4px;
    z-index: 99;
    .time {
        @include font($DINPro-Medium, $text-font-mini-size, $font-color, 400);
    }
    ul {
        margin-top: 5px;
        li {
            display: flex;
            justify-content: space-between;
            .label {
                text-align: left;
                @include font($PingFangSCRegular, $text-font-mini-size, $font-color, 400);
            }
            .content {
                text-align: right;
                @include font($DINPro-Medium, $text-font-mini-size, $font-color, 400);
            }
        }
    }
}
</style>
