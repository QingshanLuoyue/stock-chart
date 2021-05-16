import env from './env'
// const S = require('simplebig')
const isObject = value => Object.prototype.toString.call(value) === '[object Object]'
// const langErrorSet = (errorText, path) => {
// if (localStorage.get('langError')) {
//     let langError = localStorage.get('langError')
//     langError[path] = errorText
//     localStorage.put('langError', langError)
// } else {
//     localStorage.put('langError', {})
// }
// }
export const create$t = (messages) => {
    const messageToValue = (message, ...args) => typeof message === 'function' && args.length > 0 ? message(...args) : message || ''

    const getMessage = (messages, path, ...args) => {
        if (!path) {
            return messages
        }
        const pathArr = path.split('.')
        const pathFirst = pathArr.shift()
        const message = messages[pathFirst]
        if (pathArr.length > 0) {
            return getMessage(message, pathArr.join('.'), ...args)
        } else {
            return messageToValue(message, ...args)
        }
    }

    if (isObject(messages.zhCHS)) {
        const langMap = new Map([['1', 'zhCHS'], ['2', 'zhCHT'], ['3', 'en']])
        const lang = langMap.get(env.langType) || 'zhCHS'
        return (path, ...args) => {
            // try {
            //     if (process.env.ENV_TARGET !== 'pro') {
            //         if (typeof messages['zhCHT'][path] !== 'function' && messages['zhCHT'][path] !== S.s2t(messages['zhCHT'][path])) {
            //             let errorText = `${path}-->项目里的繁体：${messages['zhCHT'][path]}-->正确的繁体：${S.s2t(messages['zhCHT'][path])}`
            //             langErrorSet(errorText, path)
            //         }
            //     }
            // } catch (error) {
            //     console.log('langerror1')
            // }
            return getMessage(messages[lang], path, ...args)
        }
    } else {
        const index = parseInt(env.langType) - 1
        return (path, ...args) => {
            if (path) {
                const message = getMessage(messages, path, ...args)[index]
                // try {
                //     if (process.env.ENV_TARGET !== 'pro') {
                //         if (typeof messages[path][1] !== 'function' && messages[path][1] !== S.s2t(messages[path][1])) {
                //             let errorText = `${path}-->项目里的繁体：${messages[path][1]}-->正确的繁体：${S.s2t(messages[path][1])}`
                //             langErrorSet(errorText, path)
                //         }
                //     }
                // } catch (error) {
                //     console.log('langerror2')
                // }
                return messageToValue(message, ...args)
            } else {
                return new Proxy(messages, {
                    get(target, property) {
                        if (target[property]) {
                            const message = target[property][index]
                            // try {
                            //     // 简繁体检测正误
                            //     if (process.env.ENV_TARGET !== 'pro') {
                            //         if (typeof target[property][0] !== 'function' && S.s2t(target[property][1]) !== target[property][1]) {
                            //             let errorText = `${property}-->项目里的繁体：${target[property][1]}-->正确的繁体: ${S.s2t(target[property][1])}`
                            //             langErrorSet(errorText, property)
                            //         }
                            //     }
                            // } catch (error) {
                            //     console.log('langerror3')
                            // }
                            return messageToValue(message, ...args)
                        } else {
                            return property
                        }
                    }
                })
            }
        }
    }
}

export const createI18n = messages => create$t(messages)()

export default {
    install(Vue) {
        Vue.mixin({
            computed: {
                $t() {
                    if (!this.$options.i18n) {
                        const getParent$t = vm => {
                            const parent = vm.$parent
                            if (!parent) {
                                return undefined
                            }
                            return parent.$options.i18n ? parent.$t : getParent$t(parent)
                        }
                        return getParent$t(this)
                    }
                    return create$t(this.$options.i18n, this)
                },
                $i18n() {
                    return this.$t()
                }
            }
        })
    }
}
