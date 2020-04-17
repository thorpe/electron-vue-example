<template>
  <v-content>
    <v-container>
      <v-layout>
        <v-flex id="left">
          <LayoutLeft/>
        </v-flex>
        <v-flex id="body">
          <v-app-bar elevate-on-scroll color="#white" id="body_header">
            <v-toolbar-title><h4>{{ $t('common.home') }}</h4></v-toolbar-title>
            <v-spacer></v-spacer>
            <div class="language">
              [
              <button @click="changeLanguage('en')">English</button>
              |
              <button @click="changeLanguage('kr')">한국어</button>
              ]
            </div>
          </v-app-bar>

          <v-simple-table dense class="log-table-body" id="logTable" v-if="server.running">
            <template>
              <tbody>
              <tr v-for="(log, index) in logs" :key='index' :row="log" class="aaa">
                <td class="text-left log-left">{{ log.shortDate }}</td>
                <td class="text-left log-right">{{ log.data[0] }}</td>
              </tr>
              </tbody>
            </template>
          </v-simple-table>

          <v-row justify="center" v-if="!server.running">
            <v-col cols="9">
              <v-row class="message" v-if="this.$i18n.locale === 'kr'">
                <v-col cols="12" >
                  <p>서비스 시작준비가 완료되었습니다. 왼쪽 상단의 '시작하기' 버턴을 눌러 주세요.</p>
                </v-col>
              </v-row>

              <v-row class="message" v-if="this.$i18n.locale === 'en'">
                <v-col cols="12" >
                  <p>It is ready to start , Please click the 'Start' button on top left.</p>
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
  import log from 'electron-log'
  import moment from 'moment'
  import { mapActions, mapGetters } from 'vuex'
  import LayoutLeft from '../components/layout_left'

  const logMessages = []

  log.hooks.push((msg, transport) => {
    if (transport === log.transports.console) {
      msg.shortDate = moment(msg.date).format('MM-DD H:mm:ss')
      logMessages.push(msg)

      if (logMessages.length > 10) {
        logMessages.slice(logMessages.length - 10)
      }
    }
    return msg
  })

  export default {
    components: {
      LayoutLeft
    },
    data: () => ({
      valid: false,
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
      logs: function () {
        this.$nextTick(() => {
          const logTable = this.$el.querySelector('#logTable')
          logTable.scrollTop = logTable.scrollHeight
        })
      },
      config: function () {
       // this.reset()
      }
    },
    mounted: function () {
      this.logs = logMessages
      // this.reset()
    },
    computed: {
      ...mapGetters(['config', 'server', 'steps'])
    },
    methods: {
      ...mapActions(['setSteps']),
      reset: function () {
        this.setSteps({
          step01: false,
          step02: false,
          step03: false
        })
      },
      changeLanguage: function (language) {
        this.$i18n.locale = language
      }
    }
  }
</script>

<style scoped>
  .log-table-body {
    padding: 10px 0 0 0;
    position: absolute;
    top: 56px;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: auto;
    max-height: 650px;
  }

  .message {
    width: 100%;
    text-align: center;
    padding: 50px 0px 30px 0px;
    margin: 50px 0;
    background-color: #efefef;
  }

  .log-left {
    width: 125px;
    font-size: 11px;
  }

  .log-right {
    width: 620px;
    font-size: 11px;
  }
</style>
