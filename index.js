#!/usr/bin/env node
'use strict';

require('colors');

var GitHubApi   = require('github');
var appRoot     = require('app-root-path');
var nconf       = require('nconf');
var swig        = require('swig');
var PullrequestReporter = require('./lib/pullrequest-reporter.js');

var nconfArgv = {
  s: {
    alias: 'start',
    describe: 'Start of date. "YYYY-MM-DD" or "YYYY-MM-DD hh:mm:ss"',
    demand: true
  },
  e: {
    alias: 'end',
    describe: 'End of date. "YYYY-MM-DD" or "YYYY-MM-DD hh:mm:ss"',
    demand: true
  },
  t: {
    alias: 'token',
    describe: 'Access token.'
  }
};

var nconfFile = {
  file: appRoot.path + '/.pullrequest-reporter.json'
};

var nconfDefaults = {
  host: 'api.github.com',
  protocol: 'https',
  branch: 'master',
  token: null,
  regex: 'Merge pull request #(\\d+)'
};

// setup configure
nconf
  .argv(nconfArgv)
  .file(nconfFile)
  .defaults(nconfDefaults)
;

// setup GitHub
var github = new GitHubApi({
  version: '3.0.0',
//  debug: true,
  protocol: nconf.get('protocol'),
  host: nconf.get('host')
});

if (nconf.get('token') !== null) {
  github.authenticate({
    type: 'oauth',
    token: nconf.get('token')
  });
}

/**
 * @param {string} error
 */
var onError = function(error) {
  /*eslint-disable quotes */
  process.stderr.write(error.red);
  process.stderr.write("\n");
  /*eslint-enable */
};

var prReporter = new PullrequestReporter(nconf, github, swig);


// main
prReporter.getPullRequestNumbers()
.then(function(numbers) {
  return prReporter.getPullRequestInfos(numbers);
})
.then(function(infos) {
  return prReporter.outputReport(infos);
})
.catch(onError);
