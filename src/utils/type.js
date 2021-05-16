/**
 * 判断是否是空对象
 * @param obj
 * @returns {boolean}
 */
export function isNullObject(obj) {
    return !obj || JSON.stringify(obj) === JSON.stringify({})
}

/**
 * 判断是否是数组
 * @param param
 * @returns {boolean}
 */
export function isArray(param) {
    return Object.prototype.toString.call(param) === '[object Array]'
}

/**
 * 判断是否是undefined
 * @param param
 * @returns {boolean}
 */
export function isUndefined(param) {
    return Object.prototype.toString.call(param) === '[object Undefined]'
}

/**
 * 判断是否是object
 * @param param
 * @returns {boolean}
 */
export function isObject(param) {
    return Object.prototype.toString.call(param) === '[object Object]'
}

/**
 * 判断是否是函数
 * @param param
 * @returns {boolean}
 */
export function isFunction(param) {
    return Object.prototype.toString.call(param) === '[object Function]'
}

/**
 * 判断是否是字符串
 * @param param
 * @returns {boolean}
 */
export function isString(param) {
    return Object.prototype.toString.call(param) === '[object String]'
}
