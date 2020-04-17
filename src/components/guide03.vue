<template>
  <v-content>
    <v-container>
      <v-layout fill-height>
        <v-flex id="body">
          <v-app-bar elevate-on-scroll color="#white" id="body_header">
            <div class="logo">
              <img src="http://beta.chainflix.net/icons/topLogo.svg"/>
            </div>
            <v-toolbar-title><h4>{{ $t('common.step03') }}</h4></v-toolbar-title>
            <v-spacer></v-spacer>
            <div class="language">
              [
              <button @click="$i18n.locale='en'">English</button>
              |
              <button @click="$i18n.locale='kr'">한국어{{ valid }}</button>
              ]
            </div>
          </v-app-bar>

          <v-row justify="center" style="margin-top:10px">
            <v-col cols="9">
              <v-form ref="form" v-model="valid">
                <v-text-field v-model="controller_url" :label="$t('common.controller_url')" type="url" required :rules="[rules.required,rules.controller_url]" pa></v-text-field>
                <v-text-field v-model="storage_id" :label="$t('common.storage_id')" required :rules="[rules.required,rules.storage_id]"></v-text-field>
                <v-text-field v-model="api_key" :label="$t('common.api_key')" required :rules="[rules.required,rules.api_key]"></v-text-field>
                <v-text-field v-model="storage_capacity" :label="$t('common.storage_capacity')" type="number" suffix="GB" required :rules="[rules.required, rules.capacity]"></v-text-field>
                <v-text-field v-model="service_port" :label="$t('common.service_port')" type="number" required :rules="[rules.required, rules.service_port]"></v-text-field>
                <v-text-field v-model="service_https_port" :label="$t('common.service_https_port')" type="number" required :rules="[rules.required, rules.service_https_port]"></v-text-field>
                <v-text-field v-model="max_traffic" :label="$t('common.max_traffic')" type="number" required :rules="[rules.required]"></v-text-field>
                <v-text-field v-model="temp_path" :label="$t('common.temp_path')" required :rules="[rules.required]"></v-text-field>
                <v-text-field v-model="storage_path" :label="$t('common.storage_path')" required :rules="[rules.required]"></v-text-field>
              </v-form>
            </v-col>
          </v-row>

          <v-app-bar elevate-on-scroll id="body_footer">
            <v-btn color="secondary" @click="goPrev()" :disabled="!steps.step01">{{ $t('common.prev') }}</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="success" @click="goNext()" :disabled="!valid">{{ $t('common.next') }}</v-btn>
          </v-app-bar>
        </v-flex>

      </v-layout>
    </v-container>
  </v-content>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import { remote } from 'electron'
  import path from 'path'
  import daemonConfig from '../daemon/config'

  export default {
    data: () => ({
      valid: false,
      storage_id: '',
      api_key: '',
      controller_url: '',
      storage_capacity: 100,
      service_port: 3001,
      service_https_port: 3002,
      max_traffic: 100,
      temp_path: '',
      storage_path: '',
      rules: {
        required: value => !!value || 'Required.',
        controller_url: value => {
          const pattern = /(http(s)?:\/\/)+[a-zA-Z0-9.-]{15}/
          return (
            pattern.test(value) || 'Must be longer than 25 length.(ex) http(s)://xxxxxxxxxxxx.chainflix.net)'
          )
        },
        storage_id: value => {
          const pattern = /[a-zA-Z0-9-]{4}-[a-zA-Z0-9]{7}-[0-9]{4}/
          return (
            pattern.test(value) ||
            "Storage id's pattern must be 'xxxxxxxxxx-xxxxxxx-0000x'"
          )
        },
        api_key: value => {
          const pattern = /[a-zA-Z0-9]{40}/
          return (
            pattern.test(value) || 'Must be longer than 40 length'
          )
        },
        capacity: value => value >= 100 || 'Must be greater than 100GB.'
      }
    }),
    mounted: function () {
      this.storage = daemonConfig.storage

      this.storage_id = this.config.storage_id
      this.api_key = this.config.api_key
      this.storage_capacity = this.config.storage_capacity
      this.service_port = this.config.service_port
      this.service_https_port = this.config.service_https_port
      this.max_traffic = this.config.max_traffic
      this.temp_path = this.config.temp_path
      this.storage_path = this.config.storage_path
      this.controller_url = this.config.controller_url

      const userPath = remote.app.getPath('userData')
      if (!this.temp_path || this.temp_path === '') {
        this.temp_path = path.join(userPath, 'uploads')
      }

      if (!this.storage_path || this.storage_path === '') {
        this.storage_path = path.join(userPath, 'videos')
      }
    },
    computed: {
      ...mapGetters(['config', 'server', 'steps'])
    },
    methods: {
      ...mapActions(['setConfig', 'setSteps']),
      goPrev: function () {
        this.setSteps({
          step01: true,
          step02: false,
          step03: false
        })

        this.$router.push('/guide02')
      },
      goNext: function () {
        if (!this.valid) return

        this.setConfig({
          storage_id: this.storage_id,
          api_key: this.api_key,
          controller_url: this.controller_url,
          storage_capacity: this.storage_capacity,
          service_port: this.service_port,
          service_https_port: this.service_https_port,
          max_traffic: this.max_traffic,
          temp_path: this.temp_path,
          storage_path: this.storage_path
        })

        this.setSteps({
          step01: true,
          step02: true,
          step03: true
        })

        this.$router.push('/')
      },
      onCancel: function () {
        this.$router.push('/')
      }
    }
  }
</script>
