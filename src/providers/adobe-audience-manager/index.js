import { BaseProvider } from '../base'

/**
 * Adobe Audience Manager
 * @see http://www.adobe.com/data-analytics-cloud/audience-manager.html
 * @class
 * @extends BaseProvider
 */
export class AdobeAudienceManagerProvider extends BaseProvider {
  constructor () {
    super()
    this._id = 'ADOBE_AUDIENCE_MANAGER'
    this._name = 'Audience Manager'
    this._organization = 'Adobe'
    this._type = 'visitorid'
    this._urlPattern = /demdex\.net\//
  }
}
