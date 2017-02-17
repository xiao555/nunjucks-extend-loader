var utils = require('loader-utils');
var fs = require('fs');
var path = require('path');
var nunjucks = require('nunjucks');
var attrParse = require("./lib/attributesParser");
var url = require("url");

var NunjucksLoader = nunjucks.Loader.extend({
    //Based off of the Nunjucks 'FileSystemLoader' 

    init: function(searchPaths, sourceFoundCallback) {
        this.sourceFoundCallback = sourceFoundCallback;
        if(searchPaths) {
            searchPaths = Array.isArray(searchPaths) ? searchPaths : [searchPaths];
            // For windows, convert to forward slashes
            this.searchPaths = searchPaths.map(path.normalize);
        }
        else {
            this.searchPaths = ['.'];
        }
    },

    getSource: function(name) {
        var fullpath = null;
        var paths = this.searchPaths;

        for(var i=0; i<paths.length; i++) {
            var basePath = path.resolve(paths[i]);
            var p = path.resolve(paths[i], name);

            // Only allow the current directory and anything
            // underneath it to be searched
            if(p.indexOf(basePath) === 0 && fs.existsSync(p)) {
                fullpath = p;
                break;
            }
        }

        if(!fullpath) {
            return null;
        }

        this.sourceFoundCallback(fullpath);

        return { 
            src: fs.readFileSync(fullpath, 'utf-8'),
            path: fullpath,
            noCache: this.noCache 
        };
    }
});

module.exports = function(content) {
    this.cacheable();
  
    var callback = this.async();
    var opt = utils.parseQuery(this.query);

    var nunjucksSearchPaths = opt.searchPaths;
    var nunjucksContext = opt.context;
    var root = opt.imgroot;
    // 处理img
    var attributes = ["img:src"];
    var links = attrParse(content, function(tag, attr) {
        return attributes.indexOf(tag + ":" + attr) >= 0;
    });
    links.reverse();
    var data = {};
    // 复制文件
    function copyFile(src, dist) {
        fs.exists(dist, function(exists) {
            if(exists) {
                fs.writeFileSync(dist, fs.readFileSync(src));
            } else {
                fs.open(dist,"w", function(e,fd){
                    if(e) throw e;
                });
                fs.writeFileSync(dist, fs.readFileSync(src));
            }
        });
    }
    // 递归创建目录
    function mkdirs(dirpath, callback) {
        fs.exists(dirpath, function(exists) {
            if(exists) {
                callback();
            } else {
                mkdirs(path.dirname(dirpath), function(){
                    fs.mkdirSync(dirpath);
                    callback();
                });
            }
        });
    }

    var reqfile = "";
    links.forEach(function(link) {
        if(!utils.isUrlRequest(link.value, root)) return;

        var uri = url.parse(link.value);
        var file = path.resolve('src/' + link.value);
        var target = path.resolve('build/' + link.value);
        var dirname = path.dirname(target);
        mkdirs(dirname, function(){
            copyFile(file, target);
        });
    });

    var loader = new NunjucksLoader(nunjucksSearchPaths, function(path) {
        this.addDependency(path);
    }.bind(this));

    var nunjEnv = new nunjucks.Environment(loader);
    nunjucks.configure(null, { watch: false });
    
    var template = nunjucks.compile(content, nunjEnv);
    html = template.render(nunjucksContext);

    callback(null, html);
};
