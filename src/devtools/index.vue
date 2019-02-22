<template>
  <div class="vertical-panes analytics-debug-panel">
    <column-left
      :debugEnabled="debugEnabled"
      :showColumn="showLeft"
      :providers="providerList"
      :counts="counts"
    />
    <column-main
      :showLeftColumn="showLeft"
      :showRightColumn="showRight"
      @togglePanel="togglePanel"
      @toggleRightPanel="toggleRightPanel"
    />
    <column-right
      :showColumn="showRight"
      :providers="providerList"
    />
  </div>
</template>

<script>
import Split from 'split.js'

import bus from '../shared/bus'

import ColumnLeft from './components/column-left.vue'
import ColumnMain from './components/column-main.vue'
import ColumnRight from './components/column-right.vue'

export default {
  name: 'DevTools',
  components: {
    ColumnLeft,
    ColumnMain,
    ColumnRight
  },
  data: () => ({
    debugEnabled: true,
    instance: null,
    showLeft: true,
    showRight: false,
    timeout: null,
    providerList: {},
    columns: [],
    counts: {}
  }),
  created () {
    this.bindEvents()

    this.providerList = bus.getProviders()

    for (let provider in this.providerList) {
      this.counts[provider] = 0
    }
  },
  mounted () {
    this.setColumns()
  },
  methods: {
    bindEvents () {
      bus.$off('ADP_WEB_REQUEST')
      bus.$on('ADP_WEB_REQUEST', (request) => {
        bus.handleRequest(request)
      })

      bus.$off('UPDATE_PROVIDER_COUNT')
      bus.$on('UPDATE_PROVIDER_COUNT', (slug) => {
        if (slug && this.counts.hasOwnProperty(slug)) {
          this.counts[slug] += 1
        }
      })

      bus.$off('CLEAR_REQUEST_LOG')
      bus.$on('CLEAR_REQUEST_LOG', () => {
        this.providerList = bus.getProviders()

        for (let provider in this.providerList) {
          this.counts[provider] = 0
        }

        bus.$emit('UPDATE_PROVIDER_COUNT')
      })
    },
    togglePanel (col) {
      if (col === 'left') {
        this.showLeft = !this.showLeft
        this.$store.dispatch('toggleLeftColumn', this.showLeft)
      } else if (col === 'right') {
        this.showRight = !this.showRight
        this.$store.dispatch('toggleRightColumn', this.showRight)
      }

      // hide gutters for closed side panels
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        document.querySelectorAll('.gutter')[0].style.display = (document.querySelector('#left').clientWidth > 0) ? 'block' : 'none'
        document.querySelectorAll('.gutter')[1].style.display = (document.querySelector('#right').clientWidth > 0) ? 'block' : 'none'
      }, 100)
    },
    toggleRightPanel (show) {
      this.showRight = show
      this.$store.dispatch('toggleRightColumn', show)

      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        document.querySelectorAll('.gutter')[1].style.display = (document.querySelector('#right').clientWidth > 0) ? 'block' : 'none'
      }, 100)
    },
    setColumns () {
      var self = this
      this.instance = Split(['#left', '#center', '#right'], {
        gutterSize: 9,
        minSize: 0,
        sizes: self.$store.getters.getColumns,
        elementStyle: function (dimension, size, gutterSize) {
          const width = document.querySelector('.analytics-debug-panel').clientWidth
          let panelWidth = Math.round(width * (size / 100))

          if (panelWidth < 200) {
            panelWidth = 200
          }

          return {
            'flex-basis': panelWidth + 'px'
          }
        },
        gutterStyle: function (dimension, gutterSize) {
          return {
            'flex-basis': gutterSize + 'px'
          }
        },
        onDragEnd: function () {
          self.columns = self.instance.getSizes()
          self.$store.dispatch('saveColumns', self.columns)
        }
      })

      this.columns = this.instance.getSizes()
      this.showLeft = self.$store.getters.leftColumnVisible
      this.showRight = self.$store.getters.rightColumnVisible
    }
  }
}
</script>

<style lang="scss">
@import '../shared/app';

html {
  box-sizing: border-box;
}

/* CSS RESET */
*, :after, :before {
  box-sizing: inherit;
  padding: 0;
  margin: 0;
}

#analytics-debugger, body, html {
  padding: 0;
  margin: 0;
  height: 100vh;
  overflow: hidden;
  font-family: -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a, button {
  cursor: pointer;
}

.analytics-debug-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;

  button {
    background: none;
    border: none;
  }

  .gutter {
    cursor: ew-resize;
    width: 9px;
    margin: 0 -4px;
    z-index: 5000;
  }

  .pane {
    height: 100%;
    opacity: 1;
  }

  .toolbar-icon {
    width: 28px;
    height: 24px;

    &:active, &:focus {
      outline: none;
    }
  }

  #left, #right {
    min-width: 100px;
    max-width: 400px;
    flex-basis: 200px;
  }

  #center {
    flex-grow: 1;
    flex-basis: unset !important;
  }

  header {
    text-align: center;
    line-height: 27px;
    height: 27px;
    font-weight: 600;
    position: relative;
  }

  main {
    background-color: transparent;
    color: #999;
    height: calc(100% - 26px);
    overflow: auto;
  }
}

.slide-fade-enter-active {
  transition: flex-basis .025s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-leave-to {
  transition: flex-basis .025s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter, .slide-fade-leave-to {
  flex-basis: 0 !important;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
