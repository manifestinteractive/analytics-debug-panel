import { AdobeAnalyticsProvider } from './adobe-analytics'
import { AdobeAudienceManagerProvider } from './adobe-audience-manager'
import { AdobeHeartbeatProvider } from './adobe-heartbeat'
import { AdobeTargetProvider } from './adobe-target'
import { FacebookPixelProvider } from './facebook-pixel'
import { GoogleUniversalAnalyticsProvider } from './google-universal-analytics'

export const adobeAnalytics = new AdobeAnalyticsProvider()
export const adobeAudienceManager = new AdobeAudienceManagerProvider()
export const adobeHeartbeat = new AdobeHeartbeatProvider()
export const adobeTarget = new AdobeTargetProvider()
export const facebookPixel = new FacebookPixelProvider()
export const googleUniversalAnalytics = new GoogleUniversalAnalyticsProvider()
