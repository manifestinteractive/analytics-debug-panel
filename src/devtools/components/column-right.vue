<template>
  <transition name="slide-fade">
    <div class="pane" id="right" v-show="showColumn">
      <header>
        <button class="toolbar-icon" @click="filterKeys" aria-label="Search Properties" aria-pressed="false" :disabled="!details">
          <i class="devtools-icon filter" :class="(showFilter || filtersApplied) ? 'active' : ''"></i>
        </button>

        <button class="toolbar-icon" aria-label="Copy to Clipboard" aria-pressed="false" v-clipboard:copy="JSON.stringify(details, null, 2)" v-clipboard:success="showCopied">
          <i class="devtools-icon code"></i>
        </button>

        <transition name="fade">
          <i class="devtools-icon checkmark copy-success active" v-if="copied"></i>
        </transition>
      </header>

      <main id="details">
        <div class="filter-bar bb" v-if="showFilter">
          <input name="search" type="search" v-model="search" placeholder="Search" autocorrect="off" />
        </div>

        <div v-if="details">
          <div v-for="(group, idx) in details">
            <div v-for="(detail, key) in group" v-if="detail && idx !== 'action' && filterResults(detail)">
              <header>{{ detail.name ? detail.name : detail.key }}</header>
              <div class="text" v-if="detail.value.charAt(0) !== '[' && detail.value.charAt(0) !== '{'">
                <span>{{ detail.value ? detail.value : '[ empty ]' }}</span>
              </div>
              <div class="text" v-if="(detail.value !== '[]' && detail.value !== '{}') && (detail.value.charAt(0) === '[' || detail.value.charAt(0) === '{')">
                <vue-json-pretty :data="JSON.parse(detail.value)" />
              </div>
              <div class="text" v-if="detail.value === '[]' || detail.value === '{}'">
                <span>{{ detail.value }}</span>
              </div>
            </div>
          </div>
          <div v-if="filterURL(raw.url)">
            <header>Request URL</header>
            <div class="text">
              <span>{{ raw.url }}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  </transition>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty'

import bus from '../../shared/bus'

export default {
  name: 'ColumnRight',
  props: {
    showColumn: {
      type: Boolean,
      default: false
    },
    providers: {
      type: Object,
      default: () => {}
    }
  },
  data: () => ({
    copied: false,
    details: null,
    raw: null,
    showFilter: false,
    filtersApplied: false,
    search: null
  }),
  mounted () {
    bus.$off('RENDER_DETAILS')
    bus.$on('RENDER_DETAILS', (data) => {
      if (!data || !data.provider) {
        this.details = null
      }

      this.raw = data

      if (data.method === 'GET') {
        this.details = data.get_parsed
      } else if (data.method === 'POST') {
        this.details = data.post_parsed
      }

      document.getElementById('details').scrollTop = 0
    })
  },
  methods: {
    filterKeys () {
      this.showFilter = !this.showFilter
    },
    filterURL (url) {
      const keyword = (this.search) ? this.search.toLowerCase().trim().split(' ') : ''

      let ignoreMatch = false
      let foundMatch = true

      this.filtersApplied = (keyword !== '')

      for (let i = 0; i < keyword.length; i++) {
        // Check if we found the search term
        if (keyword[i].charAt(0) !== '-' && !url.includes(keyword[i])) {
          foundMatch = false
        }

        // Check if we should ignore the search record
        if (keyword[i].charAt(0) === '-' && url.includes(keyword[i].substr(1))) {
          ignoreMatch = true
        }
      }

      return (foundMatch && !ignoreMatch)
    },
    filterResults (prop) {
      const keyword = (this.search) ? this.search.toLowerCase().trim().split(' ') : ''

      let ignoreMatch = false
      let foundMatch = true
      let record = ''

      this.filtersApplied = (keyword !== '')

      record = record.concat(prop.key.toLowerCase())
        .concat(' ')
        .concat(prop.name.toLowerCase())
        .concat(' ')
        .concat(prop.value.toLowerCase())

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

      return (foundMatch && !ignoreMatch)
    },
    showCopied () {
      this.copied = true
      setTimeout(() => {
        this.copied = false
      }, 2000)
    }
  },
  components: {
    VueJsonPretty
  }
}
</script>

<style lang="scss">
@import '../../shared/app';

#right {
  header {
    padding-left: 2px;

    button {
      position: relative;
      display: inline-block;
      margin: 0;
      float: left;
      position: relative;
      top: 1px;
    }
  }

  .text {
    padding: 12px;
    white-space: normal;
    word-break: break-word;
    user-select: text;
    cursor: text;
    line-height: 16px;
  }

  .filter-bar {
    height: 26px;
    display: block;
    position: sticky;
    top: 0;
    z-index: 100;
    white-space: nowrap;
    overflow: hidden;

    input {
      margin: 4px 0 0 4px;
      line-height: 16px;
      padding: 0 4px;
      width: calc(100% - 8px);

      &:focus, &:active {
        outline: none;
      }
    }
  }

  .copy-success {
    float: right;
    padding-right: 6px;
  }

  .vjs__tree {
    font-family: unset;
    font-size: unset;

    .vjs__tree__content {
      border-left: none;
    }

    .vjs__value__string {
      color: #4285f0;
    }
  }
}
</style>
