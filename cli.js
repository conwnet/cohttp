#!/usr/bin/env node
const _fs = require('fs');
const _path = require('path');
const Server = require('./server');

const isFile = path => {
    return _fs.statSync(path).isFile();
};

const getFileListHtml = (url, dir) => (`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>${_path.resolve(dir)}</title>
    </head>
    <body>
        <ul>
        ${_fs.readdirSync(dir).map(item => {
            const file = _path.join(dir, item);
            const name = isFile(file) ? item : `${item}/`;
            const href = _path.join(url, name);

            return `<li><a href="${href}">${name}</a></li>`;
        }).join('')}
        </ul>
    </body>
    </html>
`);

const getEnv = () => {
    let path = '.';
    let port = 5261;
    const args = process.argv.slice(2);

    for (let i = 0, l = args.length; i < l; i++) {
        const arg = args[i];

        if (arg === '-p' || arg === '--port') {
            if (i + 1 < l) {
                port = +args[++i] || 5261;
            } else {
                console.log('Usage: cohttp [-p port] [path]');
            }
        } else if (arg.startsWith('-')) {
            console.log(`Unknow option: ${arg}`);
        } else {
            path = arg;
        }
    }

    return {port, path: _path.resolve(path)};
};

const env = getEnv();
const server = new Server();
const SUFFIX_TO_TYPE = {
    'html': 'text/html', 'html': 'text/html', 'xml': 'text/xml',
    'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
    'gif': 'image/gif', 'ico': 'image/x-icon',
    'mp3': 'image/mp3', 'mp4': 'image/mp4'
};

server.get(/^\/.*/, ({req, res}) => {
    const dir = isFile(env.path) ? _path.dirname(env.path) : env.path;
    const target = (req.url === '/' && isFile(env.path)) ? env.path : _path.join(dir, req.url);

    if (!_fs.existsSync(target)) {
        res.status = 404;
        res.body = "File Not Exists";
    } else if (isFile(target)) {
        const matches = target.match(/[^\.]*$/i);
        const suffix = matches ? matches[0].toLowerCase() : '';

        res.headers['content-type'] = SUFFIX_TO_TYPE[suffix] || 'text/plain';
        res.body = _fs.readFileSync(target).toString();
    } else {
        res.headers['content-type'] = 'text/html';
        res.body = getFileListHtml(req.url, target);
    }
});

server.listen(env.port);

console.log(`Server worked at ${env.path}`)
console.log(`Server started at http://0.0.0.0:${env.port}/`);
