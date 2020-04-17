'use strict'

let fs = require('fs')
let url = require('url')
let path = require('path')
let events = require('events')
let settings = require('../config').stream
let storage = require('../config').storage
const log = require('electron-log')
const crypto = require('crypto')

let handler = new events.EventEmitter()
let chunkSize = storage.chunk_size
let mimeTypes = {
  '.swf': 'application/x-shockwave-flash',
  '.flv': 'video/x-flv',
  '.f4v': 'video/mp4',
  '.f4p': 'video/mp4',
  '.mp4': 'video/mp4',
  '.asf': 'video/x-ms-asf',
  '.asr': 'video/x-ms-asf',
  '.asx': 'video/x-ms-asf',
  '.avi': 'video/x-msvideo',
  '.mpa': 'video/mpeg',
  '.mpe': 'video/mpeg',
  '.mpeg': 'video/mpeg',
  '.mpg': 'video/mpeg',
  '.mpv2': 'video/mpeg',
  '.mov': 'video/quicktime',
  '.movie': 'video/x-sgi-movie',
  '.mp2': 'video/mpeg',
  '.qt': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/x-wav',
  '.aif': 'audio/x-aiff',
  '.aifc': 'audio/x-aiff',
  '.aiff': 'audio/x-aiff',
  '.jpe': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.gif': 'image/gif',
  '.txt': 'text/plain',
  '.xml': 'text/xml',
  '.css': 'text/css',
  '.htm': 'text/html',
  '.html': 'text/html',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.vcf': 'text/x-vcard',
  '.vrml': 'x-world/x-vrml',
  '.zip': 'application/zip',
  '.webm': 'video/webm',
  '.m3u8': 'application/x-mpegurl',
  '.ts': 'video/mp2t',
  '.ogg': 'video/ogg'
}

