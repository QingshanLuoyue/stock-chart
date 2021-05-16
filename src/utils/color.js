
// k 线颜色
export const YL_KLINE_COLORS = {
    YL_KLINE_1_COLOR: '#D49758',
    YL_KLINE_2_COLOR: '#51C0E1',
    YL_KLINE_3_COLOR: '#C985C2',
    YL_KLINE_4_COLOR: '#006FD9',
    YL_KLINE_5_COLOR: '#5CA588'
}
// ['ARBR', 'DMA', 'MACD', 'KDJ', 'RSI', 'EMV', 'WR', 'CR']
export const MA_COLORS = {
    MA5: YL_KLINE_COLORS.YL_KLINE_1_COLOR,
    MA20: YL_KLINE_COLORS.YL_KLINE_2_COLOR,
    MA60: YL_KLINE_COLORS.YL_KLINE_3_COLOR,
    MA120: YL_KLINE_COLORS.YL_KLINE_4_COLOR,
    MA250: YL_KLINE_COLORS.YL_KLINE_5_COLOR
}
export const EMA_COLORS = {
    EMA5: YL_KLINE_COLORS.YL_KLINE_1_COLOR,
    EMA10: YL_KLINE_COLORS.YL_KLINE_2_COLOR,
    EMA20: YL_KLINE_COLORS.YL_KLINE_3_COLOR
}
export const BOLL_COLORS = {
    BOLL_MID: YL_KLINE_COLORS.YL_KLINE_1_COLOR,
    BOLL_UPPER: YL_KLINE_COLORS.YL_KLINE_2_COLOR,
    BOLL_LOWER: YL_KLINE_COLORS.YL_KLINE_3_COLOR
}
export const SAR_COLORS = {
    BB: YL_KLINE_COLORS.YL_KLINE_1_COLOR
}
export const MAVOL_COLORS = {
    VOL1: YL_KLINE_COLORS.YL_KLINE_1_COLOR,
    VOL5: YL_KLINE_COLORS.YL_KLINE_2_COLOR,
    VOL10: YL_KLINE_COLORS.YL_KLINE_3_COLOR,
    VOL20: YL_KLINE_COLORS.YL_KLINE_4_COLOR
}
export const MACD_COLORS = {
    DIF: YL_KLINE_COLORS.YL_KLINE_1_COLOR,
    DEA: YL_KLINE_COLORS.YL_KLINE_2_COLOR,
    MACD: YL_KLINE_COLORS.YL_KLINE_3_COLOR
}
export const KDJ_COLORS = {
    K: YL_KLINE_COLORS.YL_KLINE_1_COLOR,
    D: YL_KLINE_COLORS.YL_KLINE_2_COLOR,
    J: YL_KLINE_COLORS.YL_KLINE_3_COLOR
}
export const RSI_COLORS = {
    RSI1: YL_KLINE_COLORS.YL_KLINE_1_COLOR,
    RSI2: YL_KLINE_COLORS.YL_KLINE_2_COLOR,
    RSI3: YL_KLINE_COLORS.YL_KLINE_3_COLOR
}
export const DMA_COLORS = {
    DDD: YL_KLINE_COLORS.YL_KLINE_1_COLOR,
    DDDMA: YL_KLINE_COLORS.YL_KLINE_2_COLOR
}
export const ARBR_COLORS = {
    AR: YL_KLINE_COLORS.YL_KLINE_1_COLOR,
    BR: YL_KLINE_COLORS.YL_KLINE_2_COLOR
}
export const WR_COLORS = {
    WR1: YL_KLINE_COLORS.YL_KLINE_1_COLOR,
    WR2: YL_KLINE_COLORS.YL_KLINE_2_COLOR
}
export const EMV_COLORS = {
    EMV: YL_KLINE_COLORS.YL_KLINE_1_COLOR,
    EMVA: YL_KLINE_COLORS.YL_KLINE_2_COLOR
}
export const CR_COLORS = {
    CR: YL_KLINE_COLORS.YL_KLINE_1_COLOR,
    MA1: YL_KLINE_COLORS.YL_KLINE_2_COLOR,
    MA2: YL_KLINE_COLORS.YL_KLINE_3_COLOR,
    MA3: YL_KLINE_COLORS.YL_KLINE_4_COLOR,
    MA4: YL_KLINE_COLORS.YL_KLINE_5_COLOR
}
const color = {
    blueBtn: '#0d50d8',
    blueLink: '#2f79ff',
    yellow: '#ffbf32',
    red: '#ea3d3d',
    green: '#00ba60',
    blue: '#0bc0f1',
    blueOpacity: opacity => `rgba(11, 192, 241, ${opacity})`,
    background: '#121216',
    foreground: '#17181d',
    fontWhite1: '#ebebeb',
    fontWhite2: '#979797',
    fontWhite3: '#6d6d6d',
    fontWhite4: '#434343',
    borderWhite: '#242424',
    fontBlack1: '#191919',
    fontBlack2: 'rgba(25, 25, 25, 0.65)',
    fontBlack3: 'rgba(25, 25, 25, 0.45)',
    fontBlack4: 'rgba(25, 25, 25, 0.2)',
    borderBlack: 'rgba(25, 25, 25, 0.05)',
    riseColor: '#ea3d3d',
    fallColor: '#00ba60',
    ...YL_KLINE_COLORS,
    MA_COLORS,
    EMA_COLORS,
    BOLL_COLORS,
    SAR_COLORS,
    MAVOL_COLORS,
    MACD_COLORS,
    KDJ_COLORS,
    RSI_COLORS,
    DMA_COLORS,
    ARBR_COLORS,
    WR_COLORS,
    EMV_COLORS,
    CR_COLORS
}

const setStockColor = () => {
    let colorType = 0
    color.riseColor = colorType === 0 ? '#ea3d3d' : '#00ba60'
    color.fallColor = colorType === 0 ? '#00ba60' : '#ea3d3d'
}
setStockColor()

export default color
