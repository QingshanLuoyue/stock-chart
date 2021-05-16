import i18n from '@/renderer/business/i18n'
/**
 *  修改数组
 *  params :{
 *    obj: Obj
 *    key: String
 *    oldArr: Array
 *  }
*/
export const alterArr = (obj, key1, key2, oldArr) => {
    let num = 0
    oldArr.forEach((i, index) => {
        if (`${i[key1]}${i[key2]}` === `${obj[key1]}${obj[key2]}`) {
            oldArr.splice(index, 1, obj)
        } else {
            num++
        }
    })
    if (num === oldArr.length) {
        oldArr.push(obj)
    }
    return oldArr
}
export const getLocalStorage = () => {
    let time = new Date().getTime()
    let reviewList = JSON.parse(window.localStorage.getItem('reviewList'))
    if (!reviewList) {
        return []
    }
    let isOkData = JSON.stringify(reviewList.filter(item => time - item.time < 7 * 24 * 3600 * 1000))
    window.localStorage.setItem('reviewList', isOkData)
    return JSON.parse(isOkData)
}
// 计算数组中最大值
export const max = (array) => {
    var max = array[0]
    for (var i = 0; i < array.length; i++) {
        if (max < array[i]) max = array[i]
    }
    return max
}
// 计算数组中最小值
export const min = (array) => {
    var min = array[0]
    for (var i = 0; i < array.length; i++) {
        if (min > array[i]) min = array[i]
    }
    return min
}

// 单位转换-->人民币 val: number
export const unitConversion = (arr) => {
    let arrAbs = []
    // 如果是负数要取绝对值
    arr.forEach(item => {
        arrAbs.push(Math.abs(item))
    })
    let biggest = max(arrAbs)
    if (biggest > 0 && biggest < 100000000) {
        return '万'
    } else if (biggest >= 100000000 && biggest < 1000000000000) {
        return '亿'
    } else if (biggest >= 1000000000000) {
        return '万亿'
    }
}
// 单位转换-->人民币 val: number
export const hkunitConversion = (arr) => {
    let arrAbs = []
    // 如果是负数要取绝对值
    arr.forEach(item => {
        arrAbs.push(Math.abs(item))
    })
    let biggest = max(arrAbs)
    if (biggest > 0 && biggest < 100000000) {
        return i18n['万']
    } else if (biggest >= 100000000 && biggest < 1000000000000) {
        return i18n['亿']
    } else if (biggest >= 1000000000000) {
        return i18n['万亿']
    }
}

// 单位转换-->英文单位 val: number
export const unitConversionEg = (arr, unit) => {
    let base = unit === 0 ? 1 : unit === 1 ? 1000 : 1000000
    let arrAbs = []
    // 如果是负数要取绝对值
    arr.forEach(item => {
        arrAbs.push(Math.abs(item))
    })
    let biggest = max(arrAbs)
    console.log('======>>>', biggest)
    if (biggest * base > 0 && biggest * base < 100000000) {
        return '万'
    } else if (biggest * base >= 100000000 && biggest * base < 1000000000000) {
        return '亿'
    } else if (biggest * base >= 1000000000000) {
        return '万亿'
    } else {
        return ''
    }
}

// 单位转换-->英文单位 val: number
export const hkunitConversionEg = (arr, unit) => {
    let base = unit === 0 ? 1 : unit === 1 ? 1000 : 1000000
    let arrAbs = []
    // 如果是负数要取绝对值
    arr.forEach(item => {
        arrAbs.push(Math.abs(item))
    })
    let biggest = max(arrAbs)
    console.log('======>>>', biggest)
    if (biggest * base > 0 && biggest * base < 100000000) {
        return i18n['万']
    } else if (biggest * base >= 100000000 && biggest * base < 1000000000000) {
        return i18n['亿']
    } else if (biggest * base >= 1000000000000) {
        return i18n['万亿']
    } else {
        return ''
    }
}

// 设置涨跌色
export const setRoseFallColor = () => {
    // 涨红跌绿 1， 涨绿跌红 2
    let setColor = 1
    if (setColor === 1) {
        return {
            roseColor: '#EA3D3D',
            fallColor: '#00BA60'
        }
    } else {
        return {
            roseColor: '#00BA60',
            fallColor: '#EA3D3D'
        }
    }
}

// 获取pc端系统类型
export const systemType = (() => {
    let system = null
    var version = navigator.userAgent
    if (version.indexOf('Windows NT 5') !== -1 || version.indexOf('Windows XP') !== -1) { // xp
        system = 'xp'
    } else if (version.indexOf('Mac OS') !== -1) { // mac
        system = 'ios'
    } else { // window
        system = 'windows'
    }
    return system
})()

// 函数防抖
export const debounce = (fn, delay) => {
    // 记录上一次的延时器
    var timer = null
    var newDelay = delay || 200
    return function() {
        var args = arguments
        var that = this
        // 清除上一次延时器
        clearTimeout(timer)
        timer = setTimeout(function() {
            fn.apply(that, args)
        }, newDelay)
    }
}
/**
 * 比较版本号
 * @param v1 版本号，例：1.0.0
 * @param v2 版本号，例：1.0.0
 * @returns number 0：v1=v2，1：v1>v2，-1：v1<v2
 */
export const compareVersion = (v1, v2) => {
    const v1_arr = v1.split('.').map(i => parseInt(i))
    const v2_arr = v2.split('.').map(i => parseInt(i))
    const maxLength = v1_arr.length > v2_arr.length ? v1_arr.length : v2_arr.length
    for (let i = 0; i < maxLength; i++) {
        if (v1_arr[i] === undefined) {
            return -1
        }
        if (v2_arr[i] === undefined) {
            return 1
        }
        if (v1_arr[i] > v2_arr[i]) {
            return 1
        }
        if (v1_arr[i] < v2_arr[i]) {
            return -1
        }
    }
    return 0
}
/**
 * 和当前版本比较
 * @param divisionVersion 将要分割的起始版本号，例：1.0.0
 * @returns
 *  boolean ： 传入的指定版本大于当前app版本返回true，否则返回false
 */
export function compareCurrentVersion(divisionVersion, appVersion) {
    return compareVersion(divisionVersion, appVersion) > 0
}
