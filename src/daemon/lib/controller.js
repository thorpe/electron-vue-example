let config = require('../config')
const fs = require('fs')
const async = require('async')
const path = require('path')
const log = require('electron-log')
const got = require('got')
const Multipart = require('multi-part')
const { version } = require('../../../package.json')
const systeminfo = require('systeminformation')

const Controller = {}
Controller.connected = false
Controller.session = {}

const pathUploads = config.storage.uploadPath
const pathVideos = config.stream.rootFolder

let socket = null

let timerMonitor = null

const sm = {
  traffic: 0,
  traffic_tx: 0,
  traffic_rx: 0,
  cpu_usage: 0,
  cpu_max_speed: 0,
  cpu_cores: 0,
  memory_usage: 0,
  memory_max_size: 0,
  storage_usage: 0,
  storage_max_size: 0,
  users: 0
}

const sm_sent = {
  traffic_tx: 0,
  traffic_rx: 0,
  cpu_usage: 0,
  memory_usage: 0,
  storage_usage: 0,
  users: 0
}

systeminfo.cpu((cpu) => {
  sm.cpu_cores = cpu.cores
  if (cpu.speed && cpu.speed > 0) {
    sm.cpu_max_speed = parseFloat(cpu.speed)
  } else {
    sm.cpu_max_speed = 1
  }
})

systeminfo.mem((mem) => {
  sm.memory_max_size = mem.total
})

systeminfo.fsSize((filesystems) => {
  filesystems.forEach((filesystem) => {
    sm.storage_max_size += filesystem.size
  })
})

const checkExistsVideo = (filename, callback) => {
  fs.access(path.join(pathVideos, filename), fs.constants.F_OK, (err) => {
    callback(!err)
  })
}

Controller.doSync = (filename, hash, filesize, duplicated) => {
  if (Controller.connected) {
    const params = {
      filename: filename,
      hash: hash,
      filesize: filesize,
      duplicated: duplicated
    }

    socket.emit('sync', params)
  } else {
    // 업로드 폴더에 저장된 파일 삭제
    fs.access(path.join(pathUploads, filename), fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(path.join(pathUploads, filename), (err) => {
          if (err) log.info(err)
        })
      }
    })
  }
}

Controller.doStream = (filename, session_id, stream) => {
  if (Controller.connected) {
    socket.emit('stream', {
      filename: filename,
      session_id: session_id,
      stream: stream
    })
  }
}

Controller.doRemove = (filename) => {
  if (Controller.connected) {
    socket.emit('remove', {
      filename: filename
    })
  }
}

