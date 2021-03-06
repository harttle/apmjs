'use strict'
const log = require('npmlog')
const error = require('../utils/error.js')
const fs = require('fs-extra')
const catchNoEntry = require('../utils/fs.js').catchNoEntry

exports.lock = {dependencies: {}}

exports.reset = function () {
  exports.lock = {dependencies: {}}
}

exports.getPackage = function (name) {
  return exports.lock.dependencies[name] || {}
}

exports.getIntegrity = function (name, version) {
  let lock = exports.getPackage(name)
  if (version && lock.version !== version) {
    return ''
  }
  return lock.integrity
}

exports.getVersion = function (name) {
  return exports.getPackage(name).version
}

exports.saveLockfile = function (root, packages) {
  var lock = {
    name: root.name,
    version: root.version,
    dependencies: {}
  }
  packages.sort((lhs, rhs) => lhs.name > rhs.name ? 1 : -1).forEach(pkg => {
    let version = pkg.version
    let integrity = pkg.integrity

    lock.dependencies[pkg.name] = { version, integrity }
  })
  return fs.writeJson(root.lockfilePath, lock, {spaces: 2})
}

exports.loadLockfile = function (filepath) {
  log.verbose(`loading lock file from ${filepath}`)
  return fs.readJson(filepath)
  .then(lock => {
    log.silly('lock', 'loaded from', filepath, lock)
    exports.lock = lock
  })
  .catch(catchNoEntry)
  .catch(e => {
    throw error.createFrom(e, `failed to load lockfile ${filepath}`)
  })
}
