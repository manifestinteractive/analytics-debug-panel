<template>
  <transition name="slide-fade">
    <div class="pane" id="left" v-show="showColumn">
      <header>
        <button class="toolbar-icon" @click="toggleFilter" aria-label="Filter Providers" aria-pressed="false">
          <i class="devtools-icon filter" :class="filtering ? 'active' : ''"></i>
        </button>
      </header>
      <main>
        <ul class="providers" role="tree">
          <li v-for="(provider, key) in providers" class="provider bb-muted" role="treeitem" :key="key + '-' + counts[key]" :class="{ 'filtering' : filtering, 'inactive': (counts[key] === 0 && !filtering) }">
            <div>
              <label :aria-label="toggleLabel(key)" aria-pressed="false">
                <input type="checkbox" v-show="filtering" @change="updateFilters" v-model="filters[key]">
                {{ provider.organization }}
              </label>

              <span class="badge" v-if="counts[key] > 0" :class="{ 'active': filters[key] === true }">{{ counts[key] }}</span>
            </div>

            <ul v-if="filtering && provider.services.length > 1" class="services">
              <li v-for="(service, index) in provider.services" class="service">
                <div>
                  <label>
                    <input type="checkbox" @change="updateFilters" v-model="filters[service.id]">
                    {{ service.name }}
                  </label>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </main>
    </div>
  </transition>
</template>

<script>
import bus from '../../shared/bus'

export default {
  name: 'ColumnLeft',
  props: {
    showColumn: {
      type: Boolean,
      default: false
    },
    providers: {
      type: Object,
      default: () => {}
    },
    counts: {
      type: Object,
      default: () => {}
    }
  },
  data: () => ({
    filters: {},
    filtering: false
  }),
  mounted () {
    for (let provider in this.providers) {
      this.filters[provider] = true
      for (let service in this.providers[provider].services) {
        this.filters[this.providers[provider].services[service].id] = true
      }
    }

    setTimeout(() => {
      bus.$emit('UPDATE_PROVIDER_FILTERS', this.filters)
    }, 10)

    bus.$on('UPDATE_PROVIDER_COUNT', () => {
      this.$forceUpdate()
    })
  },
  methods: {
    toggleLabel (key) {
      const req = (this.counts[key] === 1) ? `${this.counts[key]} Request` : `${this.counts[key]} Requests`
      return (this.filters[key] === true) ? `Hide ${req}` : `Show ${req}`
    },
    toggleFilter () {
      this.filtering = !this.filtering

      if (this.filtering) {
        this.$emit('startFilteringProviders')
      } else {
        this.$emit('stopFilteringProviders')
      }
    },
    updateFilters () {
      bus.$emit('UPDATE_PROVIDER_FILTERS', this.filters)
      this.$forceUpdate()
    }
  }
}
</script>

<style lang="scss">
@import '../../shared/app';

#left {
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
  main {
    ul.providers {
      width: 100%;
      list-style: none;

      li.provider {
        width: 100%;

        &.inactive {
          pointer-events: none;

          & > div {
            opacity: 0.35;
          }
        }

        & > div {
          position: relative;
          text-indent: 16px;
          height: 50px;
          line-height: 50px;

          label {
            width: 100%;
            display: block;
            cursor: pointer;

            &[aria-label]:hover:after {
              top: 40px;
              left: calc(50% - 70px);
              text-indent: 0;
              width: 140px;
              text-align: center;
            }
          }

          input {
            position: absolute;
            top: 18px;
            left: 10px;
          }

          span.badge {
            border-radius: 50%;
            position: absolute;
            top: 15px;
            right: 10px;
            width: 20px;
            height: 20px;
            text-align: center;
            font-size: 10px;
            padding: 0;
            margin: 0;
            line-height: 20px;
            text-indent: 0;
            font-weight: 600;
            cursor: pointer;

            &.active {
              background-color: #4285f0;
              color: #FFF;
            }
          }
        }

        &.filtering > div {
          text-indent: 30px;

          label:hover {
            color: #FFF;
          }
        }
      }
    }

    ul.services {
      width: 100%;
      list-style: none;
      margin-bottom: 10px;

      li.service {
        width: 100%;

        & > div {
          position: relative;
          text-indent: 50px;
          height: 30px;
          line-height: 30px;

          label {
            width: 100%;
            display: block;
            cursor: pointer;

            &:hover {
              color: #FFF;
            }
          }

          input {
            position: absolute;
            top: 8px;
            left: 30px;
          }
        }
      }
    }
  }
}
</style>
