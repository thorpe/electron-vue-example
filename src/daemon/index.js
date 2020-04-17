let vidStreamer = require('./lib/vid-streamer')
let express = require('express')
let Session = require('./lib/session')
let config = require('./config')
let cors = require('cors')
let fs = require('fs')
let https = require('https')
let log = require('electron-log')

let http_server = null
let https_server = null
let controller = null
let memory_check = true
let repeatRemoveExpireSession = null

const start = (onError) => {
  const settings = {
    ...config.stream,
    'sessions': Session.sessions,
    'onStreamOpen': (req) => {
      const addrs = req.ip ? req.ip.split(':') : ['0']
      const ip_address = addrs[addrs.length - 1].substring(0, 15)

      log.info('Stream Open ' + ip_address)
    },
    'onStreamReport': (session) => {
      if (session && controller) {
        controller.doStream(session.filename, session.session_id, session.stream)
      }
    },
    'onStreamClose': (req, session) => {
      if (session) {
        const addrs = req.ip ? req.ip.split(':') : ['0']
        const ip_address = addrs[addrs.length - 1].substring(0, 15)
        const pipe = session && session.pipe !== undefined ? session.pipe > 0 : false

        if (session && controller) {
          controller.doStream(session.filename, session.session_id, session.stream)
        }

        log.info('Stream Close ' + ip_address + ' / Session Id : ' + session.session_id + ' / Pipe : ' + pipe)
      }
    }
  }

  // Check path
  fs.access(config.stream.rootFolder, fs.constants.F_OK, (err) => {
    if (err) {
      fs.mkdirSync(config.stream.rootFolder, { recursive: true })
    }
  })

  fs.access(config.storage.uploadPath, fs.constants.F_OK, (err) => {
    if (err) {
      fs.mkdirSync(config.storage.uploadPath, { recursive: true })
    }
  })
  memory_check = true
  const app = express(vidStreamer.settings(settings))
  app.use(cors())

  const contentChecker = require('./lib/content-checker')
  contentChecker.init(config, (success) => {
    if (success) {
      const options = {
        key: config.cert.privatekey,
        cert: config.cert.publickey
      }

      const uploadRouter = require('./lib/upload')

      app.use(express.json())
      app.use('/video', vidStreamer)
      app.use('/command', uploadRouter)

      https_server = https.createServer(options, app).listen(config.storage.https_port, function () {
        log.info('VidStreamer up and running on https port : ' + config.storage.https_port)
      })

      http_server = app.listen(config.storage.port)

      log.info('VidStreamer up and running on http port : ' + config.storage.port)

      controller = require('./lib/controller')
      controller.open()
      controller.session = Session

      uploadRouter.controller = controller

      setTimeout(() => {
        if (repeatRemoveExpireSession) repeatRemoveExpireSession()
      }, 60000)
    } else {
      log.error('Can not start storage! Check your disk.')
      if (onError) {
        onError()
      }
    }
  })

  // 1분에 한번씩 메모리및 작동 시간을 기록한다.
  setInterval(() => {
    const memory = process.memoryUsage()
    const heapTotal = memory.heapTotal / 1024 / 1024
    const heapUsed = memory.heapUsed / 1024 / 1024
    const external = memory.external / 1024 / 1024

    if (memory_check === true) {
      log.info('Heap Memory : Total :' + heapTotal.toFixed(2) + 'mb | Used :' + heapUsed.toFixed(2) + 'mb | external :' + external.toFixed(2) + 'mb')
    }
  }, 60000)

  repeatRemoveExpireSession = () => {
    Session.removeExpire()
    setTimeout(() => {
      if (repeatRemoveExpireSession) repeatRemoveExpireSession()
    }, 3600000)
  }
}

const stop = () => {
  if (http_server !== null) {
    http_server.close()
    http_server = null
  }

  if (https_server !== null) {
    https_server.close()
    https_server = null
  }

  if (controller !== null) {
    controller.close()
    controller = null
  }

  memory_check = false
  if (repeatRemoveExpireSession !== null) {
    clearTimeout(repeatRemoveExpireSession)
    repeatRemoveExpireSession = null
  }
}

module.exports = {
  start, stop
}
