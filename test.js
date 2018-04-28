const express = require('express');
const supertest = require('supertest');
const assert = require('assert');
const nakedRedirect = require('./index');

var test = function(original, redirect, protocolFrom, protocolTo, opts, bypass, expectCode, willBeIgnored) {
  const status = opts.status ? opts.status : 302;
  it(`should redirect ${protocolFrom}://${original} to ${protocolTo}://${redirect} with ${status} status code`, function(done) {
    var app = express();

    if (bypass) {
      app.use(nakedRedirect(opts));
    } else {
      app.use(nakedRedirect(opts.rev, opts.sub, opts.status));
    }

    app.get('/test', function(req, res) {
      res.status(200).send(`${req.protocol}://${req.hostname}`);
    });

    var expPrefix = status === 301 ? 'Moved Permanently.' : 'Found.';
    var expConcat = 'Redirecting to';
    var expUri = `${protocolTo}://${redirect}/test`;

    var expected = `${expPrefix} ${expConcat} ${expUri}`;

    if (willBeIgnored) {
      expected = `${protocolFrom}://${original}`;
    }

    supertest(app).get('/test').set('host', original).expect(expected, done);
  })
}

describe('express-naked-redirect', function() {
  test('domain.com', 'www.domain.com', 'http', 'http', {});
  test('www.domain.com', 'domain.com', 'http', 'http', {rev: true});
  test('domain.com', 'sub.domain.com', 'http', 'http', {sub: 'sub'});
  test('sub.domain.com', 'domain.com', 'http', 'http', {rev: true, sub: 'sub'});
  test('sub.domain.com', 'domain.com', 'http', 'http', {rev: true, sub: 'sub', status: 301});

  test('www.domain.com', 'domain.com', 'http', 'http', {reverse: true}, true);
  test('domain.com', 'sub.domain.com', 'http', 'http', {subDomain: 'sub'}, true);
  test('sub.domain.com', 'domain.com', 'http', 'http', {reverse: true, subDomain: 'sub'}, true);
  test('sub.domain.com', 'domain.com', 'http', 'http', {reverse: true, subDomain: 'sub', status: 301}, true);

  test('sub.domain.com', 'domain.com', 'http', 'http', {reverse: true, subDomain: 'sub', status: 301, except: '/tes'}, true);
  test('sub.domain.com', 'domain.com', 'http', 'http', {reverse: true, subDomain: 'sub', status: 301, except: '/test2'}, true);
  test('sub.domain.com', 'domain.com', 'http', 'http', {reverse: true, subDomain: 'sub', status: 301, except: ['/test2']}, true);

  test('sub.domain.com', 'sub.domain.com', 'http', 'http', {reverse: true, subDomain: 'sub', status: 301, except: '/test'}, true, 200, true);
  test('sub.domain.com', 'sub.domain.com', 'http', 'http', {reverse: true, subDomain: 'sub', status: 301, except: ['/test']}, true, 200, true);

  test('domain.com', 'sub.domain.com', 'http', 'https', {protocol: 'https', subDomain: 'sub'}, true, 200);
  test('sub.domain.com', 'sub.domain.com', 'http', 'https', {protocol: 'https'}, true, 200);
  test('sub.domain.com', 'sub.domain.com', 'http', 'https', {https: true}, true, 200);
});
