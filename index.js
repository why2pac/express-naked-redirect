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
          var ps = parseDomain(hostname);
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
  var options;

  if (arguments.length === 1 && typeof arguments[0] === 'object') {
    options = arguments[0];
  } else {
    options = {
      reverse: reverse,
      subDomain: subDomain,
      status: status
    }
  }

  return function(req, res, next) {
    if (typeof(options.reverse) === 'string' && options.subDomain === undefined) {
      options.subDomain = options.reverse;
      options.reverse = false;
    }
    if (options.status === undefined) {
      options.status = 302;
    }

    var domain = subdomainParser.get(req.hostname);
    options.subDomain = options.subDomain || 'www';

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
