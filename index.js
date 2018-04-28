/**
 * Redirects naked(root domain) requests to www or its reverse.
 *
 * @author GONZO <oss@dp.farm>
 */


var subdomainParser = function() {
  const parseDomain = require('parse-domain');
  const parsedDomain = {};

  return {
    get: function(hostname) {
      // Cache, Touch
      if (parsedDomain[hostname] == undefined) {
        try {
          let ps = parseDomain(hostname);
          parsedDomain[hostname] = [ps.subdomain, ps.domain + '.' + ps.tld];
        } catch (e) {
          parsedDomain[hostname] = [null, null];
        }
      }
      return parsedDomain[hostname];
    }
  }
}();

module.exports = function(reverse, subDomain, status) {
  let options;

  if (arguments.length === 1 && typeof arguments[0] === 'object') {
    options = arguments[0];
  } else {
    options = {
      reverse: reverse,
      subDomain: subDomain,
      status: status
    }
  }

  if (options.except) {
    if (typeof options.except === 'string') {
      options.except = [options.except];
    }

    // Assertion
    if (typeof options.except.length !== 'number') {
      throw new Error('Except option must be set with an array or string.');
    }

    let UrlPattern;

    try {
      UrlPattern = require('url-pattern');
    }
    catch (e) {
      console.error(e)
      throw new Error('The third party module `url-pattern` is required.');
    }

    for (let i = 0; i < options.except.length; i++) {
      options.except[i] = new UrlPattern(options.except[i]);
    }
  }

  return function(req, res, next) {
    let domain = subdomainParser.get(req.hostname);
    options.subDomain = options.subDomain || 'www';

    if (options.except) {
      for (let i = 0; i < options.except.length; i++) {
        if (options.except[i].match(req.url)) {
          return next();
        }
      }
    }

    if (typeof(options.reverse) === 'string' && options.subDomain === undefined) {
      options.subDomain = options.reverse;
      options.reverse = false;
    }
    if (options.status === undefined) {
      options.status = 302;
    }

    if (domain[0] == '' && !options.reverse) {
      res.redirect(options.status, req.protocol + '://' + options.subDomain + '.' + domain[1] + req.url);
      return;
    } else if (domain[0] == options.subDomain && options.reverse) {
      res.redirect(options.status, req.protocol + '://' + domain[1] + req.url);
      return;
    }

    return next();
  }
};
