const express = require('express');
const supertest = require('supertest');
const assert = require('assert');
const nakedRedirect = require('./index');

var test = function(original, redirect, opts, bypass, expectCode) {
  const status = opts.status ? opts.status : 302;
  it('should redirect http://' + original + ' to http://' + redirect + ' with ' + status + ' satus code' , function(done) {
    var app = express();

    if (bypass) {
      app.use(nakedRedirect(opts));
    } else {
      app.use(nakedRedirect(opts.rev, opts.sub, opts.status));
    }

    app.get('/test', function(req, res) {
      res.status(200).send(req.hostname);
    });

    supertest(app).get('/test').set('host', original).expect(expectCode || status, done);
  })
}

describe('express-naked-redirect', function() {
  test('domain.com', 'www.domain.com', {});
  test('www.domain.com', 'domain.com', {rev: true});
  test('domain.com', 'sub.domain.com', {sub: 'sub'});
  test('sub.domain.com', 'domain.com', {rev: true, sub: 'sub'});
  test('sub.domain.com', 'domain.com', {rev: true, sub: 'sub', status: 301});

  test('www.domain.com', 'domain.com', {reverse: true}, true);
  test('domain.com', 'sub.domain.com', {subDomain: 'sub'}, true);
  test('sub.domain.com', 'domain.com', {reverse: true, subDomain: 'sub'}, true);
  test('sub.domain.com', 'domain.com', {reverse: true, subDomain: 'sub', status: 301}, true);

  test('sub.domain.com', 'domain.com', {reverse: true, subDomain: 'sub', status: 301, except: '/tes'}, true);
  test('sub.domain.com', 'domain.com', {reverse: true, subDomain: 'sub', status: 301, except: '/test2'}, true);
  test('sub.domain.com', 'domain.com', {reverse: true, subDomain: 'sub', status: 301, except: ['/test2']}, true);

  test('sub.domain.com', 'sub.domain.com', {reverse: true, subDomain: 'sub', status: 301, except: '/test'}, true, 200);
  test('sub.domain.com', 'sub.domain.com', {reverse: true, subDomain: 'sub', status: 301, except: ['/test']}, true, 200);
});
