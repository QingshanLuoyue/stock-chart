import { appTypeMap, langTypeMap } from './global-map'
let envName
const isLocal = process.env.NODE_ENV === 'development'
if (process.browser) {
    // 浏览器中根据域名设置环境
    const flag = location.hostname.split('.')[0]
    envName = new Map([
        ['www-dev', 'dev'],
        ['www-sit', 'sit'],
        ['www-uat', 'uat'],
        ['www', 'pro']
    ]).get(flag) || 'localhost'
} else {
    if (['sit', 'dev', 'uat'].includes(process.env.ENV_TARGET)) {
        envName = localStorage.ENV_TARGET || process.env.ENV_TARGET
    } else {
        envName = isLocal ? 'localhost' : process.env.ENV_TARGET
    }
}
console.log('process.env.ENV_TARGET======>', process.env.ENV_TARGET)

envName = envName || 'sit'
// envName = localStorage.ENV_TARGET || 'sit'
// 本地调试，会走代理(/localhost/dev-proxy-config)
const hostConfig = {
    localhost: {
        h5Host: 'http://m1-sit.yxzq.com',
        hzHost: '/yx-hz-host',
        jyHost: '/yx-jy-host',
        socketHost: 'ws://10.60.6.74:9800/ws',
        websiteHost: 'http://usmart-sit.usmartsecurities.com/mainland/zh-cn/market'
    },
    dev: {
        h5Host: 'http://m-dev.yxzq.com',
        hzHost: 'http://hz-dev.yxzq.com',
        jyHost: 'http://jy-dev.yxzq.com',
        socketHost: 'ws://hz-uat-wss.yxzq.com:9880/ws',
        websiteHost: 'http://usmart-dev.usmartsecurities.com/mainland/zh-cn/market'
    },
    sit: {
        h5Host: 'http://m1-sit.yxzq.com',
        hzHost: 'http://hz-sit.yxzq.com',
        jyHost: 'http://jy-sit.yxzq.com',
        socketHost: 'ws://10.60.6.74:9800/ws',
        websiteHost: 'http://usmart-sit.usmartsecurities.com/mainland/zh-cn/market'
    },
    uat: {
        h5Host: 'http://m1-uat.yxzq.com',
        hzHost: 'https://hz1-uat.yxzq.com',
        jyHost: 'http://jy-uat.yxzq.com',
        socketHost: 'ws://hz-uat-wss.yxzq.com:9880/ws',
        websiteHost: 'http://usmart-uat.usmartsecurities.com/mainland/market'
    },
    pro: {
        h5Host: 'https://m.yxzq.com',
        hzHost: 'https://hz.yxzq.com',
        jyHost: 'https://jy.yxzq.com',
        socketHost: 'wss://hz-wss.yxzq.com/ws',
        websiteHost: 'https://www.usmartsecurities8.com/mainland/market'
    }
}

const { h5Host, hzHost, jyHost, socketHost, websiteHost } = hostConfig[envName]
const project = process.env.PROJECT || 'mainland'
// 6：大陆版、7：香港版 TODO 临时处理先默认给大陆
const appType = appTypeMap[project] || '6'
// 1：简体，2：繁体，3：英文
const langType = project === 'mainland' ? langTypeMap[project] : langTypeMap[project]

const env = {
    version: '2.0.2', // 版本号，为了不暴露package.json信息，这里不取package.json的版本号
    name: envName,
    isLocal,
    isDev: envName === 'dev',
    isSit: envName === 'sit',
    isUat: envName === 'uat',
    isPro: envName === 'pro',
    h5Host,
    hzHost,
    jyHost,
    websiteHost,
    socketHost,
    langType,
    appType,
    isMainland: appType === '6',
    isHk: appType === '7',
    isLangZhCn: langType === '1',
    isLangZhHk: langType === '2',
    isLangEn: langType === '3',
    isWeb: !!process.env.IS_WEB, // 是否web浏览器打开，在electron桌面应用为false
    platform: process.platform, // win32、darwin、linux、freebsd、aix、openbsd、sunos，在浏览器中为undefined
    errorTips: '网络开小差了，请稍后重试',
    machineId: 1 // 机器码，在浏览器中为空
}

export default env
