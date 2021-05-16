<template lang="pug">
    el-dialog.indicator-manage(:visible.sync="showDialog" title="指标设置" width="690px" height="512px" @close="handleClose")
        div.indicator-container
            p.title 主要指标
            ul
                li.flex(v-for="(text, index) in subIndicatorsText"
                v-if="index <= 3"
                :class=`{'active-bg': subIndicators[index] === activeKey}`
                @click="changeActive(index)"
                ) 
                    .text {{text}}
                    //- img.drag-icon(src="@/renderer/assets/images/drag-icon.png")
                
            p.title 副图指标
            ul
                li.flex(v-for="(text, index) in subIndicatorsText"
                v-if="index > 3"
                :class=`{'active-bg': subIndicators[index] === activeKey}`
                @click="changeActive(index)"
                ) 
                    .text {{text}}
                    //- img.drag-icon(src="@/renderer/assets/images/drag-icon.png")
        div.params-illustration-container
            .title-panel.flex
                span.title 参数名
                span.title 参数值
                span.title 指标线
            div
                .param-container.flex(v-for='(item, index) in params[activeKey]' :key="index")
                    .text {{item[0]}}
                    div(v-if="item[0]") 
                        //- img(src="@/renderer/assets/images/minus-icon.png" @click="minusValue(index)")
                        el-input.param-value(v-model.number="item[1]" :min='0' :step="1" :controls="false")
                        //- img(src="@/renderer/assets/images/plus-icon.png" @click="plusValue(index)")
                    div
                        img.check-img(:src="getImgUrl(index)" 
                        v-if="item[2]"
                        @click="handleCheckboxChange(index)"
                        ) 
                        span.text {{item[2]}}
            .title-panel.title 指标说明
            p.illustration.text(v-html='illustrations[activeKey]')
</template>

