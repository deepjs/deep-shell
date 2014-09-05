var deep = require("deepjs");
require("../index"); // deep.sh + deep.fs + more

var	minor = /^(\d+\.\d+\.)(\d+)/,
	revision = /^(\d+\.)(\d+)(\.\d+)/,
	major = /^(\d+)(\.\d+\.\d+)/;

var bumpVersion = function(type, path)
{
	console.log("bump version : ", path, type);
	var tag;
	deep.fs(path)
	.from("package.json")
	.done(function(pck){
		switch(type)
		{
			case "revision" :
				var matched = revision.exec(pck.version);
				if(!matched)
					return deep.errors.Internal("no revision could be matched with : " + pck.version);
				tag = matched[1] + ( parseInt(matched[2], 10) + 1 ) + matched[3];
				break;
			case "major" : 
				var matched = major.exec(pck.version);
				if(!matched)
					return deep.errors.Internal("no major could be matched with : " + pck.version);
				tag = ( parseInt(matched[1], 10) + 1 ) + matched[2];
				break;
			default : 
				var matched = minor.exec(pck.version);
				if(!matched)
					return deep.errors.Internal("no minor could be matched with : " + pck.version);
				tag = matched[1] + ( parseInt(matched[2], 10) + 1 );
		}
		pck.version = tag;
	})
	.to("package.json")
	.sh()
	.exec("git add -A")
	.exec('git commit -m "bump version '+tag+'"')
	.exec('git push origin master')
	.done(function(){
		this.exec('git tag '+tag);
	})
	.exec("git push origin --tags")
	.exec('npm publish')
	.slog("bump done.")
	.elog("bump fail.");
};


module.exports = {
	bumpVersion:bumpVersion
};