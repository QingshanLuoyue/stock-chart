import axios from 'axios'
import env from '../env'
import qs from 'qs'
import { guid } from '@/utils/tools'
import {systemType} from '@/utils/utils'
const errSysTipMap = {
    1: '系统繁忙，请稍后再试',
    2: '系統繁忙，請稍後再試',
    3: 'System is busy. Please try later'
}
const errNetTipMap = {
    1: '网络繁忙，请稍后重试',
    2: '網絡繁忙，請稍後重試',
    3: 'Network is busy. Please try later'
}
let xDt = systemType === 'windows' ? 'win' : 'mac'
export default class Http {
    constructor(baseUrl, callback) {
        console.log('baseUrl :>> ', baseUrl)
        this.headers = {
            // 当前版本，与APP不一致，可能部分接口会存在版本区别对待，需要相应接口做兼容
            'X-Ver': env.version,

            'X-Dt': xDt,

            // 用户设备ID
            'X-Dev-Id': env.machineId,

            // wiff：n1，2G：n2，3G：n3，4G：n4、5G：n5
            'X-Net-Type': '',

            // 1-简体(默认)，2-繁体，3-英语
            'X-Lang': env.langType,

            'X-Type': env.appType,
            // 'X-Type': 2,

            // 设备信息
            'X-Dev-Info': env.isWeb ? 'electron-web' : 'electron-app'
        }

        // 实例
        const instance = axios.create({ timeout: 10000 })
        if (typeof callback === 'function') {
            callback(instance)
        }

        // 请求拦截
        instance.interceptors.request.use(
            async config => {
                config.headers['X-Time'] = Date.now()
                config.headers['X-Request-Id'] = guid()
                config.headers['X-Trans-Id'] = guid()
                config.headers = {
                    ...this.headers,
                    Authorization: 'bus.token',
                    'X-Uid': 'bus.uuid',
                    ...config.headers
                }
                return config
            },
            error => Promise.reject(error)
        )

        // 返回拦截
        instance.interceptors.response.use(
            res => {
                if (res.data.code === 0) {
                    return res.data.data
                }
                return Promise.reject(res.data)
            },
            error => {
                let errorTip
                if (typeof error === 'object' && error.message === 'Network Error') {
                    // 网络报错
                    errorTip = errNetTipMap[env.langType]
                } else {
                    // 后台系统报错
                    errorTip = errSysTipMap[env.langType]
                }
                let rejectData = {
                    code: error.code || error.status,
                    msg: errorTip
                }
                return Promise.reject(rejectData)
            }
        )

        instance.defaults.baseURL = baseUrl

        this.get = url => (data, config) => instance.get(url, { params: data, ...config })
        this.post = url => (data, config) => instance.post(url, data, config)
        this.put = url => (data, config) => instance.put(url, data, config)
        this.getForm = url => (data, config = {}) => {
            const { headers, ...otherConfig } = config
            const currHeaders = {
                'Content-Type': 'application/x-www-form-urlencoded',
                ...headers
            }
            return instance({
                params: data,
                url,
                method: 'get',
                headers: currHeaders,
                data: {},
                ...otherConfig
            })
        }
        this.postForm = url => (data, config = {}) => {
            const { headers, ...otherConfig } = config
            const currHeaders = {
                'Content-Type': 'application/x-www-form-urlencoded',
                ...headers
            }
            return instance({
                url,
                method: 'post',
                headers: currHeaders,
                data: qs.stringify(data),
                ...otherConfig
            })
        }
    }

    createPrefix(prefix) {
        return new Proxy(this, {
            get(target, prop) {
                if (typeof target[prop] === 'function') {
                    return path => target[prop](prefix + path)
                }
                return target[prop]
            }
        })
    }
}
