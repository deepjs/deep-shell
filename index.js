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

var pathUtil = require("path"),
	normalize = pathUtil.normalize;

// todo : load deep-node : declare default protocols and clients, add login/logout/test as http client facilities for autobahn apps
var addInChain = deep.chain.addInChain;
function doExec (handler, cmd){
	var def = deep.Deferred();
	handler._env.process = exec(cmd, handler._env.state, function (error, stdout, stderr) {
		if(error)
			return def.reject(deep.errors.Internal(stderr, error));
		if(!handler._env.quiet)
			console.log(cmd+" : ", stdout || stderr);
		def.resolve(stdout);
	});
	return def.promise();
};

deep.Shell = deep.compose.Classes(deep.Promise,  function (options) {
	options = options || {};
    this._context = deep.utils.shallowCopy(deep.context), env = null;
    if(this._context._env)
    {
    	env = this._context._env = deep.utils.copy(this._context._env);
    	env.state.cwd  = options.cwd || env.state.cwd;
    	env.state.env = options.env || env.state.env;
    }
    else
    {
    	env = this._context._env = {
			plateform : os.type().match(/^Win/) ? 'win' : 'unix',
			quiet:false,
			state:{
				cwd: pathUtil.resolve(options.cwd || "."),
				env: options.env || process.env
			},
			process:null
	    };
    }
    this._env = env;
    this._contextCopied = true;
},
{
	cd:function(path){
		var self = this;
		var func = function(s,e){
			var def = deep.Deferred();
			if(path[0] !== '/')
				path = normalize(self._env.state.cwd+"/"+path);

			fs.stat(path, function(err, stat){
				if(err)
					def.reject(err);
				else if(!stat.isDirectory())
					def.reject(deep.errors.Internal("deep.shell : cd failed : not a directory : "+path));
				else
				{
					self._env.state.cwd = pathUtil.resolve(path);
					def.resolve(true);
				}
			});
			return def.promise();
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	exec:function(cmd){
		var self = this;
		var func = function(s,e){
			return doExec(self, cmd);
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	spawn:function(cmd, args){
		var self = this;
		var func = function(s,e){
			args = args || [];
			if(!args.forEach)
				args = [args];
			var proc = null;
			var cmder = proc = spawn(cmd, args, self._env.state),
			def = deep.Deferred();
			self._env.process = function(){ return proc; };
			var report = {
				"out":"",
				"error":"",
				code:0
			};
			if(!self._env.quiet)
				console.log("deep.shell :", self._env.state.cwd, " : spawn : ", cmd, args);
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
				self._env.process = null;
				if(code === 0)
					def.resolve(report);
				else
					def.reject(report);
			});
			return def.promise();
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	ls:function(path, options){
		var self = this;
		options = options || ["-lah"];
		if(!options.forEach)
			options = [options];
		var func = function(s,e){
			if(path[0] !== '/')
				path = normalize(self._env.state.cwd+"/"+path);
			path = path || self._env.state.cwd;
			var cmd = "ls "+options.join(" ")+" "+path;
			//console.log("cmd ls  :",cmd);
			return doExec(self, cmd);
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	pwd:function(){
		var self = this;
		var func = function(s,e){
			return doExec(self, "pwd");
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	mkdir:function(name, p){
		var self = this;
		if(p === undefined)
			p = true;
		var func = function(s,e){
			return doExec(self, "mkdir "+((p)?'-p ':'')+name);
		};
		func._isDone_ = true;
		return addInChain.call(this, func);
	},
	rm:function(path, rf){
		var self = this;
		if(rf === undefined)
			rf = false;
		var func = function(s,e){
			if(path[0] !== '/')
				path = normalize(self._env.state.cwd+"/"+path);
			return doExec(self, "rm " + ((rf)?'-rf ':'') + path);
		};
		func._isDone_ = true;
		return addInChain.call(this, func);
	},
	cat:function(path){
		var self = this;
		var func = function(s,e){
			if(path[0] !== '/')
				path = normalize(self._env.state.cwd+"/"+path);
			return doExec(self, "cat " + path);
		};
		func._isDone_ = true;
		return addInChain.call(this, func);
	},
	touch:function(path){
		var self = this;
		if(rf === undefined)
			rf = false;
		var func = function(s,e){
			if(path[0] !== '/')
				path = normalize(self._env.state.cwd+"/"+path);
			return doExec(self, "touch " + path);
		};
		func._isDone_ = true;
		return addInChain.call(this, func);
	}
}, require("./fs"));

deep.Shell.addHandle = function (name, func) {
    deep.Shell.prototype[name] = func;
    return deep.Shell;
};

deep.shell = deep.sh = function(cwd, env)
{
	var handler = new deep.Shell({
		env:env || process.env
	});
	if(cwd)
		handler.cd(cwd);
	return handler._start(null, null);
};

exports.shell = deep.shell;

var git = {

};

/*
deep.sh().pwd().cd("..").pwd().log()
deep.sh().delay(100).log("second").pwd().log()
/*
deep.shell().rm("test1", true).mkdir("test1").cd("test1").delay(300).log("should be test1").pwd().logError();
deep.shell().rm("test2", true).delay(100).mkdir("test2").cd("test2").log("should be test2").pwd().logError();
deep.shell().rm("test3", true).mkdir("test3").cd("test3").delay(20).log("should be test3").pwd().logError();
deep.shell().rm("test4", true).delay(150).mkdir("test4").cd("test4").log("should be test4").pwd().logError();
*/


