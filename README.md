deep-shell
=============

Promised based chain to manage shell call (asynchronously obviously).

```javascript

deep.shell(".")
.ls()
.pwd()
.exec("cat -b ../test")
.done(function(s){
	//...
});

```