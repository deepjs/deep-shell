/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 */
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var os = require('os');
var fs = require('fs');
var pathUtil = require("path");
var deep = require("deepjs");

require("deepjs/lib/unit");
require("deepjs/lib/schema");
require("deepjs/lib/stores/collection");
require("deepjs/lib/stores/object");
require("deepjs/lib/view");
var FSChain = require("deep-node/lib/chains/fs");
var FileChain = require("deep-node/lib/chains/file");

deep.globals.plateform = deep.globals.plateform || (os.type().match(/^Win/) ? 'win' : 'unix');
deep.globals.rootPath = deep.globals.rootPath ||  __dirname;
deep.context.cwd = deep.context.cwd || deep.globals.rootPath;

var pathUtil = require("path");
var normalize = function(path) {
	if (path && path[0] !== '/')
		path = pathUtil.normalize(deep.context.cwd + "/" + path);
	return path || deep.context.cwd;
};

deep.sh = deep.sh = function(options) {
	options = options || {};
	var handler = new deep.sh.Chain(null, {
		env: options.env || process.env
	});
	if (options.cwd)
		handler.cd(options.cwd);
	return handler._start();
};

var constructor = function(state, options) {
	options = options || {};
	this._identity = deep.sh.Chain;
	this._locals = {
		plateform: deep.globals.plateform,
		quiet: false,
		env: options.env || process.env
	};
	if (options.cwd)
		this.cd(options.cwd);
};
var proto = {
	/**
	 * private exec
	 */
	_exec: function(cmd, args) {
		var self = this;
		if (args && !args.forEach)
			args = [args];
		args = ((args && args.length) ? args.join(" ") : "");
		var def = deep.Deferred();
		//console.log('________________________ execute : ', cmd, args, deep.context.cwd);
		exec(cmd + " " + args, {
			env: self._locals.env,
			cwd: deep.context.cwd
		}, function(error, stdout, stderr) {
			//console.log("_____________________________________ EXEC RES : ", error, stdout, stderr)
			if (deep.sh.verbose)
				console.log(cmd + "\n", error || stdout ||  stderr);
			if (error)
				return def.reject(deep.errors.Internal(stderr, error));
			
			def.resolve(stdout);
		});
		return def.promise();
	},
	cd: function(cwd) {
		var self = this;
		var func = function(s, e) {
			cwd = normalize(cwd);
			self.toContext("cwd", pathUtil.resolve(cwd))
			.exists(".", true)
			.done(function() {
				return s;
			});
		};
		func._isDone_ = true;
		return self._enqueue(func);
	},
	pwd: function() {
		var self = this;
		var func = function(s, e) {
			if (deep.sh.verbose)
				console.log('pwd \n '+deep.context.cwd);
			return deep.context.cwd;
		};
		func._isDone_ = true;
		return self._enqueue(func);
	},
	exec: function(cmd, args) {
		var self = this;
		var func = function(s, e) {
			if (typeof args === 'undefined')
				args = [];
			return self._exec(cmd, args);
		};
		func._isDone_ = true;
		return self._enqueue(func);
	},
	/*spawn:function(cmd, args){
		var self = this;
		var func = function(s,e){
			args = args || [];
			if(!args.forEach)
				args = [args];
			var proc = null;
			var cmder = proc = spawn(cmd, args, self._env.state),
			def = deep.Deferred();
			self._env.shell = function(){ return proc; };
			var report = {
				"out":"",
				"error":"",
				code:0
			};
			if(!self._env.quiet)
				console.log("deep.sh.Chain :", self._env.state.cwd, " : spawn : ", cmd, args);
			cmder.stdout.on('data', function (data) {
				if(!self._env.quiet)
					console.log('stdout: ', data.toString());
				report.out += data.toString();
			});

			cmder.stderr.on('data', function (data) {
				if(!self._env.quiet)
					console.warn('stderr: ', data.toString());
				report.error += data.toString();
			});

			cmder.on('close', function (code) {
				if(!self._env.quiet)
					console.log(cmd, ': child process exited with code ' + code);
				report.code = code;
				self._env.shell = null;
				if(code === 0)
					def.resolve(report);
				else
					def.reject(report);
			});
			return def.promise();
		};
		func._isDone_ = true;
		return self._enqueue(func);
	},*/
	ls: function(path, options) {
		var self = this;
		options = options || ["-lah"];
		if (!options.forEach)
			options = [options];
		var func = function(s, e) {
			options.push(path);
			return self._exec("ls", options);
		};
		func._isDone_ = true;
		return self._enqueue(func);
	},
	echo: function(arg) {
		var self = this;
		var func = function(s, e) {
			// console.log(" SH echo \n",arg);
			return self._exec("echo", String(arg || s));
		};
		func._isDone_ = true;
		return self._enqueue(func);
	},
	mkdir: function(name, p) {
		var self = this;
		if (p === undefined)
			p = true;
		var func = function(s, e) {
			return self._exec("mkdir", ((p) ? '-p ' : '') + name)
			.done(function(sc){
				return s;
			});
		};
		func._isDone_ = true;
		return self._enqueue(func);
	},
	rm: function(path, rf) {
		var self = this;
		if (rf === undefined)
			rf = false;
		var func = function(s, e) {
			//path = normalize(path);
			return self._exec("rm", ((rf) ? '-rf ' : '') + path)
			.done(function(sc){
				return s;
			});
		};
		func._isDone_ = true;
		return self._enqueue(func);
	},
	cat: function(path) {
		var self = this;
		var func = function(s, e) {
			//path = normalize(path);
			return self._exec("cat", path);
		};
		func._isDone_ = true;
		return self._enqueue(func);
	},
	touch: function(path) {
		var self = this;
		if (rf === undefined)
			rf = false;
		var func = function(s, e) {
			//path = normalize(path);
			return self._exec("touch", path)
			.done(function(sc){
				return s;
			});
		};
		func._isDone_ = true;
		return self._enqueue(func);
	}
};

