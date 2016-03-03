'use strict'

export class KeyStrategy {

  constructor (key) {
    this.key = key
  }

  isValidUser (connectionData, authData, callback) {
    if (authData.key === this.key) {
      callback(null, authData.key)
    } else {
      callback('wrong key')
    }
  }

  canPerformAction (key, message, callback) {
    if (message === 'success') {
      callback(null, true)
    } else {
      callback('err')
    }
  }

  onClientDisconnect (data) {
    return data.key === this.key
  }
}

export const objStrategy = {
  isValidUser (connectionData, authData, callback) {
    if (authData.key === this.key) {
      callback(null, authData.key)
    } else {
      callback('wrong key')
    }
  },

  canPerformAction (key, message, callback) {
    callback(null, true)
  },

  onClientDisconnect (data) {
    return data.key === this.key
  }
}
