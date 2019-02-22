<template>
  <div class="pane column-main" id="center">
    <header>
      <button class="toolbar-icon left-menu" @click="togglePanel('left')" :aria-label="showLeftColumn ? 'Hide Left Sidebar' : 'Show Left Sidebar'" aria-pressed="false">
        <i class="devtools-icon" :class="showLeftColumn ? 'collpase-left' : 'expand-right'"></i>
      </button>

      <div class="center-icons">
        <button class="toolbar-icon" @click="clearLog" aria-label="Clear log" aria-pressed="false" :disabled="requestLog.length === 0">
          <i class="devtools-icon clear"></i>
        </button>

        <button class="toolbar-icon" @click="filterLog" aria-label="Filter log" aria-pressed="false" :disabled="requestLog.length === 0">
          <i class="devtools-icon filter" :class="(showFilter || filtersApplied) ? 'active' : ''"></i>
        </button>

        <div class="divider"></div>

        <span>View:</span>

        <button class="toolbar-icon" @click="toggleNavigation" :aria-label="showNavigation ? 'Hide navigation' : 'Show navigation'" aria-pressed="false" :disabled="requestLog.length === 0">
          <i class="devtools-icon file" :class="showNavigation ? 'active' : ''"></i>
        </button>

        <button class="toolbar-icon" @click="toggleListSize" :aria-label="largeList ? 'Use small rows' : 'Use large rows'" aria-pressed="false" :disabled="requestLog.length === 0">
          <i class="devtools-icon list-large" :class="largeList ? 'active' : ''"></i>
        </button>

        <button class="toolbar-icon" @click="toggleDetails" :aria-label="showDetails ? 'Hide details' : 'Show details'" aria-pressed="false" :disabled="requestLog.length === 0">
          <i class="devtools-icon waterfall" :class="showDetails ? 'active' : ''"></i>
        </button>
      </div>

      <button class="toolbar-icon right-menu" @click="togglePanel('right')" :aria-label="showRightColumn ? 'Hide Right Sidebar' : 'Show Right Sidebar'" aria-pressed="false" v-if="typeof selected === 'number'">
        <i class="devtools-icon" :class="showRightColumn ? 'collpase-right' : 'expand-left'"></i>
      </button>
    </header>

    <main>
      <div class="filter-bar bb" v-if="showFilter">
        <button class="toolbar-icon clear-filters" @click="clearFilters" :disabled="!filtersApplied" aria-label="Reset filters" aria-pressed="false">
          <i class="devtools-icon refresh"></i>
        </button>

        <div class="divider"></div>

        <div class="filter-option" :class="{ 'active': filter.type !== 'all' }">
          <label for="filter-type">Type:</label>
          <select class="toolbar-select" name="type" id="filter-type" v-model="filter.type" role="button" aria-label="Filter by type" aria-pressed="false">
            <option value="all">All</option>
            <option v-for="option in getTypes" :value="option">{{ option }}</option>
          </select>
        </div>

        <div class="divider"></div>

        <div class="filter-option" :class="{ 'active': filter.request !== 'all' }">
          <label for="filter-request">Request:</label>
          <select class="toolbar-select" name="request" id="filter-request" v-model="filter.request" role="button" aria-label="Filter by request" aria-pressed="false">
            <option value="all">All</option>
            <option value="image">Image</option>
            <option value="ping">Ping</option>
          </select>
        </div>

        <div class="divider"></div>

        <div class="filter-option" :class="{ 'active': filter.method !== 'all' }">
          <label for="filter-method">Method:</label>
          <select class="toolbar-select" name="method" id="filter-method" v-model="filter.method" role="button" aria-label="Filter by method" aria-pressed="false">
            <option value="all">All</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>

        <div class="divider"></div>

        <input name="search" type="search" v-model="filter.search" placeholder="Search" />

        <input type="checkbox" value="yes" v-model="filter.regexp" id="isRegExp" class="checkbox" :class="{ 'invalid': !validRegExp }" />
        <label for="isRegExp" :class="{ 'invalid': !validRegExp }">RegExp</label>
      </div>

      <transition name="fade">
        <div class="no-content" v-if="requestLog.length === 0">
          <div>
            <div><h1>Nothing to See Here</h1></div>
            <div>Listening for Analytics Events ...</div>
            <div><i class="devtools-icon refresh"></i></div>
          </div>
        </div>
      </transition>

      <transition name="fade">
        <div class="content-log" :class="{ 'large-list': largeList, 'small-list': !largeList, 'filter-enabled': showFilter }" v-if="requestLog.length > 0">
          <ul>
            <li class="bb-muted list-row" v-for="(request, index) in requestLog" :key="index" :class="[{ 'active': selected === request.time_stamp, 'navigation-started': request.type === 'navigation-start' }, request.action ? request.action.toLowerCase().replace(' ', '-') : '']" v-if="filterResults(request)">
              <div v-if="request.type === 'navigation-start'" class="nav-started">
                <i class="devtools-icon tag"></i>
                Navigated to &nbsp;<a :href="request.url" target="_blank">{{ request.url }}</a>
              </div>

              <div v-if="request.type !== 'navigation-start'">
                <div @click="showDetailPanel(index, request.time_stamp)">
                  <span class="action" :class="request.action.toLowerCase().replace(' ', '-')">
                    {{ request.action }}
                  </span>

                  <span class="type" :class="request.type.toLowerCase()" :title="(request.type === 'image') ? 'Tracking Pixel' : 'Network Ping'" v-if="showDetails">
                    {{ request.type }}
                  </span>

                  <span class="method" :class="request.method.toLowerCase()" :title="'HTTP ' + request.method + ' Method'" v-if="showDetails">
                    {{ request.method }}
                  </span>

                  <span class="provider-details" :class="{ 'pad': !showDetails }">
                    {{ request.provider.organization }} {{ request.provider.name }}
                  </span>

                  <span class="timestamp" :title="request.time_stamp | moment('dddd, MMMM Do YYYY, h:mm:ss A')" v-if="showDetails">
                    {{ request.time_stamp | moment('MMM Do, h:mm:ss A') }}
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </transition>
    </main>
  </div>
