/**
 * Class to handle Communication Between Panel and Page
 * @type {AnalyticsDebugPort}
 */
export class AnalyticsDebugPort {
  constructor (details) {
    this._name = details.name
    this._port = details
  }

  /**
   * Get the port ID
   * @return {string}
   */
  get id () {
    return this._name.split('-').pop()
  }

  /**
   * Check if this tab belongs to Analytics Debug Panel
   * @return {boolean}
   */
  get isAnalyticsPanel () {
    return /^analytics-debug-panel-\d+$/.test(this.name)
  }

  /**
   * Get the port name
   * @return {string}
   */
  get name () {
    return this._name
  }

  /**
   * Get the browser extension port
   * @return {object}
   */
  get port () {
    return this._port
  }

  /**
   * Initialize the tab
   * @param tabs Object The currently open tabs
   * @return {object}
   */
  init (tabs = {}) {
    tabs[this.id] = this

    // Delete tab when panel disconnects
    this.port.onDisconnect.addListener((port) => {
      delete tabs[this.id]
    })

    return tabs
  }
}
