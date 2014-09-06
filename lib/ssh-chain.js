var deep = require("deepjs"),
	SHChain = require("./sh-chain");
deep.ssh = function(options) {
	return new deep.ssh.Chain(null, options).resolve();
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

deep.ssh.Chain = deep.Classes(deep.Promise, constructor, SHChain._aspects.proto, proto);

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
				args = request.substring(methodIndex + 1);
			}
			var handler = new deep.ssh.Chain(null, options);
			if (method && handler[method])
				handler[method](args);
			else
				handler.exec(request);
			return handler.resolve();
		}
	});
};

module.exports = deep.ssh.Chain;