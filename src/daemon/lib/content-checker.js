const fs = require('fs')
const async = require('async')
const path = require('path')
const log = require('electron-log')
const getShaHash = require('./sha-hash')

const videoExts = [ '.flv', '.f4v', '.f4p', '.mp4', '.asf', '.asr', '.asx', '.avi', '.mpa', '.mpe', '.mpeg', '.mpg', '.mpv2', '.mov', '.movie', '.mp2', '.qt', '.ts', '.ogg', '.webm' ]

const ConfigChecker = {
  init: (config, resultCallback) => {
    const pathVideos = config.stream.rootFolder
    const size_max = config.storage.size_max * 1024 * 1024 * 1024
    config.storage.size_available = size_max

    let totalCount = 0
    let files = null

    // 동영상 폴더내에 모든 동영상 확인
    try {
      files = fs.readdirSync(pathVideos)
    } catch (exception) {
      log.error('Error reading video files!', exception)
      resultCallback(false)
      return
    }

    if (!files || files.length <= 0) {
      log.info('Content Count: ' + totalCount)
      log.info('Size Available: ' + (config.storage.size_available / 1024 / 1024 / 1024).toFixed(2) + 'GB')
      resultCallback(true)
      return
    }

    const checkedFiles = []

    // 파일 확인
    async.eachSeries(files, (filename, callback) => {
      // 확장자
      const ext = path.extname(filename)
      const len = filename.length - ext.length

      if (videoExts.indexOf(ext) < 0 || len < 36) {
        callback()
        return
      }

      const orgPath = path.join(pathVideos, filename)
      fs.stat(orgPath, (err, stats) => {
        if (err) {
          log.error('Error reading video file!', filename)
          log.error(err)
          callback()
        } else {
          getShaHash(orgPath, stats.size, (err, filesize, hash) => {
            if (err) {
              log.error(filename, err)
              callback()
            } else {
              checkedFiles.push(filename + ':' + hash + ':' + filesize)
              config.storage.size_available -= filesize
              totalCount++
              if (config.storage.size_available < 0) config.storage.size_available = 0

              callback()
            }
          })
        }
      })
    }, (err) => {
      if (err) {
        log.error(err)
        resultCallback(false)
      } else {
        config.storage.filenames = checkedFiles.join(',')

        log.info('File verification complete!')
        log.info('Content Count: ' + totalCount)
        log.info('Size Available: ' + (config.storage.size_available / 1024 / 1024 / 1024).toFixed(2) + 'GB')

        resultCallback(true)
      }
    })
  }
}

module.exports = ConfigChecker
