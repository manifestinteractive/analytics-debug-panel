/**
 * Base Provider
 * @class
 */
export class BaseProvider {
  constructor () {
    /**
     * ========================================
     * Information about Provider
     * ========================================
     */

    /**
     * Unique ID for the Provider
     * @type {String}
     */
    this._id = ''

    /**
     * Name of the Providers Service
     * @type {String}
     */
    this._name = ''

    /**
     * Name of the Providers Organization
     * @type {String}
     */
    this._organization = ''

    /**
     * What Kind of Provider Service is this ( from `types` key in `type` method  )
     * @type {String}
     */
    this._type = ''

    /**
     * RegExp Pattern that matches all URL's for this Provider's Library
     * @type {RegExp}
     */
    this._urlPattern = /.*/

    /**
     * ========================================
     * Information about Request
     * ========================================
     */

    /**
     * Parsed GET Params from Network Request
     * @type {Object}
     */
    this._GET = {}

    /**
     * Parsed POST Params from Network Request
     * @type {Object}
     */
    this._POST = {}

    /**
     * Mapping of Variable Names to Descriptions
     * @type {Object}
     */
    this._dictionary = {}

    /**
     * Mapping of Variable Names to `output.listing` group
     * @type {Object}
     */
    this._groups = {}

    /**
     * @TODO: Use this for possible integration suggestions, e.g. invalid requests, missing params, etc
     * @type {Array}
     */
    this._recommendations = []

    /**
     * ========================================
     * Standardized Output
     * ========================================
     */
    this._output = {
      event: null,
      service: null,
      account: null,
      timestamp: null,
      listing: {
        campaign: {},
        customConversion: {},
        customDimensions: {},
        customTraffic: {},
        ecommerce: {},
        events: {},
        general: {},
        hierarchy: {},
        optimize: {},
        other: {},
        products: {},
        summary: {},
        timing: {}
      }
    }

    this.init()
  }

  /**
   * Get Provider ID
   * @return {string}
   */
  get id () {
    return this._id
  }

  /**
   * Get Provider Name
   * @return {string}
   */
  get name () {
    return this._name
  }

  /**
   * Get Provider Organization
   * @return {string}
   */
  get organization () {
    return this._organization
  }

  /**
   * Get Provider Type
   * @return {string}
   */
  get type () {
    let types = {
      'analytics': 'Analytics',
      'marketing': 'Marketing',
      'tagmanager': 'Tag Manager',
      'testing': 'UX Testing',
      'visitorid': 'Visitor Identification'
    }

    return types[this._type] || 'Unknown'
  }

  /**
   * Get Provider URL Pattern
   * @return {RegExp}
   */
  get urlPattern () {
    return this._urlPattern
  }

  /**
   * Dictionary of Query Params to more meaningful terms
   * @return {Object}
   */
  get dictionary () {
    return this._dictionary
  }

  /**
   * Init Provider
   * @return {Object}
   */
  init () {
    return {}
  }

  /**
   * Parse GET Data
   * @return {Object}
   */
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

    return ordered
  }

  /**
   * Parse POST Data
   * @return {Object}
   */
  parsePOST () {
    return {}
  }

  setDictionary () {
    this._dictionary = {}
  }

  setGroups () {
    this._groups = {}
  }

  setRecommendations () {
    this._recommendations = []
  }
}
