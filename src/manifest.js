module.exports = {
  name: 'Analytics Debug Panel',
  version: '1.0.0',
  description: 'Analytics Debug Panel is an Open Source browser extension to inspect, search & filter analytics traffic in your Developer Console.',
  author: 'Peter Schmalfeldt',
  manifest_version: 2,
  icons: {
    '16': 'icons/16.png',
    '48': 'icons/48.png',
    '128': 'icons/128.png'
  },
  permissions: [
    'http://*/*',
    'https://*/*',
    'storage',
    'tabs',
    'webNavigation',
    'webRequest',
    'webRequestBlocking'
  ],
  browser_action: {
    default_icon: 'icons/128.png',
    default_title: 'Analytics Debugger'
  },
  background: {
    page: 'pages/background.html'
  },
  devtools_page: 'pages/devtools.html',
  content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self'",
  web_accessible_resources: [
    'panel.html',
    'js/vendor.js',
    'js/manifest.js',
    'js/browser-polyfill.js'
  ]
}
