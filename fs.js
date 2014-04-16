var fs = require('fs');
var pathUtil = require("path");
var deep = require("deepjs");
var addInChain = deep.chain.addInChain;
module.exports = {
	stat:function(path){
		var self = this;
		path = path || '';
		var func = function(s,e){
			path = pathUtil.normalize(self._env.state.cwd+"/"+path);
			return deep.async(fs, "stat", [path])
			.done(function(){

			})
			.log();
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	rename:function(oldPath, newPath){
		var self = this;
		var func = function(s,e){
			oldPath = pathUtil.normalize(self._env.state.cwd+"/"+oldPath);
			newPath = pathUtil.normalize(self._env.state.cwd+"/"+newPath);
			return deep.async(fs, "rename", [oldPath, newPath])
			.done(function(){
				return true;
			});
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	chown:function(path, uid, gid){
		var self = this;
		path = path || '';
		var func = function(s,e){
			path = pathUtil.normalize(self._env.state.cwd+"/"+path);
			return deep.async(fs, "chown", [path, uid, gid])
			.done(function(){
				return true;
			});
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	chmod:function(path, mode){
		var self = this;
		path = path || '';
		var func = function(s,e){
			path = pathUtil.normalize(self._env.state.cwd+"/"+path);
			return deep.async(fs, "chmod", [path, mode])
			.done(function(){
				return true;
			});
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	exists:function(path, assertion){
		var self = this;
		path = path || '';
		var func = function(s,e){
			path = pathUtil.normalize(self._env.state.cwd+"/"+path);
			var def = deep.Deferred();
			fs.exists(path, function(res){
				if(!res && assertion)
					def.reject(false);
				else
					def.resolve(res);
			})
			return def.promise();
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	link:function(srcpath, dstpath){
		var self = this;
		var func = function(s,e){
			srcpath = pathUtil.normalize(self._env.state.cwd+"/"+srcpath);
			dstpath = pathUtil.normalize(self._env.state.cwd+"/"+dstpath);
			return deep.async(fs, "link", [srcpath, dstpath])
			.done(function(){
				return true;
			});
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	unlink:function(path){
		var self = this;
		path = path || '';
		var func = function(s,e){
			path = pathUtil.normalize(self._env.state.cwd+"/"+path);
			return deep.async(fs, "unlink", [path])
			.done(function(){
				return true;
			});
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	readlink:function(path){
		var self = this;
		path = path || '';
		var func = function(s,e){
			path = pathUtil.normalize(self._env.state.cwd+"/"+path);
			return deep.async(fs, "readlink", [path]);
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	readdir:function(path){
		var self = this;
		path = path || '';
		var func = function(s,e){
			path = pathUtil.normalize(self._env.state.cwd+"/"+path);
			return deep.async(fs, "readdir", [path]);
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	rmdir:function(path){
		var self = this;
		var func = function(s,e){
			path = pathUtil.normalize(self._env.state.cwd+"/"+path);
			return deep.async(fs, "rmdir", [path])
			.done(function(){
				return true;
			});
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	mkdir:function(path, mode){
		var self = this;
		var func = function(s,e){
			path = pathUtil.normalize(self._env.state.cwd+"/"+path);
			return deep.async(fs, "mkdir", [path, mode])
			.done(function(){
				return true;
			});
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	close:function(){
		var self = this;
		var func = function(s,e){
			if(!self._env.fd || !self._env.fd.length)
				return s;
			path = pathUtil.normalize(self._env.state.cwd+"/"+path);
			return deep.async(fs, "close", [self._env.fd.pop()])
			.done(function(){
				return true;
			});
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	open:function(path, flags, mode){
		var self = this;
		flags = flags || 'a+';
		var func = function(s,e){
			self._env.fd = self._env.fd || [];
			path = pathUtil.normalize(self._env.state.cwd+"/"+path);
			return deep.async(fs, "open", [path, flags, mode])
			.done(function(fd){
				self._env.fd.push(fd);
			});
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	write:function(buffer, offset, length, position){
		var self = this;
		var func = function(s,e){
			if(!self._env.fd || !self._env.fd.length)
				return deep.errors.Internal("you try to write on no opened file")
			var fd = self._env.fd[self._env.fd.length-1];
			return deep.async(fs, "write", [buffer, offset, length, position]);
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	read:function(buffer, offset, length, position){
		var self = this;
		var func = function(s,e){
			if(!self._env.fd || !self._env.fd.length)
				return deep.errors.Internal("you try to read on no opened file")
			var fd = self._env.fd[self._env.fd.length-1];
			return deep.async(fs, "read", [buffer, offset, length, position]);
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	from:function(path, options){
		var self = this;
		options = options || {};
		options.type = options.type || 'json';
		var func = function(s,e){
			path = pathUtil.normalize(self._env.state.cwd+"/"+path);
			return deep.async(fs, "readFile", [path, options])
			.done(function(s){
				switch(options.type)
				{
					case 'binary': return s;
					case 'json': return JSON.parse(String(s));
					default : return String(s);
				}
			})
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	to:function(path, data, options){
		var self = this;
		var func = function(s,e){
			path = pathUtil.normalize(self._env.state.cwd+"/"+path);
			return deep.async(fs, "writeFile", [path, data, options]);
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	},
	appendTo:function(path, data, options){
		var self = this;
		var func = function(s,e){
			path = pathUtil.normalize(self._env.state.cwd+"/"+path);
			return deep.async(fs, "appendFile", [path, "\r\n"+data, options]);
		};
		func._isDone_ = true;
		return addInChain.call(self, func);
	}
};
