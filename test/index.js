'use strict'

import test from 'tape'

import Pipeline from '../src/index.js'
import { KeyStrategy, objStrategy } from './mocks/keystrategy.js'

objStrategy.key = 'test3'

const permissionHandler = new Pipeline()
permissionHandler
  .addPipelineStep(new KeyStrategy('test1'))
  .addPipelineStep(new KeyStrategy('test2'))
  .addPipelineStep(objStrategy)

test('pipeline:proxies valid login attempt', (t) => {
  t.plan(6)

  var authData = { key: 'test2' }

  permissionHandler.isValidUser('connectionData', authData, (err, result) => {
    t.equal(err, null)
    t.equal(result.data, 'test2')
    t.equal(result.index, 1)
  })

  permissionHandler.canPerformAction({ index: 1, data: authData }, 'success', (err, boolean) => {
    t.equal(err, null)
    t.equal(boolean, true)
  })

  let onClientDisconnectResult = permissionHandler.onClientDisconnect({ index: 1, data: authData })
  t.equal(onClientDisconnectResult, true)
})

test('pipeline:proxies invalid login attempt', (t) => {
  t.plan(2)

  var authData = { key: 'invalid' }

  permissionHandler.isValidUser('connectionData', authData, (err, result) => {
    t.equal(err, 'wrong key')
    t.equal(result, undefined)
  })
})

test('pipeline:works with normal objects', (t) => {
  t.plan(3)

  var authData = { key: 'test3' }

  permissionHandler.isValidUser('connectionData', authData, (err, result) => {
    t.equal(err, null)
    t.equal(result.data, 'test3')
    t.equal(result.index, 2)
  })
})
