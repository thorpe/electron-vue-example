<template>
  <v-content>
    <v-container>
      <v-layout fill-height>

        <v-flex id="body">
          <v-app-bar elevate-on-scroll color="#white" id="body_header">
            <div class="logo">
              <img src="http://beta.chainflix.net/icons/topLogo.svg"/>
            </div>
            <v-toolbar-title><h4>{{ $t('common.step01') }}</h4></v-toolbar-title>
            <v-spacer></v-spacer>
            <div class="language">
              [
              <button @click="$i18n.locale='en'">English</button>
              |
              <button @click="$i18n.locale='kr'">한국어</button>
              ]
            </div>
          </v-app-bar>

          <v-row justify="center">
            <v-col cols="10" class="message" v-if="this.$i18n.locale === 'en'">
              <p>Installation completed.</p>
              <ul>
                <li>If you have a Windows Firewall, open 'Service Port' (in Firewall Settings) or 'Storage Monitor' app.</li>
                <li>If you have an External Firewall, open 'Service Port'</li>
                <li>If you are using a WI-FI router, you must set up your 'Service Port' to Port forwarding or DMZ host mode
                  (For Port forwarding, all external and internal ports must match with the Service Port)</li>
                <li>After applying for storage, the status of storage must be 'Activated' to start using your storage</li>
              </ul>
            </v-col>

            <v-col cols="10" class="message" v-if="this.$i18n.locale === 'kr'">
              <p>체인플릭스를 시작 하기전 몇가지 안내 사항입니다.</p>
              <ul>
                <ul>
                  <li>윈도우 방화벽 설정에서 지정된 Service Port 또는 스토리지 앱을 오픈해주세요.</li>
                  <li>외부 방화벽이 있는 경우 Service Port를 오픈해주세요.</li>
                  <li>공유기 사용자의 경우 Service Port를 포트 포워딩하거나 해당 PC를 DMZ 설정해주세요.
                    (포트 포워딩 시 외부, 내부 포트 모두 지정한 Service Port가 일치해야 합니다.)</li>
                  <li>스토리지 신청 후 대시보드에 신청 스토리지가 ‘대기‘가 아닌 ‘정상’이어야 스토리지 제공이 가능합니다.</li>
                  <li>바이러스 프로그램(알약, V3등)에서 'Chainflix' 프로그램 통신를 제외 해주세요.</li>
                  <li>바이러스 프로그램(알약, V3등)에서 'Chainflix' 동영상 파일들에 실시간 감시를 제외 해주세요.</li>
                </ul>
              </ul>
            </v-col>
          </v-row>

          <v-app-bar elevate-on-scroll  id="body_footer">
            <v-spacer></v-spacer>
            <v-btn color="success" @click="goNext()">{{ $t('common.next') }}</v-btn>
          </v-app-bar>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'

  export default {
    data: () => ({
    }),
    computed: {
      ...mapGetters(['config', 'server', 'steps'])
    },
    mounted: function () {
    },
    methods: {
      ...mapActions(['setSteps']),
       goNext: function () {
        this.setSteps({
          step01: true,
          step02: false,
          step03: false
        })
        this.$router.push('/guide02')
      }
    }
  }
</script>

<style scoped>
  .message {
    bottom: 20px;
    left: 20px;
    width: 100%;
    padding: 50px;
    margin: 50px 0;
    background-color: #efefef;
  }
</style>
