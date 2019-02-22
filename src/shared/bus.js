import Vue from 'vue'

import * as providers from '../providers'

const bus = new Vue({
  methods: {
    getProviders () {
      let providerList = {}

      for (let key in providers) {
        let slug = providers[key].organization.toUpperCase().replace(' ', '_')

        if (typeof providerList[slug] === 'undefined') {
          providerList[slug] = {
            organization: providers[key].organization,
            services: []
          }
        }

        providerList[slug]['services'].push({
          id: providers[key].id,
          name: providers[key].name,
          organization: providers[key].organization,
          type: providers[key].type,
          urlPattern: providers[key].urlPattern
        })
      }

      return providerList
    },
    handleRequest (request) {
      for (let key in providers) {
        const provider = providers[key]
        const match = provider.urlPattern.test(request.url)
        const getParsed = provider.parseGET(request.get_params)
        const postParsed = provider.parsePOST(request.post_params)

        let action = (request.method === 'GET') ? getParsed.action : postParsed.action

        if (!action) {
          action = 'Page View'
        }

        if (match) {
          const response = {
            tab: request.tabId,
            type: request.type,
            action: action,
            method: request.method,
            request_id: request.requestId,
            url: request.url,
            provider: {
              id: provider.id,
              name: provider.name,
              organization: provider.organization,
              type: provider.type
            },
            get_parsed: getParsed,
            get_params: request.get_params,
            post_params: request.post_params,
            post_parsed: postParsed,
            time_stamp: request.timeStamp
          }

          this.$emit('TRACK_REQUEST', response)
          this.$emit('UPDATE_PROVIDER_COUNT', provider.organization.toUpperCase().replace(' ', '_'))

          return response
        }
      }
    }
  }
})

export default bus