let vidStreamer = async function (req, res) {
  let stat
  let info = {}
  let ext
  let range = typeof req.headers.range === 'string' ? req.headers.range : undefined
  let reqUrl = url.parse(req.url, true)

  info.path = typeof reqUrl.pathname === 'string' ? reqUrl.pathname.substring(1) : undefined

  if (info.path) {
    try {
      info.path = decodeURIComponent(info.path)
    } catch (exception) {
      handler.emit('badRequest', res, exception)
      return false
    }
  }

  // Manager에서 동영상을 바로 볼때 ( 관리자에서 클라이언트가 잘 작동되는지 확인하기 위해서 열어놈.
  let session = {}
  if (req.query.administrator === 'yes') {
    session = {
      'filename': req.query.filename,
      'throttle': req.query.throttle,
      'secure_key': req.query.secure_key,
      'expire': req.query.expire,
      'stream': req.query.stream,
      'spent': req.query.spent,
      'pipe': req.query.pipe
    }
  } else {
    if (!req.query.session) {
      handler.emit('badRequest', res, 'req.query.session is null')
      return false
    }

    const session_id = req.query.session
    if (session_id === undefined) {
      handler.emit('badRequest', res, 'req.query.session is null')
      return false
    }

    session = settings.sessions[session_id]
    if (session === undefined || session.expire < new Date().getTime()) {
      handler.emit('badRequest', res, 'session is not null')
      return false
    }
  }

  if (!info.path) {
    handler.emit('badFile', res)
    return false
  } else if (info.path.search(/^\.\.?|^\/|^\\/) !== -1) {
    handler.emit('security', res, { message: info.path })
    return false
  } else if (info.path.substring(0, settings.rootPath.length) !== settings.rootPath) {
    // This will trigger if wrong slashes are used. Change?
    handler.emit('security', res, { message: info.path })
    return false
  } else {
    ext = info.path.match(/.*(\..+?)$/)

    if (ext === null || ext.length !== 2 || (info.mime = mimeTypes[ext[1].toLowerCase()]) === undefined) {
      handler.emit('badMime', res, { message: info.path })
      return false
    }
  }

  info.path = info.path.substring(settings.rootPath.length)
  info.file = info.path.match(/(.*[\/|\\])?(.+?)$/)[2]

  // Want that file or a consisten-but-random one instead (for demos)?
  if (settings.random) {
    if (!randomFile(info)) {
      handler.emit('noRandomFiles', res, { message: info.path })
      return false
    }
  } else {
    info.path = path.join(settings.rootFolder, info.path)
  }

  try {
    stat = fs.statSync(info.path)

    if (!stat.isFile()) {
      handler.emit('badFile', res)
      return false
    }
  } catch (e) {
    handler.emit('badFile', res, e)
    return false
  }

  info.start = 0
  info.end = stat.size - 1
  info.size = stat.size
  info.modified = stat.mtime
  info.rangeRequest = false

  if (range !== undefined && (range = range.match(/bytes=(.+)-(.+)?/)) !== null) {
    info.start = isNumber(range[1]) && range[1] >= 0 && range[1] < info.end ? range[1] - 0 : info.start
    info.end = isNumber(range[2]) && range[2] > info.start && range[2] <= info.end ? range[2] - 0 : info.end
    info.rangeRequest = true
  } else if (reqUrl.query.start || reqUrl.query.end) {
    info.start = isNumber(reqUrl.query.start) && reqUrl.query.start >= 0 && reqUrl.query.start < info.end ? reqUrl.query.start - 0 : info.start
    info.end = isNumber(reqUrl.query.end) && reqUrl.query.end > info.start && reqUrl.query.end <= info.end ? reqUrl.query.end - 0 : info.end
  }

  info.length = info.end - info.start + 1

  downloadHeader(res, info)

  let chunkStart = info.start > 0 ? Math.floor(info.start / chunkSize) * chunkSize : info.start
  let chunkEnd = info.end < stat.size - 1 ? Math.ceil(info.end / chunkSize) * chunkSize + chunkSize - 1 : info.end
  if (chunkEnd > stat.size - 1) {
    chunkEnd = stat.size - 1
  }

  let byteSkip = info.start - chunkStart
  if (byteSkip < 0) {
    log.info(byteSkip)
  }

  // Flash vids seem to need this on the front, even if they start part way through. (JW Player does anyway.)
  if (info.start > 0 && info.mime === 'video/x-flv') {
    res.write('FLV' + pack('CCNN', 1, 5, 9, 9))
  }

  try {
    const stream = fs.createReadStream(info.path, {
      flags: 'r',
      start: chunkStart,
      end: chunkEnd,
      highWaterMark: chunkSize
    })

    if (session) session.pipe++

    let total_bytes = 0
    let sent_bytes = 0
    let sent_start = 0
    let secure_key = session.secure_key
    let throttle = session.throttle
    let sendCount = 0
    let finished = false

    const finishStream = () => {
      if (!finished) {
        finished = true

        if (!stream.destroyed) {
          stream.destroy()
        }

        if (!res.writableEnded && !res.writableFinished) {
          res.end(null, 'binary')
        }

        // 전송 완료
        if (sendCount > 0) {
          if (storage.current_users > 0) { // for monitoring
            storage.current_users--
          }

          if (info.rangeRequest && settings.onStreamClose) {
            if (session) {
              session.pipe--
              session.spent = session.stream
            }

            settings.onStreamClose(req, session)
          }
        }
      }
    }

    let reading = false
    let chunkQueue = Buffer.alloc(0)
    let readChunk = null
    let sendChunk = null

    readChunk = () => {
      if (finished) {
        return
      }
      if (reading && !stream.destroyed && !stream.readableEnded) {
        setTimeout(readChunk, 10)
        return
      }

      reading = true

      let chunkPart
      while ((chunkPart = stream.read()) !== null) {
        chunkQueue = Buffer.concat([chunkQueue, chunkPart], chunkQueue.length + chunkPart.length)
      }

      if (chunkQueue.length >= chunkSize) {
        let chunk = null
        if (chunkQueue.length > chunkSize) {
          chunk = chunkQueue.slice(0, chunkSize)
          chunkQueue = chunkQueue.slice(chunkSize)
        } else {
          chunk = chunkQueue
          chunkQueue = Buffer.alloc(0)
        }

        sendChunk(chunk)
      } else {
        reading = false
      }
    }

    sendChunk = (chunk) => {
      if (sendCount === 0) {
        storage.current_users++

        if (info.rangeRequest) {
          settings.onStreamOpen(req)
        }
      }

      sendCount++
      total_bytes += chunk.length

      // 암호해제
      let buffer = ''
      if (secure_key && secure_key.length > 0) {
        const decipher = crypto.createDecipher('rc4', secure_key)
        buffer = decipher.update(chunk, 'binary', 'binary')
        buffer += decipher.final('binary')
      } else {
        // 기존 버전 호환성 유지
        buffer = chunk.toString('binary')
      }

      if (byteSkip > 0) {
        buffer = buffer.slice(byteSkip)
        byteSkip = 0
      }

      if (sent_bytes === 0) {
        sent_start = new Date().getTime()
      }

      if (!res.writableEnded) {
        res.write(buffer, 'binary', () => {
          if (info.rangeRequest) {
            if (session && settings.onStreamReport) {
              session.stream += buffer.length

              // 용량에 상관없이 랜덤하게 보상하기 위해 throttle(Bps) * 5 보다 큰 경우 스트리밍 보고
              if (session.stream - session.spent >= throttle * 5) {
                session.spent = session.stream
                settings.onStreamReport(session)
              }
            }
          }

          sent_bytes += buffer.length
          if (sent_bytes >= throttle) {
            sent_bytes = 0
            const waiting = Math.max(1000 - (new Date().getTime() - sent_start), 1)
            setTimeout(() => {
              reading = false
            }, waiting)
          } else {
            reading = false
          }
        })
      } else {
        reading = false
      }
    }

    stream.on('readable', readChunk)

    stream.on('end', () => {
      sendChunk(chunkQueue)
    })

    stream.on('close', () => {
      finishStream()
    })

    res.on('close', () => {
      finishStream()
    })

    res.on('finish', () => {
      finishStream()
    })

    return true
  } catch (err) {
    handler.emit('notReadFile', res)
  }
}

