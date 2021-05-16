/**
 * 描绘图表网格
 * @param {Object} options
 */
export const renderGrid = function(options) {
    const { width, height, mainIndicatorTextHeight, gridY } = options
    // ! 待提取
    this.removeModule('usmart-chart-grid')
    // ! 待提取
    this.renderModule('Grid', 'usmart-chart-grid', {
        width,
        height,
        startY: mainIndicatorTextHeight,
        stroke: '#242424',
        gridX: 5,
        gridY
    })
}
