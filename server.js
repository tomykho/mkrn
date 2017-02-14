'use strict';

import Koa from 'koa';
import Router from 'koa-router';
import Logger from 'koa-logger';
import mount from 'koa-mount';
import chokidar from 'chokidar';
import config from './webpack.config';
import webpack from 'webpack';
import { devMiddleware, hotMiddleware } from 'koa-webpack-middleware';
import cssModulesRequireHook from 'css-modules-require-hook';

cssModulesRequireHook({generateScopedName: '[path][name]-[local]'});
const compiler = webpack(config);
const app = new Koa();
const webpackApp = new Koa();
const router = new Router();
const logger = new Logger();
const PORT = 3000;

// Serve hot-reloading bundle to client
app.use(devMiddleware(compiler, {
	publicPath: config.output.publicPath
}));
app.use(mount(
	config.output.publicPath,
	hotMiddleware(compiler)
));

// Request logger
app.use(logger);

// Include server routes as a middleware
app.use(mount('/api', function(ctx) {
	require('./server/app').routes()(ctx);
}));

// Anything else gets passed to the client app's server rendering
router.get('*', function(ctx, next) {
	const { req, res } = ctx;
  require('./client/server-render')(req.path, function(err, page) {
    if (err) return next(err);
		ctx.body = page;
  });
});
app.use(router.routes());

// Do "hot-reloading" of express stuff on the server
// Throw away cached modules and re-require next time
// Ensure there's no important state in there!
const watcher = chokidar.watch('./server');

watcher.on('ready', function() {
  watcher.on('all', function() {
    console.log("Clearing /server/ module cache from server");
    Object.keys(require.cache).forEach(function(id) {
      if (/[\/\\]server[\/\\]/.test(id)) delete require.cache[id];
    });
  });
});

// Do "hot-reloading" of react stuff on the server
// Throw away the cached client modules and let them be re-required next time
compiler.plugin('done', function() {
  console.log("Clearing /client/ module cache from server");
  Object.keys(require.cache).forEach(function(id) {
    if (/[\/\\]client[\/\\]/.test(id)) delete require.cache[id];
  });
});

app.listen(PORT, () => {
	console.log('Listening on port: %s', PORT);
});
