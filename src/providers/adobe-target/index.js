import { BaseProvider } from '../base'

/**
 * Adobe Target
 * @see http://www.adobe.com/marketing-cloud/target.html
 * @class
 * @extends BaseProvider
 */
export class AdobeTargetProvider extends BaseProvider {
  constructor () {
    super()
    this._id = 'ADOBE_TARGET'
    this._name = 'Target'
    this._organization = 'Adobe'
    this._type = 'testing'
    this._urlPattern = /\.tt\.omtrdc\.net\/(?!cdn\/)/
  }
}
