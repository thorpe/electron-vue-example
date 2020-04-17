import Vue from 'vue'
import Vuex from 'vuex'
import { createPersistedState, createSharedMutations } from 'vuex-electron'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    config: {
      storage_id: '',
      api_key: '',
      controller_url: '',
      storage_capacity: 100,
      service_port: 3001,
      service_https_port: 3002,
      max_traffic: 100,
      temp_path: '',
      storage_path: '',
      size_available: 0,
      current_users: 0,
      network_traffic: 0
    },
    server: {
      running: false,
      valid: false
    },
    steps: {
      step01: false,
      step02: false,
      step03: false
    }
  },
  actions: {
    setConfig(store, config) {
      store.commit('setConfig', config)
    },
    setServer(store, server) {
      store.commit('setServer', server)
    },
    setSteps(store, steps) {
      store.commit('setSteps', steps)
    }
  },
  mutations: {
    setConfig(state, config) {
      config.size_available = 0
      config.current_users = 0
      config.network_traffic = 0

      state.config = config
    },
    setServer(state, config) {
      state.server = config
    },
    setSteps(state, config) {
      state.steps = config
    }
  },
  getters: {
    config(state) {
      return {
        storage_id: state.config.storage_id,
        api_key: state.config.api_key,
        controller_url: state.config.controller_url,
        storage_capacity: state.config.storage_capacity,
        service_port: state.config.service_port,
        service_https_port: state.config.service_https_port,
        max_traffic: state.config.max_traffic,
        temp_path: state.config.temp_path,
        storage_path: state.config.storage_path
      }
    },
    server(state) {
      return {
        running: state.server.running,
        valid: state.server.valid
      }
    },
    steps(state) {
      return {
        step01: state.steps.step01,
        step02: state.steps.step02,
        step03: state.steps.step03
      }
    }
  },
  plugins: [
    createPersistedState(),
    createSharedMutations()
  ]
})
