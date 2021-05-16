import { isArray, isObject } from './type'
import NP from 'number-precision'
// 获取地址栏参数
export const getUrlParam = name => {
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
    let loc = window.location.search
    let r = loc.substr(1).match(reg)
    if (r != null) return unescape(r[2])
    return null
}

// 给链接添加参数
export const addUrlParam = (url, key, value) => {
    key = key.toString()
    const path = url.match(/[^?#]+/)[0]
    const matchQuery = url.match(/\?[^?#]+/)
    const matchHash = url.match(/#.+/)
    const query = matchQuery ? matchQuery[0] : ''
    const hash = matchHash ? matchHash[0] : ''
    const params = query.slice(1).split('&').filter(item => !!item).map(item => item.split('=')) // eslint-disable-line
    const hasKey = params.find(item => item[0] === key)
    if (hasKey) {
        params.forEach(item => {
            if (item[0] === key) {
                item[1] = value
            }
        })
    } else {
        params.push([key, value])
    }
    const newParamStr = '?' + params.map(item => item.join('=')).join('&')
    return path + newParamStr + hash
}

// 生成唯一标识
export function guid() {
    let d = Date.now()
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now()
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
}

// 获取字符串字节长度，汉字算两个
export function getByteLength(str, zhRate = 2) {
    let len = 0
    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i)
        if (charCode >= 0 && charCode <= 128) {
            len += 1
        } else {
            len += zhRate
        }
    }
    return len
}

/**
 * 比较版本号
 * @param v1 版本号，例：1.0.0
 * @param v2 版本号，例：1.0.0
 * @returns number 0：v1=v2，1：v1>v2，-1：v1<v2
 */
export function compareVersion(v1, v2) {
    const v1Arr = v1.split('.').map(i => parseInt(i))
    const v2Arr = v2.split('.').map(i => parseInt(i))
    const maxLength = v1Arr.length > v2Arr.length ? v1Arr.length : v2Arr.length
    for (let i = 0; i < maxLength; i++) {
        if (v1Arr[i] === undefined) {
            return -1
        }
        if (v2Arr[i] === undefined) {
            return 1
        }
        if (v1Arr[i] > v2Arr[i]) {
            return 1
        }
        if (v1Arr[i] < v2Arr[i]) {
            return -1
        }
    }
    return 0
}

/**
 * 深拷贝
 * @param target
 * @param sources
 */
export function deepCopy(target, ...sources) {
    if (target === null || target === undefined) {
        throw new TypeError('Cannot convert undefined or null to object')
    }

    const to = Object(target)
    let i = 0
    let source = sources[i]
    while (source) {
        for (let key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                const value = source[key]
                if (isObject(value)) {
                    deepCopy(to[key] = to[key] || {}, value)
                } else if (isArray(value)) {
                    deepCopy(to[key] = to[key] || [], value)
                } else {
                    to[key] = value
                }
            }
        }
        source = sources[++i]
    }

    return to
}

/** ************************************时间格式化处理************************************/

export function dateFormat(date, str = '-') { // author: Lynn
    date = date + ''
    return date.substring(0, 4) + str + date.substring(4, 6) + str + date.substring(6, 8)
}
/**
 * 安全值
 * @param data
 * @param key
 * @returns {undefined}
 */
export function safeVal(data, key) {
    let ret
    try {
        const arr = key.split('.').filter(_ => _)
        arr.forEach(k => (ret = (ret || data)[k]))
    } catch (e) {
        ret = undefined
    }
    return ret
}
// 精确小数点
// number：为你要转换的数字
// format：要保留几位小数；譬如要保留2位，则值为2
// zerFill:是否补零。不需要补零可以不填写此参数
export function changeDecimal(number, format, zeroFill) {
    // 判断是否为一个数字
    if (typeof number === 'number' && !isNaN(number)) {
    // 正则匹配:正整数，负整数，正浮点数，负浮点数
        if (!/^\d+(\.\d+)?$|^-\d+(\.\d+)?$/.test(number)) { return number }
        var n = 1
        for (var i = 0; i < format; i++) {
            n = n * 10
        }

        // 四舍五入
        number = Math.round(number * n) / n
        var str = number.toString()

        // 是否补零
        if (zeroFill) {
            var index
            if (str.indexOf('.') === -1) {
                index = format
                str += '.'
            } else {
                index = format - ((str.length - 1) - str.indexOf('.'))
            }

            for (let i = 0; i < index; i++) {
                str += '0'
            }
        }
        return str
    }
    return '--'
}

// 非空验证
export function isEmpty(ObjVal) {
    if ((ObjVal === null || typeof (ObjVal) === 'undefined') || (typeof (ObjVal) === 'string' && ObjVal === '' && ObjVal !== 'undefined')) {
        return true
    } else {
        return false
    }
}

export function addZero(num) {
    return num <= 9 ? `0${num}` : num
}
// 千位符
export function thousandsFormat(priceVal, n = 2) {
    if (priceVal) {
        priceVal = Number(priceVal).toFixed(n)
        priceVal = priceVal + ''
        return priceVal.replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, '$1,')
    } else if (priceVal + '' === '0') {
        if (n) {
            return '0.' + '0'.repeat(n)
        } else {
            return '0'
        }
    } else {
        return ''
    }
}

// 修改涨跌幅颜色
export function setPriceLimitColor() {
    let body = document.querySelector('body')
    body.setAttribute('stock-color', 'redUp-greenDown')
}

// 红色
export function RISE_COLOR() {
    let colorType = 0
    return colorType === 0 ? '#ea3d3d' : '#00ba60'
}

// 红色
export function FALL_COLOR() {
    let colorType = 0
    return colorType === 0 ? '#00ba60' : '#ea3d3d'
}

// 判断美股盘前前后
// status 1:启动、开市前 7:已收盘 32:盘后
// sQuote, msInfo, market 从/quotes-dataservice-app/api/v3/detail接口的获取
// sQuote 盘前盘后数据
export function isBeforeAfter(sQuote, msInfo, market) {
    // 美股盘后
    if (market === 'us' && sQuote && msInfo && msInfo.status && [1, 7, 32].includes(msInfo.status)) {
        return 'after'
    }
    // 美股盘前
    if (market === 'us' && sQuote && msInfo && msInfo.status && msInfo.status === 31) {
        return 'before'
    }
    // 非美股盘前盘后
    return false
}

// 计算递增递减的单位
export function priceStep(market, stc, spreadData, price) {
    if (market !== 0 || !stc) {
        return {minusStep: 0.01, plusStep: 0.01}
    }
    if (!spreadData) {
        return {minusStep: 0.01, plusStep: 0.01}
    }
    let { priceBase, spreadTabe } = spreadData
    let priceBaseMap = {}
    spreadTabe.forEach(item => {
        priceBaseMap[item.stc] = item.data
    })
    let base = Math.pow(10, priceBase)
    let minusStep = 0.001
    let plusStep = 0.001
    priceBaseMap[stc].forEach(item => {
        if (price * base >= item.from && price * base < item.to) {
            plusStep = NP.divide(item.value, base)
        }
        if (price * base > item.from && price * base <= item.to) {
            minusStep = NP.divide(item.value, base)
        }
    })
    // 价格大于最大值
    if (priceBaseMap[stc].every(item => item.to < price * base)) {
        minusStep = 5
        plusStep = 5
    }
    return {minusStep, plusStep}
}
