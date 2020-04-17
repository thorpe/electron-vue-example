let config = require('../config')
const fs = require('fs')
const crypto = require('crypto')

const chunkSize = config.storage.chunk_size

const getShaHash = (orgPath, filesize, callback) => {
  // SHA256 해시 계산
  const stream = fs.createReadStream(orgPath, { encoding: 'binary', start: 0, end: Math.min(chunkSize, filesize) - 1, highWaterMark: chunkSize })
  let chunkQueue = ''
  stream.on('data', (chunk) => {
    if (chunk) {
      chunkQueue += chunk
    }
  })

  stream.on('end', () => {
    if (chunkQueue.length > 0) {
      let hash = ''
      try {
        hash = crypto.createHash('sha256').update(chunkQueue).digest('hex')
      } catch (err) {
        callback('Not found hash.')
        return
      }

      callback(null, filesize, hash)
    } else {
      callback('Unknown server error.')
    }
  })
}

module.exports = getShaHash
