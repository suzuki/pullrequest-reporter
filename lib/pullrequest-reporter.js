'use strict';

function PullrequestReporter(nconf, github, swig) {
  this.nconf = nconf;
  this.github = github;
  this.swig = swig;
}

/**
 * @param {string} start
 * @param {string} end
 * @return {Promise}
 */
PullrequestReporter.prototype.getPullRequestNumbers = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    var pullRequestNumbers = [];

    self.github.repos.getCommits({
      user: self.nconf.get('user'),
      repo: self.nconf.get('repo'),
      sha: self.nconf.get('branch'),
      since: self.nconf.get('start'),
      until: self.nconf.get('end')
    }, function(error, response) {
      if (error !== null) {
        reject(error);
      } else {
        var regex = RegExp(self.nconf.get('regex'));

        if (response.length === 0) {
          reject('no commit found.');
          return;
        }

        for (var i = 0; i < response.length; i++) {
          var found = regex.exec(response[i].commit.message);
          if (found !== null) {
            pullRequestNumbers.push(found[1]);
          }
        }

        resolve(pullRequestNumbers);
      }
    });
  });
};

/**
 * @param {integer} number
 * @return {Promise}
 */
PullrequestReporter.prototype.getPullRequestInfo = function(number) {
  var self = this;

  return new Promise(function(resolve, reject) {
    self.github.pullRequests.get({
      number: number,
      user: self.nconf.get('user'),
      repo: self.nconf.get('repo')
    }, function(error, response) {
      if (error !== null) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

/**
 * @param {array} numbers
 * @return {Promise}
 */
PullrequestReporter.prototype.getPullRequestInfos = function(numbers) {
  var self = this;

  return Promise.all(numbers.map(function(number) {
    return self.getPullRequestInfo(number);
  }));
};

/**
 * @param {array} infos
 * @return {Promise}
 */
PullrequestReporter.prototype.outputReport = function(infos) {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (infos.length === 0) {
      reject('no infos');
    }

    var report = {
      start: self.nconf.get('start'),
      end: self.nconf.get('end'),
      infos: infos
    };
    var html = self.swig.renderFile(__dirname + '/../template/report.html', report);

    process.stdout.write(html);

    resolve();
  });
};

module.exports = PullrequestReporter;
