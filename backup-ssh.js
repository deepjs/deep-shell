/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 */
var deep = require("deepjs");

//var strrepl = "var repl = require('repl').start({prompt: '> ',input: process.stdin,output: process.stdout });";



module.exports = deep.Shell;

var oldAPI = {
    /*repl: function() {
        var self = this;
        var func = function(s, e) {
            if (self._env.shell)
                self._env.shell.stdin.write("exit\n");

            var proc = self._env.shell = spawn('node -e "'+strrepl+'"');
            var def = deep.Deferred();
            proc.stderr.on('data', function(data) {
                console.log('node:stderr: ', String(data));
            });
            proc.stdout.on('data', function(data) {
                var d = String(data);
                console.log("node > : ", d);
                if (self._waitingProcess) {
                    self._waitingProcess.resolve(d);
                    self._waitingProcess = null;
                }
                if(!self.connected)
                {
                    self.connected = true;
                    def.resolve(true);
                }
            });
            proc.on('uncaughtException', function(e) {
                console.log("node uncaughtException : exit.", e);
                self._env.shell = null;
                self.connected = false;
                // self.removeAllListeners('data');
                proc.stdout.removeAllListeners('data');
                proc.stdin.removeAllListeners('data');
                proc.stderr.removeAllListeners('data');
                proc.removeAllListeners();
                // self.emit('close',self.address);
            });
            proc.on("exit", function() {
                console.log("node exit.")
                self._env.shell = null;
                self.connected = false;
                // self.removeAllListeners('data');
                proc.stdout.removeAllListeners('data');
                proc.stdin.removeAllListeners('data');
                proc.stderr.removeAllListeners('data');
                proc.removeAllListeners();
                // self.emit('close',self.address);
            });
            // Start reading from stdin so we don't exit.
            return def.promise();
        };
        func._isDone_ = true;
        return self._enqueue(func);
    },*/
	/*bash: function() {
		var self = this;
		var func = function(s, e) {
			if (self._env.shell)
				self._env.shell.stdin.write("exit\n");

			var proc = self._env.shell = spawn('bash', [], self._env.state);
			var def = deep.Deferred();
			proc.stderr.on('data', function(data) {
                if(!self._env.quiet)
				    console.log('bash:stderr: ', String(data));
			});
			proc.stdout.on('data', function(data) {
				var d = String(data);
                if(!self._env.quiet)
                    console.log(d);
				if (self._waitingProcess) {
                    var df = self._waitingProcess;
                    self._waitingProcess = null;
					df.resolve(d);
				}
			});
			proc.on('uncaughtException', function() {
				console.log("bash uncaughtException : exit.")
				self._env.shell = null;
				self.connected = false;
				// self.removeAllListeners('data');
				proc.stdout.removeAllListeners('data');
				proc.stdin.removeAllListeners('data');
				proc.stderr.removeAllListeners('data');
				proc.removeAllListeners();
				// self.emit('close',self.address);
			});
			proc.on("exit", function() {
				console.log("bash exit.")
				self._env.shell = null;
				self.connected = false;
				// self.removeAllListeners('data');
				proc.stdout.removeAllListeners('data');
				proc.stdin.removeAllListeners('data');
				proc.stderr.removeAllListeners('data');
				proc.removeAllListeners();
				// self.emit('close',self.address);
			});
			// Start reading from stdin so we don't exit.
            proc.stdin.write("cd "+self._env.state.cwd+"\n");
			def.resolve(true);
			return def.promise();
		};
		func._isDone_ = true;
		return self._enqueue(func);
	},*/
	/*sshspawn: function(address, username, password) {
		var self = this;
		var func = function(s, e) {
			if (self._env.shell)
				self._env.shell.stdin("exit\n");

			var ssh = self._env.shell = spawn('expect', [__dirname + '/login.exp', address, username, password, "-to ConnectTimeout=10", "pwd"], self._env.state);
			var def = deep.Deferred();
			ssh.stderr.on('data', function(data) {
               // if(!self._env.quiet)
				    console.log('__________________________________ ssh:stderr: ', String(data));
			});
            ssh.stdout.on('end', function(data) { console.log("STDOUT END : ", data);});
            ssh.stdout.on('error', function(data) { console.log("STDOUT ERROR : ", data);});
            ssh.stdout.on('exit', function(data) { console.log("STDOUT EXIT : ", data);});
            ssh.stdout.on('message', function(data) { console.log("STDOUT MESSAGE : ", data);});
            ssh.stdout.on('readable', function(data) { console.log("STDOUT REDABLE : ", data);});
            ssh.stdout.on('close', function(data) { console.log("STDOUT CLOSE : ", data);});
			ssh.stdout.on('data', function(data) {
                var end = data[data.length-1];
				console.log("____________________________________________________ ssh:", data.toString('utf8'));
                console.log("____________________________________________________ last char : ", String(end), " - ", end)
				
				if (self.connected) {
					var d = String(data);
					var breaker = d.indexOf("\n");
					d = d.substring(breaker + 1);
                    //if(!self._env.quiet)
					   //console.log(d);
					if (self._waitingProcess) {
                        var df = self._waitingProcess;
						self._waitingProcess = null;
                        df.resolve(d);
					}
					return;
				}
				if (data.toString().match("logged")) {
					self.connected = true;
					console.log("ssh > Connected !");
					def.resolve(true);
					return;
				}
				var str = data.toString().substr(0, 16);
				if (str == "Connection refuse") {
					// self.emit('refused',self.address);
					ssh.kill(ssh.pid);
					self._env.shell = null;
					def.reject("Connection refused.");
					return;
				}
				if (str == "Permission denied") {
					console.log("ssh > Permission denied. exit.")
					ssh.kill(ssh.pid);
					self._env.shell = null;
					def.reject("permission denied.");
					return;
				}
				console.log("ssh > ", data.toString());
			});

			ssh.on("exit", function() {
				console.log("SSH exit.")
				self._env.shell = null;
				self.connected = false;
				// self.removeAllListeners('data');
                ssh.stderr.removeAllListeners('data');
				ssh.stdout.removeAllListeners('data');
				ssh.removeAllListeners();
				// self.emit('close',self.address);
			});
            for(var i in ssh)
                console.log("SSH.API : ", i);
			return def.promise();
		};
		func._isDone_ = true;
		return self._enqueue(func);
	},*/
	pipe: function(target) {
		var self = this;
		var func = function(s, e) {
			if (!self._env.shell)
				return deep.errors.Internal("couldn't pass spipe from nothing. aborting.");
			console.log("> pipe:", target);
			self._env.shell.stdout.pipe(target);
		};
		func._isDone_ = true;
		return self._enqueue(func);

	},
	exit: function() {
		var self = this;
		var func = function(s, e) {
            console.log("> close: exit.");
			if (!self._env.shell)
				return deep.errors.Internal("couldn't close nothing. aborting exit.");
			self._env.shell.stdin.write("exit\n");
		};
		func._isDone_ = true;
		return self._enqueue(func);
	},
    kill:function(pid){
        var self = this;
        var func = function(s, e) {
            if (!self._env.shell && !pid)
                return deep.errors.Internal("couldn't kill nothing. aborting exit.");
            console.log("> kill.");
            self._env.shell.kill(pid || self._env.shell.pid);
        };
        func._isDone_ = true;
        return self._enqueue(func);
    }
}