
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var os = require('os');
var fs = require('fs');
var pathUtil = require("path");
var deep = require("deepjs");

function doExec (handler, cmd){
	var def = deep.Deferred();
	handler._shell.process = exec(cmd, handler._shell.state, function (error, stdout, stderr) {
		if(error || stderr)
			return def.reject(deep.errors.Internal(stderr, error));
		if(!handler._shell.quiet)
			console.log("deep.shell : "+cmd+" : ", stdout);
		def.resolve(stdout);
	});
	return def.promise();
}

deep.Shell = deep.compose.Classes(deep.BaseChain,  function (options) {
	options = options || {};
    this._shell = {
		plateform : os.type().match(/^Win/) ? 'win' : 'unix',
		quiet:false,
		state:{
			cwd: pathUtil.resolve(options.cwd || "."),
			env: options.env || process.env
		},
		process:null
    };
},
{
	cd:function(path){
		var self = this;
		var func = function(s,e){
			var def = deep.Deferred();
			fs.stat(path, function(err, stat){
				if(err)
					def.reject(err);
				else if(!stat.isDirectory())
					def.reject(deep.errors.Internal("deep.shell : cd failed : not a directory : "+path));
				else
				{
					self._shell.state.cwd = pathUtil.resolve(path);
					def.resolve(true);
				}
			});
			return def.promise();
		};
		func._isDone_ = true;
		return deep.chain.addInChain.apply(this, [func]);
	},
	exec:function(cmd){
		var self = this;
		var func = function(s,e){
			return doExec(self, cmd);
		};
		func._isDone_ = true;
		return deep.chain.addInChain.apply(this, [func]);
	},
	spawn:function(cmd, args){
		var self = this;
		var func = function(s,e){
			args = args || [];
			if(!args.forEach)
				args = [args];
			var cmder = self._shell.process = spawn(cmd, args, self._shell.state),
			def = deep.Deferred();
			var report = {
				"out":"",
				"error":"",
				code:0
			};
			if(!self._shell.quiet)
				console.log("deep.shell :", self._shell.state.cwd, " : spawn : ", cmd, args);
			cmder.stdout.on('data', function (data) {
				if(!self._shell.quiet)
					console.log('stdout: ', data.toString());
				report.out += data.toString();
			});

			cmder.stderr.on('data', function (data) {
				if(!self._shell.quiet)
					console.warn('stderr: ', data.toString());
				report.error += data.toString();
			});

			cmder.on('close', function (code) {
				if(!self._shell.quiet)
					console.log(cmd, ': child process exited with code ' + code);
				report.code = code;
				self._shell.process = null;
				if(code === 0)
					def.resolve(report);
				else
					def.reject(report);
			});
			return def.promise();
		};
		func._isDone_ = true;
		return deep.chain.addInChain.apply(this, [func]);
	},
	ls:function(path, options){
		var self = this;
		options = options || ["-lah"];
		var func = function(s,e){
			path = path || self._shell.state.cwd;
			var cmd = "ls "+options.join(" ")+" "+path;
			return doExec(self, cmd);
		};
		func._isDone_ = true;
		return deep.chain.addInChain.apply(this, [func]);
	},
	pwd:function(){
		var self = this;
		var func = function(s,e){
			return doExec(self, "pwd");
		};
		func._isDone_ = true;
		return deep.chain.addInChain.apply(this, [func]);
	}
});

deep.Shell.addHandle = function (name, func) {
    deep.Shell.prototype[name] = func;
    return deep.Shell;
};
deep.shell = function(cwd, env)
{
	var handler = new deep.Shell({
		env:env || process.env
	});
	if(cwd)
		handler.cd(cwd);
	return handler._start(null, null);
};

exports.shell = deep.shell;




