import Vue from "vue";
import App from "./App.vue";
import { setCacheConfig, setChainConfig } from "iam-client-lib";
import { config } from "./config";

Vue.config.productionTip = false;
Vue.use({
  install: () => {
    setCacheConfig(config.chainId, {
      url: config.cacheServerUrl,
    });
    setChainConfig(config.chainId, {
      rpcUrl: config.chainRpcUrl,
    });
  },
});

new Vue({
  render: (h) => h(App)
}).$mount("#app");
