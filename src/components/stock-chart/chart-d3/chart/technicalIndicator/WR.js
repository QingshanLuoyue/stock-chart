
/**
 * 计算WR指标
 * WR：威廉指标。表示的是市场处于超买还是超卖状态。这个指标是一个振荡指标，是依股价的摆动点来度量股票/指数是否处于超买或超卖的现象。
 * 它衡量多空双方创出的峰值（最高价）距每天收市价的距离与一定时间内（如7天）的股价波动范围的比例，以提供出股市趋势反转的讯号。
 *
 * WR指标计算方式
 * WR(N) = 100 * [ HIGH(N)-C ] / [ HIGH(N)-LOW(N) ]
 *
 * @param dataList
 * @param calcParams
 * @returns {[]}
 */
import calcHnLn from './calcHnLn'

export default function calcTechnicalIndicator(dataList, calcParams = [6, 10], plots = [
    { key: 'wr1', title: 'WR1', type: 'line' },
    { key: 'wr2', title: 'WR2', type: 'line' }
]) {
    return dataList.map((kLineData, i) => {
        const wr = {
            wr1: 0,
            wr2: 0
        }
        const close = kLineData.close
        calcParams.forEach((param, index) => {
            const p = param - 1
            if (i >= p) {
                const hln = calcHnLn(dataList.slice(i - p, i + 1))
                const hn = hln.hn
                const ln = hln.ln
                const hnSubLn = hn - ln
                wr[plots[index].key] = hnSubLn === 0 ? 0 : (hn - close) / hnSubLn * 100
            }
        })
        return {
            ...wr,
            value: wr.wr1
        }
    })
}
