import { BaseProvider } from '../base'

/**
 * Adobe Analytics
 * @see http://www.adobe.com/data-analytics-cloud/analytics.html
 * @class
 * @extends BaseProvider
 */
export class AdobeAnalyticsProvider extends BaseProvider {
  constructor () {
    super()
    this._id = 'ADOBE_ANALYTICS'
    this._name = 'Analytics'
    this._organization = 'Adobe'
    this._type = 'analytics'
    this._urlPattern = /\/b\/ss\/|\.2o7\.net\/|\.sc\d?\.omtrdc\.net\//
  }

  init () {
    this.setDictionary()
    this.setGroups()
  }

  setDictionary () {
    this._dictionary = {
      'c([0-9]{1,3})': 'prop',
      'cc': 'Currency Code',
      'ce': 'Char Set',
      'ch': 'Site Section',
      'events': 'Events',
      'g': 'Current URL',
      'l([0-9]{1,2})': 'List eVar',
      'pageName': 'Page Name',
      'pageType': 'Page Type',
      'products': 'Products',
      'purchaseID': 'Purchase ID',
      'server': 'Server',
      'tnt': 'TnT Campaign',
      'v([0-9]{1,3})': 'eVar',
      'v0': 'Campaign',
      'vid': 'Manualy set visitor ID',
      'xact': 'Transaction ID',
      'zip': 'Zip'
    }
  }

  setGroups () {
    this._groups = {}
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

    return parsed
  }

  parsePOST () {
    return {}
  }
}
