import browser from 'webextension-polyfill'
import url from 'url'

import { AnalyticsDebugPort } from './port'

(() => {
  /**
   * Keep Track of Tabs
   * @type {Object}
   */
  let tabs = {}

  /**
   * Make sure this is the tab is one of ours
   * @param tabId
   * @return {boolean}
   */
  const isAnalyticsDebugTab = (tabId) => {
    return (tabId !== -1 && tabId in tabs)
  }

  /**
   * Take user to Welcome Page when installing this Extension for Support Info
   */
  browser.runtime.onInstalled.addListener((request) => {
    if (request.reason === 'install') {
      browser.tabs.create({
        url: 'https://github.com/redvanworkshop/analytics-debug-panel#installation'
      })
    }
  })

  /**
   * Connect to Analytics Debug Panel
   * @type {AnalyticsDebugPort}
   */
  browser.runtime.onConnect.addListener(async (details) => {
    let port = new AnalyticsDebugPort(details)

    if (!port.isAnalyticsPanel) {
      return
    }

    tabs = port.init(tabs)
  })

  /**
   * Check if a tab we are using the extension on is about to navigate
   */
  browser.webNavigation.onBeforeNavigate.addListener((request) => {
    // Exit if this is not one of our tabs
    if (!isAnalyticsDebugTab(request.tabId)) {
      return
    }

    tabs[request.tabId].port.postMessage({ type: 'adp-web-nav-start', request: request })
  })

  /**
   * Check if a tab we are using the extension on has completed its navigation
   */
  browser.webNavigation.onCompleted.addListener((request) => {
    // Exit if this is not one of our tabs
    if (!isAnalyticsDebugTab(request.tabId)) {
      return
    }

    tabs[request.tabId].port.postMessage({ type: 'adp-web-nav-complete', request: request })
  })

  /**
   * Track Web Requests and Capture GET & POST data for Analytics Debugging
   */
  browser.webRequest.onBeforeRequest.addListener(
    (request) => {
      // Exit if this is not one of our tabs
      if (!isAnalyticsDebugTab(request.tabId)) {
        return
      }

      if (request.method === 'GET' || request.method === 'POST') {
        request.post_params = null
        request.get_params = null

        // Parse GET Params from request
        const urlData = url.parse(request.url, true)

        if (urlData.query) {
          request.get_params = urlData.query || null
        }

        // Decode & Parse POST Params from Request
        if (request.method === 'POST' && request.requestBody) {
          let enc = new TextDecoder('utf-8')
          let post = ''

          for (let i = 0; i < request.requestBody.raw.length; i++) {
            post += enc.decode(new Uint8Array(request.requestBody.raw[i].bytes))
          }

          let params = decodeURIComponent(post).split('$')

          request.post_params = {}

          for (let i = 0; i < params.length; i++) {
            if (params[i] === '') {
              continue
            }

            const param = params[i].split('=')

            request.post_params[param[0]] = param[1]
          }
        }

        // Pass data to Panel
        tabs[request.tabId].port.postMessage({ type: 'adp-web-request', request: request })
      }
    },
    {
      urls: ['<all_urls>']
    },
    [
      'requestBody',
      'blocking'
    ]
  )
})()
