import env from '@/utils/env'
import dayjs from 'dayjs'
import { isUndefined } from '@/utils/type'
import i18n from './i18n.js'

/**
 * 将数字格式化为百分数
 * @params val 格式化的数字
 * @params options.divisor 除数，默认100
 * @params options.decimal 小数点位数，默认2
 * @params options.hasSign 正数时是否有‘+’号，默认false
 * @params options.def 为undefined时的显示，默认值：‘0.00%’,小数点位数与options.decimal相关
 * @return {string}
 */
export const formatPercent = (val, options = {}) => {
    options = {
        base: 0,
        divisor: 100,
        decimal: 2,
        hasSign: false,
        ...options
    }
    let {base} = options
    if (val === undefined || isNaN(val) || val === 999999.999999) {
        // options.def = options.def || (0).toFixed(options.decimal) + '%'
        options.def = options.def || '--'
        return options.def
    }
    options.base = options.base || 0 // 防止base为undefined
    const sign = val > 0 && options.hasSign ? '+' : ''
    return sign + (val / Math.pow(10, base) / options.divisor).toFixed(options.decimal) + '%'
}

/**
 * 格式化股票价格
 * @params val 格式化的数字
 * @params options.base 除数，默认100
 * @params options.decimal 小数点位数，默认2
 * @params options.hasSign 正数时是否有‘+’号，默认false
 * @params options.def 为undefined时的显示，默认值：‘--’
 * @return {string}
 */
export const formatStockPrice = (price, options = {}) => {
    options = {
        base: 0,
        decimal: 3,
        hasSign: false,
        def: '--',
        ...options
    }
    if (price === undefined || isNaN(+price)) {
        return options.def
    }
    options.base = options.base || 0 // 防止base为undefined
    const sign = price > 0 && options.hasSign ? '+' : ''
    return sign + (price / 10 ** options.base).toFixed(options.decimal)
}

export const formatBigNumber = function(val, options = {}) {
    options = {
        base: 0,
        decimal: 2,
        hasSign: false,
        def: '--',
        unit: '',
        ...options
    }
    if (val === undefined) {
        return options.def
    }
    options.base = options.base || 0 // 防止base为undefined
    const sign = val < 0 ? '-' : (val > 0 && options.hasSign ? '+' : '')
    val = Math.abs(val) / 10 ** options.base
    if (env.isLangEn) {
        if (val >= 1e9) {
            return sign + (val / 1e9).toFixed(options.decimal) + 'B'
        }
        if (val >= 1e6) {
            return sign + (val / 1e6).toFixed(options.decimal) + 'M'
        }
        if (val >= 1e3) {
            return sign + (val / 1e3).toFixed(options.decimal) + 'K'
        }
    } else {
        if (val >= 1e12) {
            const unit = env.isLangZhHk ? '萬億' : '万亿'
            return sign + (val / 1e12).toFixed(options.decimal) + unit + options.unit
        }
        if (val >= 1e8) {
            const unit = env.isLangZhHk ? '億' : '亿'
            return sign + (val / 1e8).toFixed(options.decimal) + unit + options.unit
        }
        if (val >= 1e4) {
            const unit = env.isLangZhHk ? '萬' : '万'
            return sign + (val / 1e4).toFixed(options.decimal) + unit + options.unit
        }
    }

    return sign + val.toFixed(options.decimal)
}

export const formatBigNumberNo = function(val, options = {}) {
    options = {
        base: 0,
        decimal: 2,
        hasSign: false,
        def: '--',
        unit: '',
        ...options
    }
    if (val === undefined) {
        return options.def
    }
    options.base = options.base || 0 // 防止base为undefined
    const sign = val < 0 ? '-' : (val > 0 && options.hasSign ? '+' : '')
    val = Math.abs(val) / 10 ** options.base
    if (val >= 1e12) {
        return sign + (val / 1e12).toFixed(options.decimal)
    }
    if (val >= 1e8) {
        return sign + (val / 1e8).toFixed(options.decimal)
    }
    if (val >= 1e4) {
        return sign + (val / 1e4).toFixed(options.decimal)
    }
    return sign + val
}

export const formatBigNumberUnit = function(val, options = {}) {
    options = {
        base: 0,
        decimal: 2,
        hasSign: false,
        def: '--',
        unit: '',
        ...options
    }
    if (val === undefined) {
        return options.def
    }
    options.base = options.base || 0 // 防止base为undefined
    val = Math.abs(val) / 10 ** options.base
    if (val >= 1e12) {
        return i18n['万亿']
    }
    if (val >= 1e8) {
        return i18n['亿']
    }
    if (val >= 1e4) {
        return i18n['万']
    }
    return ''
}

export const formatBigNumberBrief = function(val, options = {}) {
    // console.log(val)
    options = {
        base: '0',
        decimal: 2,
        hasSign: false,
        def: '--',
        ...options
    }
    let formatNum = options.base === '0' ? 1 : options.base === '1' ? 1000 : options.base === '2' ? 1000000 : 1
    const sign = val < 0 ? '-' : (val > 0 && options.hasSign ? '+' : '')
    let afterNum = Math.abs(val) * formatNum
    if (val === 999999.999999 || val === undefined) {
        return options.def
    } else {
        if (afterNum >= 1e12) {
            return sign + (afterNum / 1e12).toFixed(options.decimal) + i18n['万亿']
        }
        if (afterNum >= 1e8) {
            return sign + (afterNum / 1e8).toFixed(options.decimal) + i18n['亿']
        }
        if (afterNum >= 1e4) {
            return sign + (afterNum / 1e4).toFixed(options.decimal) + i18n['万']
        }
        return sign + afterNum
    }
}