</template>

<script>
import browser from 'webextension-polyfill'

import bus from '../../shared/bus'

export default {
  name: 'ColumnMain',
  props: {
    showLeftColumn: {
      type: Boolean,
      default: false
    },
    showRightColumn: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    timeout: null,
    selected: null,
    largeList: false,
    showDetails: true,
    showSearch: false,
    showFilter: false,
    showNavigation: true,
    requestLog: [],
    providerFilters: [],
    validRegExp: true,
    filter: {
      type: 'all',
      request: 'all',
      method: 'all',
      search: '',
      regexp: false
    }
  }),
  mounted () {
    bus.$off('TRACK_REQUEST')
    bus.$on('TRACK_REQUEST', (request) => {
      this.requestLog.unshift(request)
      clearTimeout(this.timeout)
      this.timeout = setTimeout(this.updateScroll, 10)
    })

    bus.$off('ADP_NAV_START')
    bus.$on('ADP_NAV_START', (request) => {
      this.requestLog.unshift(request)
      clearTimeout(this.timeout)
      this.timeout = setTimeout(this.updateScroll, 10)
    })

    bus.$off('UPDATE_PROVIDER_FILTERS')
    bus.$on('UPDATE_PROVIDER_FILTERS', (filters) => {
      this.providerFilters = filters
      this.$forceUpdate()
    })

    this.clearLog()
  },
  computed: {
    getThemeName () {
      return browser.devtools.panels.themeName
    },
    filtersApplied () {
      return (this.filter.type !== 'all' || this.filter.request !== 'all' || this.filter.method !== 'all' || this.filter.search !== '')
    },
    getTypes () {
      let types = []

      for (let request in this.requestLog) {
        const action = this.requestLog[request].action
        if (action && types.indexOf(action) === -1) {
          types.push(action)
        }
      }

      types.sort()

      return types
    }
  },
  methods: {
    updateScroll () {
      const active = document.querySelector('li.list-row.active')

      if (active) {
        active.scrollIntoView({ block: 'end', inline: 'nearest' })
      }
    },
    togglePanel (col) {
      this.$emit('togglePanel', col)
      if (col === 'right') {
        this.selected = null
      }
    },
    toggleListSize () {
      this.largeList = !this.largeList

      if (this.largeList) {
        this.$emit('listSizeChanged', 'large')
      } else {
        this.$emit('listSizeChanged', 'small')
      }
    },
    toggleDetails () {
      this.showDetails = !this.showDetails

      if (this.showDetails) {
        this.$emit('showDetails')
      } else {
        this.$emit('hideDetails')
      }
    },
    toggleNavigation () {
      this.showNavigation = !this.showNavigation

      if (this.showNavigation) {
        this.$emit('showNavigation')
      } else {
        this.$emit('hideNavigation')
      }
    },
    clearLog () {
      this.$emit('clearLog')
      this.requestLog = []
      this.showFilter = false
      this.clearFilters()
      this.selected = null

      bus.$emit('CLEAR_REQUEST_LOG')
      this.$emit('toggleRightPanel', false)
    },
    filterLog () {
      this.showFilter = !this.showFilter
      this.showSearch = false

      if (this.showFilter) {
        this.$emit('showFilter')
      } else {
        this.$emit('hideFilter')
      }
    },
    showDetailPanel (id, selected) {
      this.selected = (this.selected === selected) ? null : selected
      this.$emit('toggleRightPanel', this.selected !== null)

      bus.$emit('RENDER_DETAILS', this.requestLog[id])
    },
    filterResults (request) {
      if (((this.showFilter && this.filtersApplied) || !this.showNavigation) && request.type === 'navigation-start') {
        return false
      }

      let showResult = true

      if (this.filter.type !== 'all' && request.action !== this.filter.type) {
        showResult = false
      }

      if (this.filter.request !== 'all' && request.type !== this.filter.request) {
        showResult = false
      }

      if (this.filter.method !== 'all' && request.method !== this.filter.method) {
        showResult = false
      }

      if (this.filter.search !== '') {
        let ignoreMatch = false
        let foundMatch = true
        let record = ''
        let search = this.filter.search

        record = record.concat(request.provider.organization.toLowerCase())
          .concat(' ')
          .concat(request.provider.name.toLowerCase())
          .concat(' ')
          .concat(request.action.toLowerCase())
          .concat(' ')
          .concat(request.method.toLowerCase())
          .concat(' ')
          .concat(request.type.toLowerCase())
          .concat(' ')
          .concat(request.url.toLowerCase())

        if (this.filter.regexp) {
          let regex
          try {
            if (search.charAt(0) !== '/' && (search.charAt(search.length - 1) !== '/' || search.charAt(search.length - 2) !== '/' || search.charAt(search.length - 3) !== '/')) {
              search = `/${search}/`
            }
            // eslint-disable-next-line
            regex = Function('"use strict"; return ' + search.toString())()
          } catch (error) {
            if (error) {
              this.validRegExp = false
            }
          }

          if (typeof regex !== 'undefined' && regex.constructor === RegExp) {
            foundMatch = regex.test(record)
            this.validRegExp = true
          } else {
            this.validRegExp = false
          }
        } else {
          this.validRegExp = true

          const keyword = this.filter.search.toLowerCase().trim().split(' ')

          for (let i = 0; i < keyword.length; i++) {
            // Check if we found the search term
            if (keyword[i].charAt(0) !== '-' && !record.includes(keyword[i])) {
              foundMatch = false
            }

            // Check if we should ignore the search record
            if (keyword[i].charAt(0) === '-' && record.includes(keyword[i].substr(1))) {
              ignoreMatch = true
            }
          }
        }

        if (!foundMatch || ignoreMatch) {
          showResult = false
        }
      }

      // check overall provider filters
      if (request.provider) {
        const org = request.provider.organization.toUpperCase()
        const id = request.provider.id.toUpperCase()

        if (!this.providerFilters[org] || !this.providerFilters[id]) {
          showResult = false
        }
      }

      return showResult
    },
    clearFilters () {
      this.filter.type = 'all'
      this.filter.request = 'all'
      this.filter.method = 'all'
      this.filter.search = ''
      this.filter.regexp = false
      this.validRegExp = true
    }
  }
}
</script>