Controller.open = () => {
  log.info('-------------------------connect-------------------------')
  log.info('controller_url : ' + config.storage.controller_url)
  log.info('storage_id : ' + config.storage.storage_id)
  log.info('api_key : ' + config.storage.api_key)
  socket = require('socket.io-client')(config.storage.controller_url)

  socket.on('connect', function () {
    log.info('Connected to controller')

    socket.emit('login', {
      storage_id: config.storage.storage_id,
      api_key: config.storage.api_key,
      size_available: config.storage.size_available,
      size_max: config.storage.size_max * 1024 * 1024 * 1024,
      storage_port: config.storage.port,
      storage_https_port: config.storage.https_port,
      max_traffic: config.storage.max_traffic,
      version: version
    })
  })

  socket.on('connect_error', function (err) {
    if (err) {
      log.warn('It cannot be connected to the storage controller.')
    }
  })

  socket.on('disconnect', function () {
    Controller.connected = false
    log.info('Disconnected from controller')

    if (timerMonitor !== null) {
      clearInterval(timerMonitor)
      timerMonitor = null
    }
  })

  socket.on('login', function (params) {
    if (params.login) {
      Controller.connected = true

      // 파일 동기화 자료 전송
      if (!config.storage.sync_first) {
        socket.emit('sync_init', {
          filenames: config.storage.filenames
        })
        config.storage.filenames = ''
        config.storage.sync_first = true
      }

      // 첫 1회는 무조건 전송하기 위함
      sm_sent.traffic_tx = -1

      // 트래픽 보고
      timerMonitor = setInterval(() => {
        if (Controller.connected) {
          sm.users = config.storage.current_users

          async.waterfall([
            // 트래픽 확인
            (callback) => {
              systeminfo.networkStats((nets) => {
                sm.traffic_tx = 0
                sm.traffic_rx = 0
                nets.forEach((net) => {
                  sm.traffic_tx += (net.tx_sec > 0 ? net.tx_sec : 0)
                  sm.traffic_rx += (net.rx_sec > 0 ? net.rx_sec : 0)
                })

                config.storage.network_traffic = sm.traffic_tx // Byte 단위

                sm.traffic_tx = parseFloat((sm.traffic_tx / 1024 / 1024).toFixed(2))
                sm.traffic_rx = parseFloat((sm.traffic_rx / 1024 / 1024).toFixed(2))
                sm.traffic = sm.traffic_tx // MByte 단위

                callback()
              })
            },
            // CPU 확인
            (callback) => {
              systeminfo.currentLoad((load) => {
                sm.cpu_usage = Math.ceil(load.currentload)
                callback()
              })
            },
            // 메모리 확인
            (callback) => {
              if (sm.memory_max_size > 0) {
                systeminfo.mem((mem) => {
                  sm.memory_usage = Math.ceil((1 - mem.available / mem.total) * 100)
                  callback()
                })
              } else {
                callback()
              }
            },
            // 스토리지 확인
            (callback) => {
              if (sm.storage_max_size > 0) {
                systeminfo.fsSize((filesystems) => {
                  let used = 0
                  filesystems.forEach((filesystem) => {
                    used += filesystem.used
                  })

                  sm.storage_usage = Math.ceil((used / sm.storage_max_size) * 100)
                  callback()
                })
              } else {
                callback()
              }
            }
          ], () => {
            if (sm.traffic_tx !== sm_sent.traffic_tx ||
              sm.traffic_rx !== sm_sent.traffic_rx ||
              sm.cpu_usage !== sm_sent.cpu_usage ||
              sm.memory_usage !== sm_sent.memory_usage ||
              sm.storage_usage !== sm_sent.storage_usage ||
              sm.users !== sm_sent.users) {
              sm_sent.traffic_tx = sm.traffic_tx
              sm_sent.traffic_rx = sm.traffic_rx
              sm_sent.cpu_usage = sm.cpu_usage
              sm_sent.memory_usage = sm.memory_usage
              sm_sent.storage_usage = sm.storage_usage
              sm_sent.users = sm.users

              socket.emit('net_status', sm)
            }
          })
        }
      }, 5000)
    } else {
      log.error(params.message)

      // 60초후 재접속
      socket.close()
      setTimeout(() => {
        socket.open()
      }, 60000)
    }
  })

  socket.on('sync_result', function (params) {
    // 동기화 기록 결과
    const filename = params.filename

    const uploadPath = path.join(pathUploads, filename)
    const vodeoPath = path.join(pathVideos, filename)

    const removeUploadedFile = () => {
      // 업로드 폴더에 저장된 파일 삭제
      fs.access(uploadPath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(uploadPath, (err) => {
            if (err) log.info(err)
          })
        }
      })
    }

    // 동영상 폴더이 이미 존재하는지 확인
    fs.access(vodeoPath, fs.constants.F_OK, (err, stats) => {
      if (err) {
        // 업로드 폴더에 파일이 있는지 확인
        fs.access(uploadPath, fs.constants.F_OK, (err) => {
          if (err) {
            log.info('Not found file: ' + filename)
          } else {
            // 비디오 폴더로 복사
            fs.copyFile(path.join(pathUploads, filename), path.join(pathVideos, filename), (err) => {
              if (err) {
                log.info('Not found file: ' + filename)
              } else {
                config.storage.size_available -= params.filesize
                if (config.storage.size_available < 0) config.storage.size_available = 0

                log.info('Complete sync new content: ' + filename)
              }

              // 파일 복사후 삭제
              removeUploadedFile()
            })
          }
        })
      } else {
        log.info('Complete sync new content: ' + filename)

        // 업로드 경로에 파일이 있다면 삭제
        removeUploadedFile()
      }
    })
  })

  socket.on('sync_request', function (params) {
    // 스토리지간 동기화 요청
    const filename = params.filename
    let url = params.url
    log.info('Sync request:', url, filename)

    // IP 포워딩 처리가 설정된 경우
    if (config.syncForward) {
      const url_front = url.split('//')[1]
      const url_ip_port = url_front ? url_front.split('/')[0] : ''
      let [url_ip, url_port] = url_ip_port ? url_ip_port.split(':') : ['', '']

      if (url_ip && url_port) {
        if (config.syncForward[url_ip] !== undefined) {
          const newAddr = config.syncForward[url_ip][url_port]
          if (newAddr !== undefined) {
            // 지정된 주소로 IP 포워딩
            url = url.split(url_ip).join(newAddr.address)
            url = url.split(':' + url_port).join(':' + newAddr.port)
          }
        }
      }
    }

    if (!filename || !url) return

    const filepath = path.join(pathVideos, filename)
    async.waterfall([
      // 파일이 있는지 확인
      (callback) => {
        fs.access(filepath, fs.constants.F_OK, (err) => {
          if (err) callback('Error sync request (Not found file): ' + filename)
          else callback(null)
        })
      },
      // 파일 업로드
      (callback) => {
        try {
          const form = new Multipart()
          form.append('video', fs.createReadStream(filepath));
          (async () => {
            const response = await got.post(url + '?filename=' + filename, { headers: form.getHeaders(), body: form.stream() })
            try {
              const result = JSON.parse(response.body)
              if (result.upload) {
                log.info('Complete send content: ' + filename)
                callback(null)
              } else if (result.duplicated) {
                log.info('Complete send content (Duplicated): ' + filename)
                callback(null)
              } else {
                callback(result.message)
              }
            } catch (e) {
              callback(e)
            }
          })()
        } catch (e) {
          callback(e)
        }
      }
    ], (err) => {
      if (err) {
        log.info('Error sync request', err)
      }
    })
  })

  socket.on('session', function (params) {
    // 세션정보 등록 요청
    const filename = params.filename
    const session_id = params.session_id
    const timeout = params.timeout
    const throttle = params.throttle ? params.throttle : config.stream.throttle
    const secure_key = params.secure_key ? params.secure_key : ''

    if (!filename || !session_id || !timeout) return

    // 실제 파일이 존재하는지 확인
    checkExistsVideo(filename, (exists) => {
      if (exists) {
        log.info('Add session: ' + session_id + ' - ' + filename)
        Controller.session.add(session_id, filename, new Date().getTime() + timeout, throttle, secure_key)
      } else {
        log.error('Error! Add session: ' + session_id + ' - ' + filename + ' (Not found file)')
        Controller.doRemove(filename)
      }
    })
  })

  socket.on('remove', function (params) {
    // 컨텐츠 삭제 요청
    const filename = params.filename
    if (!filename) return

    // 파일이 존재하는지 확인
    checkExistsVideo(filename, (exists) => {
      if (exists) {
        fs.stat(path.join(pathVideos, filename), (err, stats) => {
          if (err) {
            log.error('Remove file: ' + filename + ' (Can not access)', err)
          } else {
            log.info('Remove file: ' + filename)

            fs.unlink(path.join(pathVideos, filename), (err) => {
              if (err) log.error(err)
            })

            config.storage.size_available += stats.size

            const max = config.storage.size_max * 1024 * 1024 * 1024
            if (config.storage.size_available > max) config.storage.size_available = max
          }
        })
      } else {
        log.error('Remove file: ' + filename + ' (Not found file)')
      }
    })
  })
}

Controller.close = () => {
  socket.close()
  socket = null
}

module.exports = Controller
