const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs')
let config = require('../config')
const async = require('async')
const path = require('path')
const log = require('electron-log')

const getShaHash = require('./sha-hash')
const pathUploads = config.storage.uploadPath
const pathVideos = config.stream.rootFolder

const storage = multer.diskStorage({
  // 서버에 저장할 폴더
  destination: function (req, file, cb) {
    cb(null, pathUploads)
  },

  // 서버에 저장할 파일 명
  filename: function (req, file, cb) {
    // 이미 저장된 파일인지 확인
    const newPath = path.join(pathVideos, file.originalname)
    fs.access(newPath, fs.constants.F_OK, (err) => {
      if (err) {
        cb(null, file.originalname)
      } else {
        cb({ code: 'DUPLICATED_FILE' }, file.originalname)
      }
    })
  }
})

const isEmpty = (val) => {
  if (val === undefined || val === null || val === '') return true
  return false
}

const startUpload = (req, res, next) => {
  // 타임아웃 시간을 지정 (1시간)
  res.setTimeout(3600 * 1000, function () {
    log.info('Request has timed out. (Upload)')
    res.send(408)
  })

  // 동영상 업로드
  const uploader = multer({ storage: storage, limits: { fileSize: 10000000000 } }) // 10 GB
  uploader.single('video')(req, res, function (err) {
    let duplicated = false
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.json({ upload: false, message: 'The file size is too large.' })
      } else if (err.code === 'DUPLICATED_FILE') {
        duplicated = true
      } else if (err.toString().includes('Multipart')) {
        res.json({ upload: false, message: 'File not found.' })
      } else {
        res.json({ upload: false, message: 'Unknown server error.' })
      }

      if (err.code !== 'DUPLICATED_FILE') {
        return
      }
    }

    const video = req.file
    if (!video || isEmpty(video)) {
      res.json({ upload: false, message: 'File not found.' })
      return
    }

    const orgPath = path.join(pathUploads, video.filename)

    async.waterfall([
      (callback) => {
        // 파일크기 계산
        fs.stat(orgPath, (err, stats) => {
          if (err) {
            callback('Unknown server error.')
          } else {
            callback(null, stats.size)
          }
        })
      },
      (filesize, callback) => {
        // SHA256 해시 계산
        getShaHash(orgPath, filesize, callback)
      },
      (filesize, hash, callback) => {
        // 해시값 확인 및 동영상 저장완료 처리 (스토리지 컨트롤러에게 통보)
        router.controller.doSync(video.filename, hash, filesize, duplicated)

        log.info('Uploaded new content: ' + video.filename)
        callback(null)
      }
    ], (err) => {
      if (err) {
        // 임시 저장 파일 삭제
        fs.access(orgPath, fs.constants.F_OK, (err) => {
          if (!err) {
            fs.unlink(orgPath, (err) => {
              if (err) log.error(err)
            })
          }
        })

        res.json({ upload: false, message: err })
      } else {
        res.json({ upload: !duplicated, duplicated: duplicated, message: 'Success' })
      }
    })
  })
}

router.post('/upload', (req, res, next) => {
  // 파일 중복 확인
  const filename = req.query.filename
  const orgPath = path.join(pathVideos, filename)

  fs.access(orgPath, fs.constants.F_OK, (err) => {
    if (err) {
      // 파일이 존재하지 않는 경우에만 업로드
      startUpload(req, res, next)
    } else {
      fs.stat(orgPath, (err, stats) => {
        if (err) {
          log.error(err)
          res.json({ upload: false, duplicated: true, message: 'Duplicated! File read failed' })
        } else {
          getShaHash(orgPath, stats.size, (err, filesize, hash) => {
            if (err) {
              log.error(err)
              res.json({ upload: false, duplicated: true, message: 'Duplicated! File read failed' })
            } else {
              // 해시값 확인 및 동영상 저장완료 처리 (스토리지 컨트롤러에게 통보)
              router.controller.doSync(filename, hash, filesize, true)
              log.info('Resync new content: ' + filename)
              res.json({ upload: false, duplicated: true, message: 'Success' })
            }
          })
        }
      })
    }
  })
})

module.exports = router
