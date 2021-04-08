import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false
//Vue.component('star-rating', VueStarRating.default);

//import mock from './mock-data.js'

let data = {
  collection: [],
  circulating: [],
  currentUser: null,
}

new Vue({
  router,
  data,
  render: h => h(App)
}).$mount('#app')