<style lang="scss">
@import '../../shared/app';

.column-main {
  position: relative;

  header {
    text-align: center;

    .left-menu {
      float: left;
      position: relative;
      top: 1px;
    }

    .right-menu {
      float: right;
      position: relative;
      top: 1px;
    }

    .center-icons {
      width: 50%;
      display: inline-block;
      font-size: 0;
      line-height: 0;
      white-space: nowrap;
      margin: 0 auto;

      span {
        font-size: 12px;
        line-height: 12px;
        font-weight: 400;
        position: relative;
        top: 8px;
        vertical-align: top;
        display: inline-block;
        margin-left: 8px;
        margin-right: 4px;
      }

      button {
        display: inline-block;
        font-size: 0;
        position: relative;
        top: -1px;

        &:disabled {
          pointer-events: none;
          opacity: 0.25;
        }
      }
    }
  }

  .filter-bar {
    height: 26px;
    display: block;
    position: sticky;
    top: 0;
    z-index: 100;
    white-space: nowrap;
    overflow: hidden;

    .refresh {
      transform: scaleX(-1);
    }

    .divider {
      float: left;
      opacity: 0.5;
    }

    .clear-filters {
      float: left;

      &:disabled {
        cursor: none;
        pointer-events: none;
        opacity: 0.25;
      }
    }

    .checkbox {
      width: 22px;
    }

    label.invalid {
      color: #DB4437;
    }

    input {
      border: 1px solid transparent;
      margin: 4px 0 0 4px;
      line-height: 16px;
      padding: 0 4px;
      width: 180px;

      &:focus, &:active {
        outline: none;
      }
    }
  }

  .filter-option {
    line-height: 26px;
    padding: 0 6px;
    display: inline-block;
    font-size: 12px;
    font-weight: 500;
    float: left;

    .active {
      font-weight: 700;

      select {
        font-weight: 700;
      }
    }
  }

  .no-content {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;

    h1 {
      font-weight: 400;
      font-size: 26px;
    }

    div {
      width: 100%;
      display: block;
      line-height: 32px;
    }

    a {
      color: #4285f0;
      text-decoration: none;
    }

    .devtools-icon {
      background-color: #4285f0 !important;
      line-height: 24px;
      display: inline-block;
      vertical-align: middle;

      &.refresh {
        animation: spin 2s infinite linear;
      }
    }
  }

  .content-log {
    font-weight: 500;
    height: calc(100vh - 27px);
    position: absolute;
    top: 27px;
    overflow: auto;
    width: 100%;

    .list-row {
      opacity: 0.3;
      transition: opacity 0.25s ease;
      white-space: nowrap;
      overflow: hidden;

      &.navigation-started {
        font-weight: 500;
        font-size: 12px;
        white-space: nowrap;
        margin-left: 6px;

        &:hover {
          background-color: transparent;
        }
      }

      &:nth-child(1), &:nth-child(2), &:nth-child(3), &:nth-child(4), &:nth-child(5) {
        opacity: 1;
      }

      &:nth-child(6) {
        opacity: 0.9;
      }

      &:nth-child(7) {
        opacity: 0.8;
      }

      &:nth-child(8) {
        opacity: 0.7;
      }

      &:nth-child(9) {
        opacity: 0.6;
      }

      &:nth-child(10) {
        opacity: 0.5;
      }

      &:nth-child(11) {
        opacity: 0.4;
      }

      &.active, &:hover {
        opacity: 1;
      }

      &.active {
        background-color: rgba(100,100,100,.25);

        .timestamp {
  				opacity: 1;
  			}

        &.page-view {
          background-color: rgba(100,100,100,.25);
        }

        &.doubleclick {
          background-color: #37a655;
        }

        &.event {
          background-color: #4285f0;
        }

        &.cart-add,
        &.checkout,
        &.contact,
        &.customize,
        &.donate,
        &.find-location,
        &.lead,
        &.microdata,
        &.payment-info,
        &.purchase,
        &.registration,
        &.schedule,
        &.search,
        &.start-trial,
        &.submit,
        &.subscribe,
        &.subscribed,
  			&.view-content,
        &.wishlist-add {
  				background-color: #37a655;
  			}
      }

      .provider-details {
        &.pad {
          padding-left: 8px;
        }
      }

      .nav-started {
        width: calc(100% - 14px);
        text-overflow: ellipsis;
        overflow: hidden;
        cursor: default;

        i {
          float: left;
          position: relative;
          top: 2px;
          left: -4px;
        }

        a {
          color: #999999;
          text-decoration: none;

          &:hover {
            color: #4285f0;
          }
        }
      }
    }

    &.filter-enabled {
      height: calc(100vh - 53px);
      top: 53px;
    }

    &.large-list {
      li {
        height: 51px;
        line-height: 50px;

        div {
          margin: 0 14px;
        }
      }
    }
    &.small-list {
      li {
        height: 31px;
        line-height: 30px;

        div {
          margin: 0 6px;
        }
      }
    }

    .type, .method, .action {
      font-size: 10px;
      text-transform: uppercase;
      text-align: left;
      display: inline-block;
      letter-spacing: 0.5px;
    }

    .action {
      width: 100px;
      text-align: center;
      height: 20px;
      line-height: 20px;
      color: #FFF;
      border-radius: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      background-color: #111;
      padding: 0 4px;
      position: relative;
      top: 5px;

      &.page-view {
        background-color: rgba(100,100,100,.25);
      }

      &.doubleclick {
        background-color: #37a655;
      }

      &.event {
        background-color: #4285f0;
      }

      &.cart-add,
      &.checkout,
      &.contact,
      &.customize,
      &.donate,
      &.find-location,
      &.lead,
      &.microdata,
      &.payment-info,
      &.purchase,
      &.registration,
      &.schedule,
      &.search,
      &.start-trial,
      &.submit,
      &.subscribe,
      &.subscribed,
      &.view-content,
      &.wishlist-add {
        background-color: #37a655;
      }
    }

    .type {
      width: 46px;
      margin-left: 10px;
    }

    .method {
      width: 36px;
    }

    .timestamp {
      display: inline-block;
      float: right;
      opacity: 0.35;
    }

    .active {
      .timestamp {
        opacity: 1;
      }
    }
  }
}
@keyframes spin {
  from { transform:rotate(0deg); }
  to { transform:rotate(360deg); }
}
@media (max-width: 960px) {
  .filter-bar {
    label {
      display: none;
    }
  }
}
</style>
