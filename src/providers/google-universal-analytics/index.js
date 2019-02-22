import { BaseProvider } from '../base'

/**
 * Google Universal Analytics
 * @see https://developers.google.com/analytics/devguides/collection/analyticsjs/
 * @class
 * @extends BaseProvider
 */
export class GoogleUniversalAnalyticsProvider extends BaseProvider {
  constructor () {
    super()
    this._id = 'GOOGLE_UNIVERSAL_ANALYTICS'
    this._name = 'Universal Analytics'
    this._organization = 'Google'
    this._type = 'analytics'
    this._urlPattern = /\.(google-analytics\.com|doubleclick\.net)\/(r\/)?collect(?:[\/?]+|$)/ // eslint-disable-line no-useless-escape
  }

  init () {
    this.setDictionary()
    this.setGroups()
  }

  setDictionary () {
    this._dictionary = {
      aip: 'Anonymize IP',
      an: 'Application Name',
      av: 'Application Version',
      cc: 'Campaign Content',
      cd: 'Content Description',
      ci: 'Campaign ID',
      cid: 'Client ID',
      ck: 'Campaign Keyword',
      cm: 'Campaign Medium',
      cn: 'Campaign Name',
      col: 'Checkout Step Option',
      cos: 'Checkout Step',
      cs: 'Campaign Source',
      cu: 'Currency Code',
      dclid: 'Google Display Ads ID',
      de: 'Document Encoding',
      dh: 'Document Host Name',
      dl: 'Document location URL',
      dns: 'DNS time',
      dp: 'Document Path',
      dr: 'Document Referrer',
      ds: 'Data Source',
      dt: 'Document Title',
      ea: 'Event Action',
      ec: 'Event Category',
      el: 'Event Label',
      ev: 'Event Value',
      exd: 'Exception description',
      exf: 'Is exception fatal?',
      fl: 'Flash Version',
      gclid: 'Google AdWords ID',
      ic: 'Item Code',
      in: 'Item Name',
      ip: 'Item Price',
      iq: 'Item Quantity',
      iv: 'Item Category',
      je: 'Java Enabled',
      linkid: 'Link ID',
      ni: 'Non-Interaction Hit',
      pa: 'Product Action',
      pal: 'Product Action List',
      pdt: 'Page download time',
      plt: 'Page load time',
      promoa: 'Promotion Action',
      qt: 'Queue Time',
      rrt: 'Redirect response time',
      sa: 'Social Action',
      sc: 'Session Control',
      sd: 'Screen Colors',
      sn: 'Social Network',
      sr: 'Screen Resolution',
      srt: 'Server response time',
      st: 'Social Action Target',
      t: 'Hit Type',
      ta: 'Transaction Affiliation',
      tcc: 'Coupon Code',
      tcp: 'TCP connect time',
      ti: 'Transaction ID',
      tid: 'Tracking ID',
      tr: 'Transaction Revenue',
      ts: 'Transaction Shipping',
      tt: 'Transaction Tax',
      uid: 'User ID',
      ul: 'User Language',
      utc: 'User Timing Category',
      utl: 'User timing Label',
      utt: 'User Timing Time',
      utv: 'User Timing Variable Name',
      v: 'Protocol Version',
      vp: 'Viewport Size',
      xid: 'Content Experiment ID',
      xvar: 'Content Experiment Variant',
      z: 'Cache Buster'
    }
  }

  setGroups () {
    this._groups = {
      aip: 'general',
      an: 'general',
      av: 'general',
      cc: 'campaign',
      cd: 'general',
      ci: 'campaign',
      cid: 'general',
      ck: 'campaign',
      cm: 'campaign',
      cn: 'campaign',
      col: 'ecommerce',
      cos: 'ecommerce',
      cs: 'campaign',
      cu: 'ecommerce',
      dclid: 'campaign',
      de: 'general',
      dh: 'general',
      dl: 'general',
      dns: 'timing',
      dp: 'general',
      dr: 'general',
      ds: 'general',
      dt: 'general',
      ea: 'events',
      ec: 'events',
      el: 'events',
      ev: 'events',
      exd: 'events',
      exf: 'events',
      fl: 'general',
      gclid: 'campaign',
      ic: 'ecommerce',
      in: 'ecommerce',
      ip: 'ecommerce',
      iq: 'ecommerce',
      iv: 'ecommerce',
      je: 'general',
      linkid: 'general',
      ni: 'events',
      pa: 'ecommerce',
      pal: 'ecommerce',
      pdt: 'timing',
      plt: 'timing',
      promoa: 'ecommerce',
      qt: 'general',
      rrt: 'timing',
      sa: 'events',
      sc: 'general',
      sd: 'general',
      sn: 'events',
      sr: 'general',
      srt: 'timing',
      st: 'events',
      t: 'general',
      ta: 'ecommerce',
      tcc: 'ecommerce',
      tcp: 'timing',
      ti: 'ecommerce',
      tid: 'general',
      tr: 'ecommerce',
      ts: 'ecommerce',
      tt: 'ecommerce',
      uid: 'general',
      ul: 'general',
      utc: 'timing',
      utl: 'timing',
      utt: 'timing',
      utv: 'timing',
      v: 'general',
      vp: 'general',
      xid: 'optimize',
      xvar: 'optimize',
      z: 'general'
    }
  }

  getParamType (key) {
    key = key.toLowerCase()

    if (key === 'pageview' || key === 'screenview') {
      return 'Page View'
    } else if (key === 'transaction' || key === 'item') {
      return `Ecommerce ${key.charAt(0).toUpperCase()} ${key.slice(1)}`
    } else if (key === 'dc') {
      return 'DoubleClick'
    } else {
      return `${key.charAt(0).toUpperCase()}${key.slice(1)}`
    }
  }

  parseGET (params) {
    let parsed = {}

    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        const name = this._dictionary[key] || ''
        const group = this._groups[key] || 'general'

        if (Object.keys(parsed).indexOf(group) === -1) {
          parsed[group] = []
        }

        parsed[group].push({
          key: key,
          value: params[key],
          name: name
        })
      }
    }

    let ordered = {}
    Object.keys(parsed).sort().forEach(key => {
      ordered[key] = parsed[key]
    })

    const keys = Object.keys(ordered).sort()

    keys.forEach(group => {
      // first sort by keys
      ordered[group].sort((a, b) => {
        if (a.key < b.key) return -1
        if (a.key > b.key) return 1
        return 0
      })

      // then sort by name ( some names were blank, so key sort first will sort those)
      ordered[group].sort((a, b) => {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      })
    })

    ordered.action = (params.hasOwnProperty('t')) ? this.getParamType(params['t']) : 'Page View'

    return ordered
  }

  parsePOST () {
    return {}
  }
}
