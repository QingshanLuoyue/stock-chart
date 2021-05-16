
// vue.config.js 通用配置
module.exports = project => ({
    css: {
        loaderOptions: {
            less: {
                modifyVars: {
                    green: '#10ba70',
                    blue: '#3c78fa',
                    red: '#e72653',
                    'button-primary-background-color': '#285AC8',
                    'button-primary-color': '#EBEBEB',
                    'button-primary-border-color': '#285AC8',
                }
            },
            sass: {
                data: `@import "@/assets/theme.scss";`,
            }
        }
    }
})
