# deepstream.io-pipeline

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][depstat-image]][depstat-url]

> A PermissionHandler pipeline for deepstream.io

## Table of contents
* [Install](#install)
* [Basic info](#basic-info)
* Usage
  * [Usage (ES2015)](#usage-es2015)
  * [Usage (ES5)](#usage-es5)

## Install

```sh
npm i -D deepstream.io-pipeline
```

## Basic info
`deepstream.io-pipeline` provides a *PermissionHandler* pipeline for [deepstream.io](http://deepstream.io), allowing you to add multiple *strategies* that are isolated from eachother but will run in a non-blocking sequence. The sequence will run in the same order you added each strategy with the `addPipelineStep` method. So if you added a strategy called `JWTStrategy` first, that strategy will be "tested" first on each login attempt.

The API is compatible with deepstreams' `PermissionHandler` API, and to add the pipeline to your current codebase is as trivial as copy-pasting.

If none of the steps in the pipeline calls the callback in `isValidUser` without errors, the error from the last step in the pipeline is returned to the user. This basically means that the user autenticating either has incorrect credentials or tries to authenticate with data that is unknown to your strategies/steps.

To save resources and time you should plan your pipeline beforehand. For example steps that requires talking to the database should be placed last in the pipeline.  
Bad pipeline:  
`JSONWebToken -> Username & Password -> API-key -> Guest (no username/password)`  
Good pipeline:  
`Guest (no username/password) -> JSONWebToken -> Username & Password -> API-key`

## Usage (ES2015)

```js
import DeepstreamServer from 'deepstream.io'
import Pipeline from 'deepstream.io-pipeline'

class JWTStrategy {
  isValidUser(connectionDetails, authData, callback) {
    if (authData.username === 'mike') {
      callback(null, authData.username)
    } else {
      callback('incorrect credentials')
    }
  }

  // All users authenticated via the JWTStrategy will use
  // this canPerformAction method, isolated from the other
  // strategies you may have added to the pipeline.
  canPerformAction(username, message, callback) {
    callback(null, true)
  }

  // Same as above comment
  onClientDisconnect(username) {}
}

const permissionHandler = new Pipeline()

permissionHandler
  .addPipelineStep({
    isValidUser(connectionDetails, authData, callback) {
      if (!authData.username) {
        callback(null, 'guest')
      } else {
        callback('incorrect details')
      }
    },
    canPerformAction(guest, message, callback) {
      callback(null, true)
    }
  })
  .addPipelineStep(new JWTStrategy())
  .addPipelineStep(...)

const server = new DeepstreamServer()

server.set('PermissionHandler', permissionHandler) // Set the pipeline as the PermissionHandler

```

## Usage (ES5)

```js
var DeepstreamServer = require('deepstream.io')
var Pipeline = require('deepstream.io-pipeline')

function JWTStrategy() {}

JWTStrategy.prototype.isValidUser = function(connectionDetails, authData, callback) {
  if (authData.username === 'mike') {
    callback(null, authData.username)
  } else {
    callback('incorrect credentials')
  }
}

// All users authenticated via the JWTStrategy will use
// this canPerformAction method, isolated from the other
// strategies you may have added to the pipeline.
JWTStrategy.prototype.canPerformAction = function(username, message, callback) {
  callback(null, true)
}

// Same as above comment
JWTStrategy.prototype.onClientDisconnect = function(username) {}

var permissionHandler = new Pipeline()

permissionHandler
  .addPipelineStep({
    isValidUser: function(connectionDetails, authData, callback) {
      if (!authData.username) {
        callback(null, 'guest')
      } else {
        callback('incorrect details')
      }
    },
    canPerformAction: function(guest, message, callback) {
      callback(null, true)
    }
  })
  .addPipelineStep(new JWTStrategy())
  .addPipelineStep(...)

var server = new DeepstreamServer()

server.set('PermissionHandler', permissionHandler) // Set the pipeline as the PermissionHandler
```

### API

#### `addPipelineStep(step)`
* Arguments:
  * step - `Object` or `Array` of objects with `isValidUser` (etc)-methods available.

## License

MIT © [Rabalder Media](https://rabaldermedia.se)

[npm-url]: https://npmjs.org/package/deepstream.io-pipeline
[npm-image]: https://img.shields.io/npm/v/deepstream.io-pipeline.svg?style=flat-square

[travis-url]: https://travis-ci.org/rabaldermedia/deepstream.io-pipeline
[travis-image]: https://img.shields.io/travis/rabaldermedia/deepstream.io-pipeline.svg?style=flat-square

[depstat-url]: https://david-dm.org/rabaldermedia/deepstream.io-pipeline
[depstat-image]: https://david-dm.org/rabaldermedia/deepstream.io-pipeline.svg?style=flat-square
