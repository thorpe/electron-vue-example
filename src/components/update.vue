<template>
  <v-content>
    <v-container>
      <v-layout fill-height>
        <v-flex id="left">
          <LayoutLeft/>
        </v-flex>
        <v-flex id="body">
          <v-app-bar elevate-on-scroll color="#white"  id="body_header">
            <v-toolbar-title><h4>{{ $t('common.update') }}</h4></v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon>
              <v-icon @click="close()">mdi-close</v-icon>
            </v-btn>
          </v-app-bar>

          <v-row justify="center" >
            <v-col cols="9">
              <v-row>
                <v-col cols="12" id="version">
                  <h3> {{ $t('common.current_version') }} : v{{ version }}</h3>
                </v-col>
                <v-col cols="12" id="message">
                  <span v-if="message === 1">{{ $t('common.update_01_not_start') }}</span>
                  <span v-if="message === 2">{{ $t('common.update_02_version_check') }}</span>
                  <span v-if="message === 3">{{ $t('common.update_03_downloading') }}</span>
                  <span v-if="message === 4">{{ $t('common.update_04_downloaded') }}</span>
                  <span v-if="message === 5">{{ $t('common.update_05_latest_version') }}</span>
                </v-col>
                <v-col cols="12" id="loading" v-if="loading === true">
                  <img src="../assets/download_loading.svg"/>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="8">
                  <v-btn color="success" dark @click="checkForUpdates()" v-if="update_check === false">{{ $t('common.check_for_update') }}</v-btn>
                </v-col>
                <v-col cols="2">
                  <v-btn color="primary" dark  @click="quitAndInstall()" v-if="is_new_version && loading == false">{{ $t('common.install_restart') }}</v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script>
  import { ipcRenderer } from 'electron'
  import { version } from '../../package.json'
  import LayoutLeft from '../components/layout_left'
  import { mapGetters } from 'vuex'

  export default {
    components: {
      LayoutLeft
    },
    data: () => ({
      version: version,
      message: 1,
      update_check: false,
      is_new_version: false,
      loading: false
    }),
    mounted: function () {
    },
    computed: {
      ...mapGetters(['config', 'server', 'steps'])
    },
    methods: {
      close: function () {
        this.$router.push('/')
      },
      checkForUpdates: function () {
        this.update_check = true
        this.message = 2
        let root = this

        setTimeout(function() {
          if (root.message === 2) {
            root.loading = false
            root.message = 5
          }
        }, 10000)

        ipcRenderer.send('check_for_update')
        ipcRenderer.send('app_version')
        ipcRenderer.on('app_version', (event, arg) => {
          ipcRenderer.removeAllListeners('app_version')
        })

        ipcRenderer.on('update_available', () => {
          ipcRenderer.removeAllListeners('update_available')
          this.message = 3
          this.loading = true
          this.is_new_version = true
        })

        ipcRenderer.on('update_downloaded', () => {
          ipcRenderer.removeAllListeners('update_downloaded')
          this.message = 4
          this.loading = false
          this.is_new_version = true
        })
      },
      quitAndInstall: function () {
        ipcRenderer.send('quit_and_install')
      }
    }
  }
</script>

<style scoped>
  #version {
    width: 80%;
    margin: 40px 0 0 0;
  }

  #message {
    bottom: 20px;
    left: 20px;
    width: 80%;
    text-align: center;
    vertical-align: center;
    padding: 50px 0;
    margin: 50px 0;
    height: 120px;
    background-color: #efefef;
    font-family: 'Nanum Gothic', sans-serif;
  }
</style>
