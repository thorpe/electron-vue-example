<template>
  <v-flex shrink>
    <v-list id="menu">
      <div class="logo">
        <a @click="goHome()"><img src="http://beta.chainflix.net/icons/topLogo.svg"/></a>
      </div>
      <v-divider></v-divider>
      <v-list-item>
        <v-list-item-content>
          <v-btn color="success" @click="onStart()" v-if="!server.running" :disabled="!steps.step01 || !steps.step02 || server.running">{{ $t('common.start') }}</v-btn>
          <v-btn color="error" @click="onStop()" v-if="server.running">{{ $t('common.stop') }}</v-btn>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-subtitle>{{ $t('common.daemon_status') }}</v-list-item-subtitle>
          <v-list-item-title v-if="server.running">
            <v-chip color="primary">{{ $t('common.running') }}</v-chip>
          </v-list-item-title>
          <v-list-item-title v-if="!server.running">
            <v-chip color="default">{{ $t('common.stopped') }}</v-chip>
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <div class="bottom">
        <v-divider></v-divider>
        <v-list-item @click="onSettings()" :disabled="server.running">
          <v-btn icon>
            <v-icon>mdi-apps</v-icon>
          </v-btn>
          {{ $t('common.settings') }}
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="onUpdate()" :disabled="server.running">
          <v-btn icon>
            <v-icon>mdi-download</v-icon>
          </v-btn>
          {{ $t('common.check_for_update') }}
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="goChainflixHome()">
          <v-btn icon>
            <v-icon>mdi-home</v-icon>
          </v-btn>
          {{ $t('common.helpdesk') }}
        </v-list-item>
      </div>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-subtitle>{{ $t('common.storage_capacity') }}</v-list-item-subtitle>
          <v-list-item-title>{{ config.storage_capacity }} GByte</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-subtitle>{{ $t('common.storage_available') }}</v-list-item-subtitle>
          <v-list-item-title>{{ size_available }} GByte</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-subtitle>{{ $t('common.current_users') }}</v-list-item-subtitle>
          <v-list-item-title>{{ current_users }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-subtitle>{{ $t('common.network_traffic') }} (Max: {{ config.max_traffic }} MB/S)</v-list-item-subtitle>
          <v-list-item-title>{{ network_traffic }} MB/S</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

    </v-list>
  </v-flex>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import daemon from '../daemon'
  import daemonConfig from '../daemon/config'

  const logMessages = []

  export default {
    data: () => ({
      logs: [],
      storage: {
        size_available: 0,
        max_traffic: 0
      },
      rules: {
        required: value => !!value || 'Required.',
        capacity: value => value >= 100 || 'Must be greater than 100GB.'
      }
    }),
    watch: {
      config: function () {
        this.reset()
      }
    },
    mounted: function () {
      this.logs = logMessages
      this.reset()
      if (this.steps.step01 === false) {
        this.$router.push('/guide01')
      }
      if (this.steps.step01 === true && this.steps.step02 === false) {
        this.$router.push('/guide02')
      }
    },
    computed: {
      ...mapGetters(['config', 'server', 'steps']),
      size_available: function () {
        return this.storage.size_available ? (this.storage.size_available / 1024 / 1024 / 1024).toFixed(2) : '0'
      },
      current_users: function () {
        return this.storage.current_users ? this.storage.current_users : '0'
      },
      network_traffic: function () {
        return this.storage.network_traffic ? (this.storage.network_traffic / 1024 / 1024).toFixed(2) : '0'
      }
    },

    methods: {
      ...mapActions(['setServer']),
      onStart: function () {
        this.setServer({
          running: true,
          valid: true
        })

        daemon.start(this.onError)
      },

      onStop: function () {
        this.setServer({
          running: false,
          valid: false
        })
        daemon.stop()
      },
      goHome: function () {
        if (this.$route.path !== '/') {
          this.$router.push('/')
        }
      },
      onUpdate: function () {
        if (this.$route.path !== '/update') {
          this.$router.push('/update')
        }
      },
      goChainflixHome: function () {
        const w = 1200
        const h = 800
        const left = Math.round((screen.width / 2) - (w / 2))
        const top = Math.round((screen.height / 2) - (h / 2))

        const url = 'http://beta.chainflix.net/helpCenter/'
        window.open(url, 'chainflix', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left)
      },
      onSettings: function () {
        if (this.$route.path !== '/settings') {
          this.$router.push('/settings')
        }
      },
      reset: function () {
        this.storage = daemonConfig.storage

        this.storage.storage_id = this.config.storage_id
        this.storage.api_key = this.config.api_key
        this.storage.controller_url = this.config.controller_url
        this.storage.size_max = this.config.storage_capacity
        this.storage.port = this.config.service_port
        this.storage.https_port = this.config.service_https_port
        this.storage.uploadPath = this.config.temp_path

        daemonConfig.stream.rootFolder = this.config.storage_path
      }
    }
  }
</script>
