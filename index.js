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

module.exports = function(rev, sub) {
  return function(req, res, next) {
    if (typeof(rev) === 'string' && sub === undefined) {
      sub = rev;
      rev = false;
    }

    var domain = subdomainParser.get(req.hostname);
    sub = sub || 'www';

    if (domain[0] == '' && !rev) {
      res.redirect(req.protocol + '://' + sub + '.' + domain[1] + req.url);
      return;
    } else if (domain[0] == sub && rev) {
      res.redirect(req.protocol + '://' + domain[1] + req.url);
      return;
    }

    return next();
  }
};
