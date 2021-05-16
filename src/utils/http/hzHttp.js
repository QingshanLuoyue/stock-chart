import Http from './Http'
import env from '@/utils/env'

const hzHttp = new Http(env.hzHost, instance => {
    instance.interceptors.request.use(
        async config => {
            return config
        },
        error => Promise.reject(error)
    )
})

export default hzHttp
