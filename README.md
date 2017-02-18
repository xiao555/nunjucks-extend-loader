Nunjucks  Extend Loader (Webpack)
==============================
Recently, I want to make my own frameworks based on webpack and nunjucks. I need a nunjucks loader but both [nunjucks-loader](https://github.com/at0g/nunjucks-loader) and [nunjucks-html-loader](https://github.com/ryanhornberger/nunjucks-html-loader) doesn't meet my needs, so i create this loader based on nunjucks-html-loader.

[![NPM version][npm-image]][npm-url]
[![Github license][github-license-image]][github-url]
[![Github stars][github-image]][github-url]

Usage
-----

This is a very simple webpack loader for nunjucks files., you can use it with HtmlWebpackPlugin like this:

```javascript
var conf = {
        template:  '!!file-loader?name=../' + pathname + '.html!nunjucks-extend-loader?{"searchPaths":["views"],"context":'+ context +',"imgroot":"src"}!views/' + pathname + '.html',
};
config.plugins.push(new HtmlWebpackPlugin(conf));
```

Configuration
-----
`pathname` is the name of html, like `path/to/index.html`.
`searchPaths` is the seq of where the template lie in. If your html is:
```
{% extends 'base.html' %}
```
Then, `searchPaths` tell the loader where to find `base.html`.
`context` is the data you want to render in the template, such as:
```
// context
{
    'title': 'nunjucks'
}

// html
{{ title }}  // nunjucks
```
`imgroot` tell the loader where to find src of `<img>`, the value is path relative to root. The loader will find every `<img src="path">` and copy the file to `./build/path`:
```
// html
<img src="assets/images/bg.jpg">

- root
    - src/assets/images/bg.jpg  
```  
after loader:
```
- root
    - build/assets/images/bg.jpg 
    - src/assets/images/bg.jpg 
```
Example
-----
[Webjucks](https://github.com/xiao555/Webjucks) is my framework use this loader.

Then I want add a function to this loader so that it can configure Nunjuckcs. 






[npm-url]: https://www.npmjs.com/package/nunjucks-extend-loader
[npm-image]: https://img.shields.io/npm/v/nunjucks-extend-loader.svg
[github-url]: https://github.com/xiao555/nunjucks-extend-loader
[github-image]: https://img.shields.io/github/stars/xiao555/nunjucks-extend-loader.svg?style=social&label=Star
[github-license-image]: https://img.shields.io/github/license/xiao555/nunjucks-extend-loader.svg