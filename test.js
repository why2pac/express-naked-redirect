const express = require('express');
const supertest = require('supertest');
const assert = require('assert');
const nakedRedirect = require('./index');

var test = function(original, redirect, opts) {
  const status = opts.status ? opts.status : 302;
  it('should redirect http://' + original + ' to http://' + redirect + ' with ' + status + ' satus code' , function(done) {
    var app = express();
    app.use(nakedRedirect(opts.rev, opts.sub, opts.status));
    app.get('/test', function(req, res) {
      res.status(500).send(req.hostname);
    });
    
    supertest(app).get('/test').set('host', original).expect(status, done);
  })
}

describe('express-naked-redirect', function() {
  test('domain.com', 'www.domain.com', {});
  test('www.domain.com', 'domain.com', {rev: true});
  test('domain.com', 'sub.domain.com', {sub: 'sub'});
  test('sub.domain.com', 'domain.com', {rev: true, sub: 'sub'});
  test('sub.domain.com', 'domain.com', {rev: true, sub: 'sub', status: 301});
});
