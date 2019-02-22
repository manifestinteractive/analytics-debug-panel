import { BaseProvider } from '../base'

/**
 * Adobe Heartbeat
 * @see https://marketing.adobe.com/resources/help/en_US/sc/appmeasurement/hbvideo/
 * @class
 * @extends BaseProvider
 */
export class AdobeHeartbeatProvider extends BaseProvider {
  constructor () {
    super()
    this._id = 'ADOBE_HEARTBEAT'
    this._name = 'Heartbeat'
    this._organization = 'Adobe'
    this._type = 'analytics'
    this._urlPattern = /\.hb\.omtrdc\.net\//
  }
}
