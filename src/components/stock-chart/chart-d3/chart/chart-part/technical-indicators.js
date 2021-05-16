import { getModuleArea } from '../../util.js'

// 渲染技术指标图表
export const renderTechnicalIndicators = function(indicatorsType, options, index) {
    const { partHeights, indicatorConfig, subIndicatorList } = options
    const indicatorArea = indicatorConfig.fontSize + indicatorConfig.padInner * 2

    // 当前技术指标所分配的纵向区域
    const areaHeight = partHeights[index + 1] - indicatorArea
    const startY = getModuleArea(partHeights, index + 1).start + indicatorArea
    const style = `transform: translateY(${startY}px)`

    // 通用副指标渲染 提取公共方法
    if (subIndicatorList.includes(indicatorsType)) {
        // ! 待提取
        return this.renderSubIndicator(options, areaHeight, index, style, indicatorsType, startY)
    }
    // ! 待提取
    return this[`render${indicatorsType}`](options, areaHeight, index, style)
}

// ****************副指标*******************
// 移除副指标图表
export const removeTechnicalIndicators = function(indicatorsType, subIndicatorList, drawLinesMapper) {
    if (subIndicatorList.includes(indicatorsType)) {
        removeSubIndicator.apply(this, [indicatorsType, drawLinesMapper])
        return
    }
    // ! 待提取
    this[`remove${indicatorsType}`]()
}
// 移除副指标
function removeSubIndicator(indicatorsType, drawLinesMapper) {
    drawLinesMapper[indicatorsType].forEach((show, index) => {
        // ! 待提取
        this.removeModule(`usmart-chart-sub_${indicatorsType}_${index + 1}`)
    })
    // ! 待提取
    this.removeModule(`usmart-chart-scaleY_${indicatorsType}`)
    removeSubIndicatorText.call(this, indicatorsType)
}
// 移除副指标文本
export const removeSubIndicatorText = function(indicatorsType) {
    // ! 待提取
    this.removeModule(`usmart-chart-text_${indicatorsType}`)
}