export const formatBigNumberEn = function(val, options = {}) {
    options = {
        base: 0,
        decimal: 1,
        hasSign: false,
        def: '--',
        ...options
    }
    if (val === undefined) {
        return options.def
    }
    options.base = options.base || 0 // 防止base为undefined
    const sign = val < 0 ? '-' : (val > 0 && options.hasSign ? '+' : '')
    val = Math.abs(val) / 10 ** options.base
    if (val >= 1e9) {
        return sign + (val / 1e9).toFixed(options.decimal) + 'B'
    }
    if (val >= 1e6) {
        return sign + (val / 1e6).toFixed(options.decimal) + 'M'
    }
    if (val >= 1e3) {
        return sign + (val / 1e3).toFixed(options.decimal) + 'K'
    }
    return sign + val
}

// 例：7897897888 => 7,897,897,888
export const formatNumberComma = num => {
    if (num === null || num === undefined) {
        return ''
    }
    num = parseFloat(num)
    const arr = num.toString().split('.')
    const reverse = str => str.split('').reverse().join('') // eslint-disable-line
    arr[0] = reverse(arr[0])
    arr[0] = arr[0].replace(/\d{3}(?=[^$])/g, `$&,`)
    arr[0] = reverse(arr[0])
    return arr.length > 1 ? arr.join('.') : arr[0]
}

/**
 * 格式化为时间文案
 * @param timestamp number
 * @return {string}
 */
export const formatTimeText = timestamp => {
    if ((timestamp + '').length === 10) {
        timestamp = timestamp * 1000
    }
    const interval = Date.now() - timestamp
    if (interval < 3600 * 1000) {
        const min = Math.ceil(interval / 60 / 1000)
        return `${min}分钟前`
    }
    // const isToday = dayjs(timestamp).diff(new Date(), 'day') === 0
    // if (isToday) {
    //     return dayjs(timestamp).format('HH:mm')
    // }
    const isThisYear = dayjs(timestamp).diff(new Date(), 'year') === 0
    if (isThisYear) {
        return dayjs(timestamp).format('MM-DD HH:mm')
    }
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm')
}

export const formatText2Time = (text, format = 'time') => {
    let time = (text || '').toString()
    if (format === 'date') {
        time = time.substr(0, 8).replace(/^(\d{4})(\d{2})(\d{2})$/, function(match, $1, $2, $3) {
            return $1 + '-' + $2 + '-' + $3
        })
        return time
    }
    if (format === 'timeStr') {
        time = time.substr(0, 14).replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, function(match, $1, $2, $3, $4, $5, $6) {
            return $4 + ':' + $5
        })
        return time
    }
    time = time.substr(0, 14).replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, function(match, $1, $2, $3, $4, $5, $6) {
        return $1 + '-' + $2 + '-' + $3 + ' ' + $4 + ':' + $5
    })
    return time
}

// 格式化价格
export function formatPrice(val, base) {
    let ret
    try {
        if (!isUndefined(val)) {
            ret = Number(val / Math.pow(10, base)).toFixed(3)
        }
    } catch (e) {
        ret = val
    }

    return ret
}
// -112235435435 => -112,235,435,435
export function numFormat(num) {
    return (num.toString().indexOf('.') !== -1) ? num.toLocaleString() : num.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
}

// 格式化订单列表区域的数量和价格,type 1为价格，2为数量
export function formatPriceAndAmount(val, type) {
    let ret
    try {
        if (!isUndefined(val)) {
            ret = type === 1 ? Number(val).toFixed(3) : Number(val).toFixed(0)
        }
    } catch (e) {
        ret = val
    }
    return ret
}
//
export function handleColorAndMark(value) {
    if (/^-/.test(value)) {
        // 负数
        return 'fall'
    } else if (Number(value) > 0) {
        // 正数
        return 'rose'
    } else if (/^(0|\.)+$/.test(value)) {
        // 0
        return 'zero'
    }
}
export const formatTimeString = (str) => {
    if (str === 0) {
        return '--'
    }
    let toStr = str + ''
    let preStr = toStr.substring(0, 4)
    let subStr = toStr.substring(4, 12)
    let first = subStr.slice(0, 2) + '-' + subStr.slice(2)
    let second = first.slice(0, 5)
    let third = preStr + '-' + second.slice(0, 8)
    return third
}

// js金额千分位保留3位小数，不足补0
/*
    * 参数说明：
    * number：要格式化的数字
    * decimals：保留几位小数
    * dec_point：小数点符号
    * thousands_sep：千分位符号
* */
export const numberFormat = (number, decimals, dec_point = '.', thousands_sep = ',') => {
    number = (number + '').replace(/[^0-9+-Ee.]/g, '')
    let n = !isFinite(+number) ? 0 : +number
    let prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
    let sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep
    let dec = (typeof dec_point === 'undefined') ? '.' : dec_point
    let s = ''
    let toFixedFix = function(n, prec) {
        let k = Math.pow(10, prec)
        return '' + Math.ceil(n * k) / k
    }

    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.')
    let re = /(-?\d+)(\d{3})/
    while (re.test(s[0])) {
        s[0] = s[0].replace(re, '$1' + sep + '$2')
    }

    if ((s[1] || '').length < prec) {
        s[1] = s[1] || ''
        s[1] += new Array(prec - s[1].length + 1).join('0')
    }
    return s.join(dec)
}
