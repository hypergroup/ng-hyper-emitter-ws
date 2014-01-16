/**
 * Module dependencies
 */

var ws = require('engine.io');
var angular = window.angular;

/**
 * Create the hyper-emitter-ws module
 */

var pkg = module.exports = angular.module('ng-hyper-emitter-ws', ['ng-hyper']);

/**
 * Factory for connecting to a emitter endpoint
 */

pkg.factory('hyperEmitterWs', [
  'hyperHttpEmitter',
  function(emitter) {
    var count = 0;
    var socks = {};
    var urls = {};

    function sendAll(url, add) {
      angular.forEach(socks, function(sock) {
        send(sock, url, add);
      });
    }

    function send(sock, url, add) {
      sock.send((add ? '+' : '-') + url);
    }

    emitter.subscribe(function(url) {
      urls[url] = true;
      sendAll(url, true);
    });

    emitter.unsubscribe(function(url) {
      delete urls[url];
      sendAll(url, false);
    });

    return function(uri, opts) {
      var id = count++;
      var sock = ws(uri, opts);

      sock.on('close', function() {
        delete socks[id];
        sock.open();
      });

      sock.on('open', function() {
        socks[id] = sock;
        angular.forEach(urls, function(_, url) {
          send(sock, url, true);
        });
      });

      sock.on('message', function(url) {
        emitter.refresh(url);
      });
    };
  }
]);

pkg.name = 'ng-hyper-emitter-ws';
