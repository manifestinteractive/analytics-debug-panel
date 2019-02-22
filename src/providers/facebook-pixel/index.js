import { BaseProvider } from '../base'

/**
 * Facebook Pixel
 * @see https://developers.facebook.com/docs/facebook-pixel
 * @class
 * @extends BaseProvider
 */
export class FacebookPixelProvider extends BaseProvider {
  constructor () {
    super()
    this._id = 'FACEBOOK_PIXEL'
    this._name = 'Pixel'
    this._organization = 'Facebook'
    this._type = 'marketing'
    this._urlPattern = /facebook\.com\/tr\/?\?/
  }

  init () {
    this.setDictionary()
    this.setGroups()
  }

  setDictionary () {
    this._dictionary = {
      'cd[buttonFeatures]': 'Button Features',
      'cd[buttonText]': 'Button Text',
      'cd[content_category]': 'Content Category',
      'cd[content_ids]': 'Product IDs',
      'cd[content_name]': 'Content Name',
      'cd[content_type]': 'Content Type',
      'cd[contents]': 'Contents',
      'cd[currency]': 'Currency',
      'cd[DataLayer]': 'Data Layer',
      'cd[formFeatures]': 'Form Features',
      'cd[JSON-LD]': 'JSON-LD',
      'cd[Meta]': 'Meta',
      'cd[num_items]': 'Quantity',
      'cd[OpenGraph]': 'OpenGraph',
      'cd[pageFeatures]': 'Page Features',
      'cd[Schema.org]': 'Schema.org',
      'cd[search_string]': 'Search Keyword',
      'cd[status]': 'Registration Status',
      'cd[value]': 'Value',
      'dl': 'Page URL',
      'ec': 'Event Count',
      'ev': 'Event Type',
      'id': 'Pixel ID',
      'if': 'In an iFrame',
      'it': 'Initialized Timestamp',
      'r': 'Code Branch',
      'rl': 'Referring URL',
      'rqm': 'Request Method',
      'sh': 'Screen Height',
      'sw': 'Screen Width',
      'ts': 'Timestamp',
      'ud[uid]': 'User ID',
      'v': 'Pixel Version'
    }
  }

  setGroups () {
    this._groups = {
      'cd[buttonFeatures]': 'subscribed',
      'cd[buttonText]': 'subscribed',
      'cd[content_category]': 'custom',
      'cd[content_ids]': 'products',
      'cd[content_name]': 'custom',
      'cd[content_type]': 'custom',
      'cd[contents]': 'cart',
      'cd[currency]': 'custom',
      'cd[DataLayer]': 'microdata',
      'cd[formFeatures]': 'subscribed',
      'cd[JSON-LD]': 'microdata',
      'cd[Meta]': 'microdata',
      'cd[num_items]': 'custom',
      'cd[OpenGraph]': 'microdata',
      'cd[pageFeatures]': 'subscribed',
      'cd[Schema.org]': 'microdata',
      'cd[search_string]': 'custom',
      'cd[status]': 'custom',
      'cd[value]': 'custom',
      'dl': 'general',
      'ec': 'other',
      'ev': 'general',
      'id': 'general',
      'if': 'other',
      'it': 'other',
      'r': 'other',
      'rl': 'general',
      'rqm': 'general',
      'sh': 'other',
      'sw': 'other',
      'ts': 'general',
      'ud[uid]': 'general',
      'v': 'other'
    }
  }

  getParamType (key) {
    key = key.toLowerCase()

    if (key === 'pageview') {
      return 'Page View'
    } else if (key === 'viewcontent') {
      return 'View Content'
    } else if (key === 'addtocart') {
      return 'Cart Add'
    } else if (key === 'addpaymentinfo') {
      return 'Payment Info'
    } else if (key === 'addtowishlist') {
      return 'Wishlist Add'
    } else if (key === 'completeregistration') {
      return 'Registration'
    } else if (key === 'contact') {
      return 'Contact'
    } else if (key === 'customizeproduct') {
      return 'Customize'
    } else if (key === 'donate') {
      return 'Donate'
    } else if (key === 'findlocation') {
      return 'Find Location'
    } else if (key === 'initiatecheckout') {
      return 'Checkout'
    } else if (key === 'lead') {
      return 'Lead'
    } else if (key === 'purchase') {
      return 'Purchase'
    } else if (key === 'schedule') {
      return 'Schedule'
    } else if (key === 'search') {
      return 'Search'
    } else if (key === 'starttrial') {
      return 'Start Trial'
    } else if (key === 'submitapplication') {
      return 'Submit'
    } else if (key === 'subscribe') {
      return 'Subscribe'
    } else if (key === 'subscribedbuttonclick') {
      return 'Subscribed'
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

    ordered.action = (params.hasOwnProperty('ev')) ? this.getParamType(params['ev']) : 'Page View'

    return ordered
  }
}
