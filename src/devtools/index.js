import browser from 'webextension-polyfill'

(() => {
  const panelIcon = (browser.devtools.panels.themeName === 'dark') ? '/icons/panel-dark.png' : '/icons/panel-light.png'
  const tabId = browser.devtools.inspectedWindow.tabId

  browser.devtools.panels.create('Analytics', panelIcon, '/pages/panel.html').then(panel => {
    let panelWindow = null
    let queuedMessages = []
    let port = browser.runtime.connect({
      name: 'analytics-debug-panel-' + tabId
    })

    port.onMessage.addListener((msg) => {
      if (panelWindow) {
        panelWindow.AnalyticsDebugPanel.handleMessage({ type: 'adp-panel-message', message: msg })
      } else {
        queuedMessages.push(msg)
      }
    })

    let listener = (win) => {
      panel.onShown.removeListener(listener)
      panelWindow = win

      let msg
      while ((msg = queuedMessages.shift())) {
        panelWindow.AnalyticsDebugPanel.handleMessage({ type: 'adp-panel-message', message: msg })
      }

      panelWindow.AnalyticsDebugPanel.sendMessage = (...data) => {
        port.postMessage(data)
      }
    }

    panel.onShown.addListener(listener)
  })
})()