deep.sh.Chain = deep.compose.Classes(deep.Promise, constructor, proto);

deep.sh.Chain._aspects = {
	constructor: constructor,
	proto: proto
};

deep.Promise.API.sh = function(cwd) {
	var handler = new deep.sh.Chain(this._state, {
		cwd: cwd
	});
	self._enqueue(handler);
	return handler;
};

deep.sh.Chain.addHandle = function(name, func) {
	deep.sh.Chain.prototype[name] = func;
	return deep.sh.Chain;
};

deep.sh.Protocol = function(name, options) {
	return deep.protocol(name, {
		protocol: name,
		get: function(request, opt) {
			var methodIndex = request.indexOf(" "),
				method, args;
			if (methodIndex > -1) {
				method = request.substring(0, methodIndex);
				args = request.substring(methodIndex + 1);
			}
			// console.log("______________ sh protoc : get : ", name, request, opt, "_____"+ method +"_"+ args);
			var handler = new deep.sh.Chain(null, options);
			if (method && handler[method])
				handler[method](args);
			else
				handler.exec(request);
			return handler._start();
		}
	});
};

module.exports = deep.sh.Chain;

(function() {

	deep.ssh = function(options) {
		return new deep.ssh.Chain(null, options)._start();
	};

	var constructor = function(state, options) {
		options = options ||  {};
		this._locals = options;
		this._identity = deep.ssh.Chain;
		this._locals.cwd = options.cwd || "~";
	};

	var proto = {
		_exec: deep.compose.before(function(cmd, args) {
			args = ((args && args.length) ? args.join(" ") : "");
			cmd = (cmd + " " + args).replace(/\"/g, "\\\"");
			if (this._locals.cwd !== '~')
				cmd = "cd " + this._locals.cwd + " && " + cmd;
			var wrappedCmd = "ssh " + this._locals.user + "@" + this._locals.host;
			if (this._locals.identityFile)
				wrappedCmd += ' -i ' + this._locals.identityFile;
			wrappedCmd += ' "' + cmd + '"';
			return deep.Arguments([wrappedCmd, []]);
		}),
		cd: function(cwd) {
			var self = this;
			var func = function(s, e) {
				self._locals.cwd = cwd;
				return s;
			};
			func._isDone_ = true;
			return self._enqueue(func);
		},
		pwd: function() {
			var self = this;
			var func = function(s, e) {
				return self._exec("pwd")
					.done(function(s) {
						//console.log("____________________________________________ PWD SSH RES : ", s);
						self._locals.cwd = s;
					});
			};
			func._isDone_ = true;
			return self._enqueue(func);
		}
	};

	deep.ssh.Chain = deep.compose.Classes(deep.Promise, constructor, deep.sh.Chain._aspects.proto, proto);

	deep.ssh.Chain._aspects = {
		constructor: constructor,
		proto: proto
	};

	deep.Promise.API.ssh = function(options) {
		var handler = new deep.ssh.Chain(this._state, options);
		this._enqueue(handler);
		return handler;
	};

	deep.ssh.Protocol = function(name, options) {
		return deep.protocol(name, {
			protocol: name,
			get: function(request, opt) {
				// console.log("______________ ssh protoc : get : ", name, request, opt);
				var methodIndex = request.indexOf(" "),
					method, args;
				if (methodIndex > -1) {
					method = request.substring(0, methodIndex);
					args = request.substring(methodIndex+1);
				}
				var handler = new deep.ssh.Chain(null, options);
				if (method && handler[method])
					handler[method](args);
				else
					handler.exec(request);
				return handler._start();
			}
		});
	};

})();
/*
deep.sh().rm("test1", true).mkdir("test1").cd("test1").delay(300).log("should be test1").pwd().logError();
deep.sh().rm("test2", true).delay(100).mkdir("test2").cd("test2").log("should be test2").pwd().logError();
deep.sh().rm("test3", true).mkdir("test3").cd("test3").delay(20).log("should be test3").pwd().logError();
deep.sh().rm("test4", true).delay(150).mkdir("test4").cd("test4").log("should be test4").pwd().logError();

var d = deep.sh().pwd().ssh({ user:"gcoomans", host:"dev.bloup.be"}).pwd().close().pwd()
var d = deep.ssh({ user:"gcoomans", host:"dev.bloup.be"}).cd("..").ls().log()
var d = deep.get("sh::echo $PATH").log()
*/