<script>
import ElDialog from 'element-ui-ex/el-dialog'
import ElInput from 'element-ui-ex/el-input-number'
import { FormItem } from 'element-ui'
import { illustrations } from './map'
export default {
    name: 'indicator-dialog',
    components: {
        ElDialog,
        ElInput,
        FormItem
    },
    props: {
        value: {
            default: false,
            type: Boolean
        }
    },
    data() {
        return {
            activeKey: 'MA',
            subIndicatorsText: ['MA移动平均线', 'EMA平滑移动平均线', 'BOLL布林线', 'SAR停损转向操作点指标', 'ARBR情绪指标', 'DMA平行线差指标', 'MACD指数平滑移动平均线', 'KDJ随机指标', 'MAVOL成交量均线', 'RSI相对强弱指标', 'EMV简易波动指标', 'WR威廉指标', 'CR能量指标'],
            subIndicators: ['MA', 'EMA', 'BOLL', 'SAR', 'ARBR', 'DMA', 'MACD', 'KDJ', 'MAVOL', 'RSI', 'EMV', 'WR', 'CR'],
            params: {
                MA: [['移动平均周期1', 5, 'MA1', true], ['移动平均周期2', 20, 'MA2', true], ['移动平均周期3', 60, 'MA3', true], ['移动平均周期4', 120, 'MA4', true], ['移动平均周期5', 250, 'MA5', true]],
                EMA: [['移动平均周期1', 5, 'EMA1', true], ['移动平均周期2', 10, 'EMA2', true], ['移动平均周期3', 20, 'EMA3', true]],
                BOLL: [['计算周期', 20, 'MID', true], ['标准差倍数', 2, 'UPPER', true], ['', '', 'LOWER', true]],
                SAR: [['计算周期', 4, 'BB', true], ['步长', 2, '', ''], ['极限值', 20, '', '']],
                ARBR: [['计算周期', 26, 'AR', true], ['', '', 'BR', true]],
                DMA: [['短周期', 10, 'DDD', true], ['长周期', 50, 'DDDMA', true], ['移动平均周期', 10, '', '']],
                MACD: [['短周期', 12, 'DIF', true], ['长周期', 26, 'DEA', true], ['移动平均周期', 9, 'MACD', true]],
                KDJ: [['计算周期', 9, 'K', true], ['移动平均周期1', 3, 'D', true], ['移动平均周期2', 3, 'J', true]],
                MAVOL: [['MAVOL1', 5, 'VOL1', true], ['MAVOL2', 10, 'VOL5', true], ['MAVOL3', 20, 'VOL10', true], ['', '', 'VOL20', true]],
                RSI: [['移动平均周期1', 6, 'RSI1', true], ['移动平均周期2', 12, 'RSI2', true], ['移动平均周期3', 24, 'RSI3', true]],
                EMV: [['移动平均周期1', 14, 'EMV', true], ['移动平均周期2', 9, 'EMVA', true]],
                WR: [['计算周期', 10, 'WR1', true], ['移动平均周期', 6, 'WR2', true]],
                CR: [['计算周期', 26, 'CR', true], ['移动平均周期1', 6, 'MA1', true], ['移动平均周期2', 10, 'MA2', true], ['移动平均周期3', 20, 'MA3', true], ['移动平均周期4', 60, 'MA4', true]]
            },
            illustrations
        }
    },
    created() {
        const calcParamsMapper = this.$electronStorage.get('indicatorSetting1')
        const drawLinesMapper = this.$electronStorage.get('indicatorSetting2')
        if (calcParamsMapper && drawLinesMapper) {
            for (let key in this.params) {
                const arr = this.params[key]
                for (let i = 0; i < arr.length; i++) {
                    this.params[key][i][0] && this.$set(this.params[key][i], 1, calcParamsMapper[key][i])
                    this.params[key][i][2] && this.$set(this.params[key][i], 3, drawLinesMapper[key][i])
                }
            }
        }
        this.handleClose()
    },
    computed: {
        showDialog: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v)
            }
        }
    },
    methods: {
        changeActive(index) {
            this.activeKey = this.subIndicators[index]
        },
        minusValue(index) {
            this.$set(this.params[this.activeKey][index], 1, this.params[this.activeKey][index][1] - 1)
        },
        plusValue(index) {
            this.$set(this.params[this.activeKey][index], 1, this.params[this.activeKey][index][1] + 1)
        },
        getImgUrl(index) {
            return ''
        },
        handleCheckboxChange(index) {
            this.$set(this.params[this.activeKey][index], 3, !this.params[this.activeKey][index][3])
        },
        handleClose() {
            const calcParamsMapper = {}
            const drawLinesMapper = {}
            let paramHasNull = false
            for (let key in this.params) {
                const arr = this.params[key]
                const calcParams = []
                const drawLines = []
                for (let subArr of arr) {
                    // 有参数值为空
                    if (subArr[0] && subArr[1] === undefined) {
                        paramHasNull = true
                    }
                    subArr[0] && calcParams.push(subArr[1])
                    subArr[2] && drawLines.push(subArr[3])
                }
                calcParamsMapper[key] = calcParams
                drawLinesMapper[key] = drawLines
            }
            if (!paramHasNull) {
                this.$electronStorage.put('indicatorSetting1', calcParamsMapper)
                this.$electronStorage.put('indicatorSetting2', drawLinesMapper)
                this.$emit('closeDialog', calcParamsMapper, drawLinesMapper)
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.indicator-manage {
    /deep/ { 
        .el-dialog__header {
            text-align: center;
            height: 40px;
            .el-dialog__title {
                line-height: 40px;
            }
        }
        .el-input {
            .el-input__inner {
                text-align: center;
                padding-right: 8px;
            }
        } 
        .el-dialog__body {
            height: 570px;
        }
    }
    .indicator-container {
        float: left;
        width: 191px;
        height: 100%;
        background: #242424;
        margin-right: 2px;
        ul {
            li {
                width: 100%;
                height: 24px;
                padding: 0 12px;
                .drag-icon {
                    width: 16px;
                    height: 16px;
                }
            }
        }
        .title {
            margin-bottom: 8px;
        }
        .text {
            line-height: 24px;
        }
        .active-bg {
            .text {
                color: #0BC0F1;
            }
            background: rgba($color: #0BC0F1, $alpha: 0.1);
        }
    }
    .params-illustration-container {
        padding-left: 193px;
        background: #1A1A1A;
        .title-panel {
            background: #242424;
            margin-top: 2px;
            span:first-child {
                width: 80px;
            }
            span:last-child {
                width: 80px;
            }
        }
        .param-container {
            margin: 0 12px;
            height: 52px;
            border-bottom: solid 1px #242424;
            &:last-of-type {
                border-bottom: none;
            }
            .param-value {
                width: 44px;
                height: 28px;
                background: #2A2A2A;
                border-radius: 2px;
                font-size: 14px;
                font-family: DINPro-Medium, DINPro;
                font-weight: 500;
                color: #EBEBEB;
                line-height: 28px;
                margin: 12px;
                display: inline-block;
                text-align: center;
            }
            img {
                margin: 20px auto;
                width: 12px;
                height: 12px;
            }
            .check-img {
                margin-right: 8px;
            }
            div:first-child {
                width: 80px;
            }
            div:last-child {
                width: 70px;
            }
            .text {
                line-height: 52px;
            }
        }
        .illustration {
            padding: 12px;
        }
    }
    .title {
        font-size: 12px;
        font-family: $PingFangSCRegular;
        font-weight: 400;
        color: #979797;
        padding-left: 12px;
        line-height: 24px;
    }
    .text {
        font-size: 12px;
        font-family: $PingFangSCRegular;
        font-weight: 400;
        color: #EBEBEB;
        text-align: left;
    }
    .flex {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}
</style>