vidStreamer.settings = function (s) {
  for (let prop in s) {
    settings[prop] = s[prop]
  }
  return vidStreamer
}

let randomFile = function (info) {
  let fileCode = 0
  let fileParts
  let randomSource
  let randomPath
  let randomFiles
  let extn = info.path.match(/\..+?$/)

  // No extension given
  if (extn === null) return false
  extn = extn[0]

  // See if there's a path
  fileParts = info.path.match(/(.*[\/|\\])?(.+?)$/)
  if (fileParts[1] === undefined) {
    randomPath = settings.rootFolder
    randomSource = info.path
  } else {
    randomPath = settings.rootFolder + fileParts[1]
    randomSource = fileParts[2]
  }

  if (randomPath.substr(-1) !== '/' && randomPath.substr(-1) !== '\\') randomPath += '/'

  for (let i = 0, len = randomSource.length; i < len; i++) {
    fileCode += randomSource.charCodeAt(i)
  }

  try {
    randomFiles = fs.readdirSync(randomPath)
  } catch (e) {
    return false
  }
  randomFiles = randomFiles.filter(function (el) {
    return el.substr(-extn.length) === extn
  })
  if (randomFiles.length === 0) return false
  info.path = randomPath + randomFiles[fileCode % randomFiles.length]
  return true
}

