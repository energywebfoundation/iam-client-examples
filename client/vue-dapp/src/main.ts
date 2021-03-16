import Vue from 'vue'
import App from './App.vue'
import { IAM, CacheServerClient } from 'iam-client-lib'

Vue.config.productionTip = false
Vue.use({
  install: () => {
    Vue.prototype.$IAM = new IAM({
      rpcUrl: 'https://volta-rpc.energyweb.org',
      chainId: 73799,
      cacheClient: new CacheServerClient({
        url: 'https://volta-identitycache.energyweb.org/',
      }),
    })
  },
})

new Vue({
  render: (h) => h(App),
}).$mount('#app')
