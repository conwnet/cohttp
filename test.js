const assert = require('assert');
const request = require('./request');

const httpGetBaidu = request.get('http://www.baidu.com');
const httpsGetBaidu = request.get('https://www.baidu.com');
const httpPostBaidu = request.post('http://www.baidu.com');
const httpsPostBaidu = request.post('https://www.baidu.com');

httpGetBaidu.then(res => {
    assert.equal(res.status, 200);
    assert.equal(!!res.data.match(/百度一下/), true);
});

httpsGetBaidu.then(res => {
    assert.equal(res.status, 200);
    assert.equal(!!res.data.match(/百度一下/), true);
});

httpPostBaidu.then(res => {
    assert.equal(res.status, 302);
    assert.equal(!!res.data.match(/302 Found/), true);
});

httpsPostBaidu.then(res => {
    assert.equal(res.status, 302);
    assert.equal(!!res.data.match(/302 Found/), true);
});
