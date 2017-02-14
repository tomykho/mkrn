import Router from 'koa-router';

const app = new Router();

app.get('/a', function (ctx, next) {
	ctx.body = 'Welcome to MKRN';
});

app.get('/b', (ctx, next) => {
	ctx.body = "bbbb";
});

app.get('/d', (ctx, next) => {
	ctx.body = "wweweweo";
});

module.exports = app;
