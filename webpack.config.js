process.env.NODE_ENV = process.env.NODE_ENV || "development";

const webpack = require('webpack');
const path = require('path');
const qs = require('querystring');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const isDevelopment = process.env.NODE_ENV != 'production';
const publicPath = '/';

console.log('(Client) Development:', isDevelopment);

const entry = [
  './src/client/app.js'
];

const plugins = [
  new ExtractTextPlugin('bundle.css'),
];

if (isDevelopment) {
  plugins.push(new webpack.NamedModulesPlugin());
} else {
  plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    })
  );
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
    })
  );
}

let cssLoader;
if (isDevelopment) {
  cssLoader = 'style-loader!css-loader?' + qs.stringify({
    modules: true,
    localIdentName: '[local]'
  });
}
else {
  cssLoader = ExtractTextPlugin.extract({
    fallback: "style-loader",
    use: {
      loader: 'css-loader',
      options: {
        modules: true,
        sourceMap: false,
        minimize: true,
        localIdentName: '[local]'
      }
    }
  });
}

module.exports = {
  devtool: isDevelopment ? '#eval' : '#cheap-module-source-map',
  entry,
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js',
    publicPath
  },
  plugins,
  resolve: {
    extensions: ['.js'],
    alias: {
      request: 'browser-request'
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.join(__dirname, './src/client'),
        query: {
          presets: ["es2015", "react", "stage-0"],
          babelrc: false,
          plugins: [
            "react-hot-loader/babel",
          ]
        }
      },
      {
        test: /\.css$/,
        include: path.join(__dirname, './src/client'),
        loader: cssLoader,
      }
    ]
  }
};
