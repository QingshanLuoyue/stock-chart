import Vue from 'vue'
import App from './App.vue'
import i18n from '@/utils/i18n'
Vue.use(i18n)

Vue.config.productionTip = false

new Vue({
    render: h => h(App),
}).$mount('#app')