let downloadHeader = function (res, info) {
  let code = 200
  let header

  if (settings.forceDownload) {
    header = {
      Expires: 0,
      'Cache-Control': 'must-revalidate, post-check=0, pre-check=0',
      'Content-Type': info.mime,
      'Content-Disposition': 'attachment; filename=' + info.file + ';'
    }
  } else {
    header = {
      'Cache-Control': 'public; max-age=' + settings.maxAge,
      Connection: 'keep-alive',
      'Content-Type': info.mime,
      'Content-Disposition': 'inline; filename=' + info.file + ';',
      'Accept-Ranges': 'bytes'
    }

    if (info.rangeRequest) {
      code = 206
      header.Status = '206 Partial Content'
      header['Content-Range'] = 'bytes ' + info.start + '-' + info.end + '/' + info.size
    }
  }

  header.Pragma = 'public'
  header['Last-Modified'] = info.modified.toUTCString()
  header['Content-Transfer-Encoding'] = 'binary'
  header['Content-Length'] = info.length
  if (settings.cors) {
    header['Access-Control-Allow-Origin'] = '*'
    header['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
  }
  header.Server = settings.server

  res.writeHead(code, header)
}

let errorHeader = function (res, code) {
  let header = {
    'Content-Type': 'text/html',
    Server: settings.server
  }

  res.writeHead(code, header)
}

// http://stackoverflow.com/a/1830844/648802
let isNumber = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

// A tiny subset of http://phpjs.org/functions/pack:880
let pack = function (format) {
  let result = ''

  for (let pos = 1, len = arguments.length; pos < len; pos++) {
    if (format[pos - 1] == 'N') {
      result += String.fromCharCode(arguments[pos] >> 24 & 0xFF)
      result += String.fromCharCode(arguments[pos] >> 16 & 0xFF)
      result += String.fromCharCode(arguments[pos] >> 8 & 0xFF)
      result += String.fromCharCode(arguments[pos] & 0xFF)
    } else {
      result += String.fromCharCode(arguments[pos])
    }
  }

  return result
}

handler.on('badFile', function (res, e) {
  errorHeader(res, 404)
  res.end('<!DOCTYPE html><html lang="en">' +
    '<head><title>404 Not found</title></head>' +
    '<body>' +
    '<h1>Ooh dear</h1>' +
    "<p>Sorry, I can't find that file. Could you check again?</p>" +
    '</body></html>')

  if (e) {
    if (e.message) {
      log.error('404 Bad File  - ' + e.message)
    } else {
      log.error('404 Bad File  - ' + e)
    }
  } else {
    log.error('404 Bad File  ')
  }
})

handler.on('badRange', function (res, e) {
  errorHeader(res, 416)
  res.end('<!DOCTYPE html><html lang="en">' +
    '<head><title>416 Range not satisifiable</title></head>' +
    '<body>' +
    '<h1>Ooh dear</h1>' +
    "<p>Sorry, the file isn't that big. Maybe try asking for a bit before the end of the file?</p>" +
    '</body></html>')

  if (e) {
    if (e.message) {
      log.error('416 Bad Range  - ' + e.message)
    } else {
      log.error('416 Bad Range  - ' + e)
    }
  } else {
    log.error('416 Bad Range  ')
  }
})

handler.on('security', function (res, e) {
  errorHeader(res, 403)
  res.end('<!DOCTYPE html><html lang="en">' +
    '<head><title>403 Forbidden</title></head>' +
    '<body>' +
    '<h1>Hey!</h1>' +
    '<p>Stop trying to hack my server!</p>' +
    '</body></html>')

  if (e) {
    if (e.message) {
      log.error('403 Security  - ' + e.message)
    } else {
      log.error('403 Security  - ' + e)
    }
  } else {
    log.error('403 Security  ')
  }
})

handler.on('badMime', function (res, e) {
  errorHeader(res, 403)
  res.end('<!DOCTYPE html><html lang="en">' +
    '<head><title>403 Forbidden</title></head>' +
    '<body>' +
    '<h1>Sorry&hellip;</h1>' +
    "<p>You're not allowed to download files of that type.</p>" +
    '</body></html>')

  if (e) {
    if (e.message) {
      log.error('403 Bad MIME - ' + e.message)
    } else {
      log.error('403 Bad MIME - ' + e)
    }
  } else {
    log.error('403 Bad MIME ')
  }
})

handler.on('badRequest', function (res, e) {
  errorHeader(res, 400)
  res.end('<!DOCTYPE html><html lang="en">' +
    '<head><title>400 Bad request</title></head>' +
    '<body>' +
    '<h1>Sorry</h1>' +
    "<p>I couldn't understand that I'm afraid; the syntax appears malformed.</p>" +
    '</body></html>')

  if (e) {
    if (e.message) {
      log.error('400 Bad Request - ' + e.message)
    } else {
      log.error('400 Bad Request - ' + e)
    }
  } else {
    log.error('400 Bad Request ')
  }
})

handler.on('noRandomFiles', function (res, e) {
  errorHeader(res, 404)
  res.end('<!DOCTYPE html><html lang="en">' +
    '<head><title>404 Not found</title></head>' +
    '<body>' +
    '<h1>Sorry&hellip;</h1>' +
    "<p>There don't appear to be any files of that type at all there.</p>" +
    '</body></html>')

  if (e) {
    if (e.message) {
      log.error('404 No Random Files - ' + e.message)
    } else {
      log.error('404 No Random Files - ' + e)
    }
  } else {
    log.error('404 No Random Files ')
  }
})

handler.on('notReadFile', function (res, e) {
  errorHeader(res, 404)
  res.end('<!DOCTYPE html><html lang="en">' +
    '<head><title>404 File Read Fail</title></head>' +
    '<body>' +
    '<h1>Ooh dear</h1>' +
    "<p>Sorry, I can't read  that file. Could you try it again?</p>" +
    '</body></html>')

  if (e) {
    if (e.message) {
      log.error('404 Bad File  - ' + e.message)
    } else {
      log.error('404 Bad File  - ' + e)
    }
  } else {
    log.error('404 Bad File  ')
  }
})

module.exports = vidStreamer
