const _url = require('url');
const _http = require('http');
const _https = require('https');
const _querystring = require('querystring');

const PROTOCOL_TO_REQUEST = {
    'http:': _http,
    'https:': _https
};

const ajax = ({url, method = 'GET', data = '', encoding = 'utf8', ...restOptions}) => new Promise((resolve, reject) => {
    const {protocol, hostname, path, port} = _url.parse(url);
    const options = Object.assign({}, restOptions, {hostname, path, port, method});
    const request = PROTOCOL_TO_REQUEST[protocol].request(options, result => {
        const {statusCode: status, headers} = result;

        result.setEncoding(encoding);
        result.on('data', data => {
            const response = {status, headers, data};
            console.log(data);

            (status < 400 ? resolve : reject)(response);
        })
    });

    request.on('error', error => reject({status: -1}));
    request.end(data);
});

const get = (url, query, options = {}) => {
    url = !query ? url : `${url}?${_querystring.stringify(query)}`;

    return ajax({url, ...options});
};

const post = (url, data = {}, options = {}) => {
    if (typeof data === 'object') {
        data = _querystring.stringify(data);
    }

    const headers = Object.assign({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
    }, options.headers);

    options = Object.assign({
        url, data,
        method: 'POST'
    }, options, {headers});

    return ajax(options);
}

const json = (url, data = {}, options = {}) => {
    if (typeof data === 'object') {
        data = JSON.stringify(data);
    }

    const headers = Object.assign({
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }, options.headers);

    options = Object.assign({
        url, data,
        method: 'POST'
    }, options, {headers});

    return ajax(options);
}

module.exports = {
    ajax, get, post, json
}
