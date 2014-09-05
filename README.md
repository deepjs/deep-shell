deep-shell
=============

Promised based chain to manage shell call (asynchronously obviously).

```javascript

deep.sh(".")
.ls()
.pwd()
.exec("cat -b ../test")
.done(function(s){
	//...
})
.elog();

```

## install


### globally
To have access to dpsh (cli env with deep-shell, deep-restful, deep-views and deep-node loaded) :
```
> npm install -g deep-shell
```

launch :
```
> dpsh
```

usage :
```javascript
deep.sh(".").pwd()...fs("...").from("...")...elog();
```

example of script in `deep-shell/bin/bmpv` that bump package.json version, update git tag, push everything and publish on npm.

```
> cd your/git/npm/module
> bmpv minor
```

## locally

```
> npm install deep-shell
```

```javascript
var deep = require("deepjs");
require("deep-shell");
deep.sh(".").pwd()...fs("...").from("...")...elog();
```






