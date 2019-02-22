import browser from 'webextension-polyfill'
import Vue from 'vue'
import VueClipboard from 'vue-clipboard2'
import VueMoment from 'vue-moment'

import DevTools from './index.vue'

import bus from '../shared/bus'
import store from '../store'

window.AnalyticsDebugPanel = (() => {
  Vue.config.productionTip = false

  // Add Chrome Theme to Body
  if (browser.devtools.panels) {
    document.body.classList.add(browser.devtools.panels.themeName)
  }

  // Use Clipboard
  Vue.use(VueClipboard)

  // Use Moment
  Vue.use(VueMoment)

  /* eslint-disable no-new */
  new Vue({
    el: '#analytics-debugger',
    store,
    render: h => h(DevTools)
  })

  return {
    handleMessage (data) {
      if (data.type === 'adp-panel-message') {
        if (data.message.type === 'adp-web-request') {
          bus.$emit('ADP_WEB_REQUEST', data.message.request)
        } else if (data.message.type === 'adp-web-nav-start') {
          if (data.message.request.frameId === 0 && data.message.request.parentFrameId === -1 && (data.message.request.url.startsWith('http://') || data.message.request.url.startsWith('https://'))) {
            bus.$emit('ADP_NAV_START', { type: 'navigation-start', url: data.message.request.url })
          }
        } else if (data.message.type === 'adp-toggle-debugger') {
          bus.$emit('ADP_TOGGLE_DEBUGGER', data.message.enabled)
        } else if (data.message.type === 'adp-init') {
          bus.$emit('ADP_INIT', data.message.tab)
        }
      }
    }
  }
})()
