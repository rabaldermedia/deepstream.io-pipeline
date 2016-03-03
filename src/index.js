'use strict'

/**
 * The Pipeline calls each step in the same sequence
 * they were added but each step is called asynchronously
 */
export default class Pipeline {

  constructor () {
    this._steps = []
  }

  /** Public API **/

  /**
   * Adds a step or multiple steps to the end of the pipeline
   *
   * @param {Array|Object} step Either an Array of objects or a single object
   */
  addPipelineStep (step) {
    if (Array.isArray(step)) {
      this._steps = this._steps.concat(step)
    } else {
      this._steps.push(step)
    }
    return this
  }

  /**
   * The "proxy method" for isValidUser that is called by Deepstream
   * NOTE: Do not call this method directly as it's called by Deepstream
   *
   * @param  {Any} args   The arguments passed from Deepstream (see https://deepstream.io/tutorials/authentication.html)
   */
  isValidUser (connectionData, authData, callback) {
    this._callback = callback
    this._proxy(0, connectionData, authData)
  }

  /**
   * The "proxy method" for canPerformAction that is called by Deepstream
   * NOTE: Do not call this method directly as it's called by Deepstream
   *
   * @param   {Object} result   Contains the pipeline index and any data returned by isValidUser
   * @param   {Any}    args     The arguments passed by Deepstream
   * @returns {Any}             Any data returned by the proxied call
   */
  canPerformAction (result, ...args) {
    let { index, data } = result
    if (this._steps[index].canPerformAction instanceof Function) {
      return this._steps[index].canPerformAction(data, ...args)
    }
  }

  /**
   * The "proxy method" for onClientDisconnect that is called by Deepstream
   * NOTE: Do not call this method directly as it's called by Deepstream
   *
   * @param   {Object} result Contains the pipeline index and any data returned by isValidUser
   * @returns {Any}           Any data returned by the proxied call
   */
  onClientDisconnect (result) {
    let { index, data } = result
    if (this._steps[index].onClientDisconnect instanceof Function) {
      return this._steps[index].onClientDisconnect(data)
    }
  }

  /** Private API **/

  /**
   * Proxies the isValidUser call to each step in the pipeline in sequence
   * @param  {Number}   index   The current index in the pipeline
   * @param  {Function} resolve Promise resolve function
   * @param  {Funciion} reject  Promise reject function
   * @param  {Any}      args    The arguments passed to the initial isValidUser function
   */
  _proxy (index, ...args) {
    if (!this._steps[index]) {
      this._finishAttempt(this._lastErr) // pipeline is empty, callback with error from last step
    } else {
      process.nextTick(() => {
        if (this._steps[index].isValidUser instanceof Function) {
          this._steps[index].isValidUser(...args, (err, data) => {
            if (err) {
              this._lastErr = err
              this._proxy(++index, ...args)
            } else {
              this._finishAttempt(null, index, data)
            }
          })
        } else {
          this._proxy(++index, ...args)
        }
      })
    }
  }

  /**
   * Callback for when there's a successful login attempt or the pipeline ends
   * @param  {String} err   Error passed from the steps' isValidUser method
   * @param  {Number} index The current index in the pipeline
   * @param  {Any}    data  Optional data passed by the steps' isValidUser method
   * @return {Function}     Callback
   */
  _finishAttempt (err, index, data) {
    if (err) return this._callback(err)
    return this._callback(null, { index, data })
  }

}
