import Vue from 'vue'
import App from './App.vue'
import {
  IAM,
  setCacheClientOptions,
  setChainConfig,
} from "iam-client-lib"

Vue.config.productionTip = false
Vue.use({
  install: () => {
    setCacheClientOptions(73799, {
      url: "https://volta-identitycache.energyweb.org/",
    });
    setChainConfig(73799, {
      rpcUrl: "https://volta-rpc.energyweb.org",
    });
    Vue.prototype.$IAM = new IAM()
  },
})

new Vue({
  render: (h) => h(App),
}).$mount('#app')
