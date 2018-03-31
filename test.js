const assert = require('assert');
const request = require('./request');
const Server = require('./server');

const server = new Server();

server.get(/^\/get/, ({request, response}) => response.body = 1);
server.post(/^\/post/, ({request, response}) => response.body = JSON.stringify(request.body) + 1);

server.listen(5261);
/*
const httpGet404 = request.get('http://localhost:5261/404');
const httpGetLocal = request.get('http://localhost:5261/get?name=netcon');
const httpPostLocal = request.post('http://localhost:5261/post', {name: 'netcon'});
const httpJsonLocal = request.json('http://localhost:5261/post', {name: 'netcon'});

httpGet404.then(res => {
    assert.equal(res.status, 404);
});

httpGetLocal.then(res => {
    assert.equal(res.status, 200);
    assert.equal(res.data, '/get?name=netcon');
});

httpPostLocal.then(res => {
    assert.equal(res.status, 200);
    assert.equal(res.data, '{"name":"netcon"}');
});

httpJsonLocal.then(res => {
    assert.equal(res.status, 200);
    assert.equal(res.data, '{"name":"netcon"}');
});

httpJsonLocal.then(res => {
    assert.equal(res.status, 200);
    assert.equal(res.data, '{"name":"netcon"}');
});

const httpsGetBaidu = request.get('https://www.baidu.com');
const httpsPostBaidu = request.post('https://www.baidu.com');
const httpsJsonBaidu = request.json('https://www.baidu.com');

httpsGetBaidu.then(res => {
    assert.equal(res.status, 200);
    assert.equal(!!res.data.match(/百度一下/), true);
});

httpsPostBaidu.then(res => {
    assert.equal(res.status, 302);
    assert.equal(!!res.data.match(/302 Found/), true);
});

httpsJsonBaidu.then(res => {
    assert.equal(res.status, 302);
    assert.equal(!!res.data.match(/302 Found/), true);
});

console.log('Test Accetped');
*/