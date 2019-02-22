const state = {
  gui: {
    columns: [10, 80, 10],
    showLeft: true,
    showRight: true
  }
}

const mutations = {
  SAVE_COLUMNS (state, data) {
    state.gui.columns = data
  },
  TOGGLE_LEFT (state, visible) {
    state.gui.showLeft = visible
  },
  TOGGLE_RIGHT (state, visible) {
    state.gui.showRight = visible
  }
}

/**
 * Vuex Actions
 * @example this.$store.getters.getColumns
 */
const getters = {
  getColumns: state => {
    return state.gui.columns
  },
  leftColumnVisible: state => {
    return state.gui.showLeft
  },
  rightColumnVisible: state => {
    return state.gui.showRight
  }
}

/**
 * Vuex Actions
 * @example this.$store.dispatch('saveColumns', [10, 80, 10])
 */
const actions = {
  saveColumns ({ commit }, data) {
    commit('SAVE_COLUMNS', data)
  },
  toggleLeftColumn ({ commit }, visible) {
    commit('TOGGLE_LEFT', visible)
  },
  toggleRightColumn ({ commit }, visible) {
    commit('TOGGLE_RIGHT', visible)
  }
}

export default {
  state,
  mutations,
  getters,
  actions
}
