import 'babel-polyfill';
import Koa from 'koa';
import Router from 'koa-router';
import Logger from 'koa-logger';
import serve from 'koa-static';
import mount from 'koa-mount';
import chokidar from 'chokidar';
import config from '../webpack.config';

const app = new Koa();
const router = new Router();
const logger = new Logger();
const PORT = 3000;
const isDevelopment = process.env.NODE_ENV !== "production";

console.log('(Server) Development:', isDevelopment);

// Webpack
if (isDevelopment) {
  const webpack = require('webpack');
  const koaWebpack = require('koa-webpack');

  const compiler = webpack(config);  
  app.use(koaWebpack({
    compiler
  }))

  // Do "hot-reloading" of react stuff on the server
  // Throw away the cached client modules and let them be re-required next time
  compiler.plugin('done', () => {
    console.log("Clearing /client/ module cache from server");
    Object.keys(require.cache).forEach((id) => {
      if (/[\/\\]client[\/\\]/.test(id)) {
        delete require.cache[id];
      }
    });
  });
}
else {
  app.use(serve('public'));
}

// Request logger
app.use(logger);

// Include server routes as a middleware
app.use(mount('/api', (ctx) => {
	require('./server/app').routes()(ctx);
}));

// Anything else gets passed to the client app's server rendering
router.get('*', (ctx, next) => {
	const { req, res } = ctx;
  const { pathname } = req._parsedUrl;
  if (pathname.split('.').length > 1) {
    ctx.status = 403;
  }
  else {
    require('./client/server-render')(req.path, (err, page) => {
      if (err) return next(err);
      ctx.body = page;
    });
  }
});
app.use(router.routes());

// Do "hot-reloading" of express stuff on the server
// Throw away cached modules and re-require next time
// Ensure there's no important state in there!
const watcher = chokidar.watch('./server');

watcher.on('ready', () => {
  watcher.on('all', () => {
    console.log("Clearing /server/ module cache from server");
    Object.keys(require.cache).forEach((id) => {
      if (/[\/\\]server[\/\\]/.test(id)) {
        delete require.cache[id];
      }
    });
  });
});

app.listen(PORT, () => {
	console.log('Listening on port: %s', PORT);
});
