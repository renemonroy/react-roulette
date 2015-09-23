var config = require('./config');

var path = require('path'),
  webpack = require('webpack'),
  devServer = config.ip + ':' + config.port;

var escapeRegExpString = function(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

var pathToRegExp = function(p) {
  return new RegExp("^" + escapeRegExpString(p));
};

var fileNames = function(pathDir, paths) {
  return paths.map( function(stFileName) {
    return pathDir + stFileName;
  });
};

var getEntry = function(type) {
  var entry = {
    'vendor' : ['react'],
    'app' : ['./app.js']
  };
  console.log(entry);
  return entry;
};

var getPlugins = function(type) {
  var arr = [];
  arr.push(new webpack.NoErrorsPlugin());
  arr.push(new webpack.optimize.DedupePlugin());
  arr.push(new webpack.optimize.OccurenceOrderPlugin());
  if ( type === 'production') {
    arr.push(new webpack.optimize.UglifyJsPlugin({ output : { comments : false } }));
  }
  arr.push(new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 20 }));
  arr.push(new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.bundle.js", Infinity));
  return arr;
};

module.exports = {
  context : __dirname,
  entry : getEntry(config.env),
  devTool : 'eval',
  output : {
    path : path.join(__dirname, '/build/'),
    publicPath : '/build/',
    filename : '[name].bundle.js',
    chunkFilename : '[hash]/js/[id].bundle.js'
  },
  module : {
    loaders : [
      { test: /\.jsx?$/, loaders: ['babel'], exclude: /node_modules/ },
      { test: /\.css$/, loader: "style!css" },
      { test: /\.scss$/, loader: 'style!css!sass' },
      { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' }
    ],
    preloaders : [
      {
        test : /\.js$/,
        include : pathToRegExp(path.join(__dirname, "app")),
        loader : 'jshint-loader'
      }
    ]
  },
  resolve : {
    extensions : ['', '.js', '.jsx', '.css', '.scss'],
    modulesDirectories : ["web_loaders", "web_modules", "node_loaders", "node_modules"]
  },
  plugins : getPlugins(config.env)
};