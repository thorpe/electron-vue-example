<template>
  <v-content>
    <v-container>
      <v-layout fill-height>

        <v-flex id="body">
          <v-app-bar elevate-on-scroll color="#white" id="body_header">
            <div class="logo">
              <img src="http://beta.chainflix.net/icons/topLogo.svg"/>
            </div>
            <v-toolbar-title><h4>{{ $t('common.step02') }}</h4></v-toolbar-title>
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
              <p>
                To complete the installation, please check your Storage Id & Storage Api key and press ‘Next’ button.</p>
              <div class="example">
                <p>Example)</p>
                <ul>
                  <li><span>Storage ID: chainflix-xxxxxx-00000</span></li>
                  <li><span>Storage Api Key: a7Xxf456V5W45B4i458BXdzXsdfjzMjWA5Tn82ycXf</span></li>
                </ul>
              </div>
            </v-col>

            <v-col cols="10" class="message" v-if="this.$i18n.locale === 'kr'">
              <p>홈페이지에서 스토리지 신청을 완료하셨습니까?. 신청 완료하셨다면 아래와 같은 스토리지 아이디와 API KEY를 확인이 필요합니다.
                확인이 되셨으면 다음을 클릭해주세요.</p>
              <div class="example">
                <p>예)</p>
                <ul>
                  <li><span>스토리지 ID: chainflix-xxxxxx-00000</span></li>
                  <li><span>스토리지 API KEY: a7Xxf456V5W45B4i458BXdzXsdfjzMjWA5Tn82ycXf</span></li>
                </ul>
              </div>
            </v-col>
          </v-row>

          <v-app-bar elevate-on-scroll id="body_footer">
            <v-btn color="secondary" @click="goPrev()" :disabled="!steps.step01">{{ $t('common.prev') }}</v-btn>
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
    data: () => ({}),
    computed: {
      ...mapGetters(['config', 'server', 'steps'])
    },
    mounted: function () {

    },
    methods: {
      ...mapActions(['setSteps']),
      goPrev: function () {
        this.setSteps({
          step01: false,
          step02: false,
          step03: false
        })

        this.$router.push('/guide01')
      },
      goNext: function () {
        this.setSteps({
          step01: true,
          step02: true,
          step03: false
        })

        this.$router.push('/guide03')
      }
    }
  }
</script>

<style scoped>
  .message {
    width: 100%;
    padding: 50px 40px 40px 40px;
    margin: 50px 0 40px 0;
    background-color: #efefef;
  }

  .example {
    border: 1px solid #e4e4e4;
    padding: 20px;
    background-color: #efefef;
  }
</style>
