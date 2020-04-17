const Session = {
  sessions: {},
  add: (session_id, filename, expire, throttle, secure_key) => {
    const self = module.exports
    const session = {
      'session_id': session_id,
      'filename': filename,
      'throttle': throttle,
      'secure_key': secure_key,
      'expire': expire,
      'stream': 0,
      'spent': 0,
      'pipe': 0
    }
    self.sessions[session_id] = session
  },
  remove: (session_id) => {
    const self = module.exports
    if (self.sessions[session_id]) {
      self.sessions[session_id] = undefined
      delete self.sessions[session_id]
    }
  },
  removeContent: (content_id) => {
    const self = module.exports
    const keys = Object.keys(self.sessions)
    keys.forEach((key) => {
      if (self.sessions[key].content_id === content_id) {
        self.remove(key)
      }
    })
  },
  removeExpire: () => {
    const self = module.exports
    const now = new Date().getTime()
    const keys = Object.keys(self.sessions)
    keys.forEach((key) => {
      if (self.sessions[key].expire < now) {
        self.remove(key)
      }
    })
  }
}

module.exports = Session
