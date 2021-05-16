/**
 * 计算n周期内最高和最低
 * @param dataList
 * @returns {{ln: number, hn: number}}
 */
export default function calcHnLn(dataList = []) {
    let hn = Number.MIN_SAFE_INTEGER
    let ln = Number.MAX_SAFE_INTEGER
    dataList.forEach(data => {
        hn = Math.max(data.high, hn)
        ln = Math.min(data.low, ln)
    })
    return { hn, ln }
}
