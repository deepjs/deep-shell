/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 */
var os = require('os');
var deep = require("deepjs");

require("deepjs/lib/unit");
var dpvalidator = require("deepjs/lib/schema");
require("deep-restful");
require("deep-restful/lib/collection");
require("deep-restful/lib/object");
require("deep-views");
require("deep-routes");
require("deep-jquery/lib/dom")("dom");
require("deep-mongo");
require("deep-swig/lib/nodejs");
require("deep-marked");
require("deep-marked/lib/clients/nodejs");
require("deep-node/lib/chains/fs");
require("deep-node/lib/chains/file");
require("./lib/sh-chain");
require("./lib/ssh-chain");

deep.Validator.set(dpvalidator);

deep.globals.plateform = deep.globals.plateform || (os.type().match(/^Win/) ? 'win' : 'unix');
deep.globals.rootPath = deep.globals.rootPath ||  __dirname;
deep.Promise.context.cwd = deep.Promise.context.cwd || deep.globals.rootPath;

module.exports = deep;

/*
deep.sh().rm("test1", true).mkdir("test1").cd("test1").delay(300).log("should be test1").pwd().elog();
deep.sh().rm("test2", true).delay(100).mkdir("test2").cd("test2").log("should be test2").pwd().elog();
deep.sh().rm("test3", true).mkdir("test3").cd("test3").delay(20).log("should be test3").pwd().elog();
deep.sh().rm("test4", true).delay(150).mkdir("test4").cd("test4").log("should be test4").pwd().elog();

var d = deep.sh().pwd().ssh({ user:"gcoomans", host:"dev.bloup.be"}).pwd().close().pwd()
var d = deep.ssh({ user:"gcoomans", host:"dev.bloup.be"}).cd("..").ls().log()
var d = deep.get("sh::echo $PATH").log()
*/