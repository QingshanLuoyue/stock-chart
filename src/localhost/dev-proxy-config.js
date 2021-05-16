module.exports = {
    '/yx-hz-host': {
        target: 'http://hz1-uat.yxzq.com',
        pathRewrite: { '^/yx-hz-host': '' }
    },
    '/yx-jy-host': {
        target: 'http://jy1-uat.yxzq.com',
        pathRewrite: { '^/yx-jy-host': '' },
        changeOrigin: true // 交易服务器，不传此参数，接口404，原因待查
    }
}
