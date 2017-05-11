express-naked-redirect
======================

[![Dependency Status](https://david-dm.org/why2pac/express-naked-redirect.svg)](https://david-dm.org/why2pac/express-naked-redirect)

expressNakedRedirect is a middleware for Express that redirects naked(root domain) request to www or its reverse.

## Installation

```bash
$ npm install express-naked-redirect --save
```

## Features

* Redirect **naked**(root domain, non-www) request **to** **www**.
* Redirect **www** request **to** **naked**(root domain, non-www).
* Redirect **naked**(root domain, non-www) request **to** **specific subdomain**.
* Redirect **specific subdomain** request **to** **naked**(root domain, non-www).

## Usage

### Redirect naked to www

It allows you to redirect http://domain.tld to http://www.domain.tld

```Javascript
app.use(require('express-naked-redirect')())
```

### Redirect www to naked

It allows you to redirect http://www.domain.tld to http://domain.tld

```Javascript
app.use(require('express-naked-redirect')(true))
```

### Redirect naked to specific subdomain

It allows you to redirect http://domain.tld to http://sub.domain.tld

```Javascript
app.use(require('express-naked-redirect')('sub'))
```

### Redirect specific subdomain to naked

It allows you to redirect http://sub.domain.tld to http://domain.tld

```Javascript
app.use(require('express-naked-redirect')(true, 'sub'))
```

## License

[MIT License](http://www.opensource.org/licenses/mit-license.php)

## Author

[GONZO](https://github.com/why2pac) ([oss@dp.farm](mailto:oss@dp.farm))
