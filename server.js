const _http = require('http');
const _querystring = require('querystring');

const CONTENT_TYPE_TO_DECODE = {
    'application/x-www-form-urlencoded': _querystring.parse,
    'application/json': JSON.parse
};

const STATUS_TO_REASON = {
    100: 'Continue', 101: 'Switching Protocols',
    200: 'OK', 201: 'Created', 202: 'Accepted', 203: 'Non-Authoritative Information', 204: 'No Content', 205: 'Reset Content', 206: 'Partial Content',
    300: 'Multiple Choices', 301: 'Moved Permanently', 302: 'Found', 303: 'See Other', 304: 'Not Modified', 305: 'Use Proxy', 307: 'Temporary Redirect',
    400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 405: 'Method Not Allowed', 406: 'Not Acceptable', 407: 'Proxy Authentication Required', 408: 'Request Timeout', 409: 'Conflict', 410: 'Gone', 411: 'Length Required', 412: 'Precondition Failed', 413: 'Request Entity Too Large', 414: 'Request URI Too Long', 416: 'Requested Range Not Satisfiable',
    500: 'Internal Server Error', 501: 'Not Implemented', 502: 'Bad Gateway', 503: 'Service Unavailable', 504: 'Gateway Timeout', 505: 'HTTP Version Not Supported'
};

class Server extends _http.Server {

    // options 是默认 response
    constructor(options) {
        super();

        this.defaultResponse = Object.assign({
            body: '', status: 404, reason: 'Not Found', headers: {}
        }, options);
    
        this.routes = {
            GET: [],
            POST: [],
            PUT: [],
            DELETE: []
        };

        this.on('request', (request, response) => {
            const {method, headers} = request;
            const url = decodeURI(request.url);
            let params = null, query = null, body = null, pos = 0;

            if ((pos = url.indexOf('?')) > 0) {
                query = _querystring.parse(url.slice(pos + 1));
            }

            request.on('data', data => {
                const parse = CONTENT_TYPE_TO_DECODE[headers['content-type']];

                try { body = parse ? parse(data.toString()) : data.toString(); } catch (e) {}
            });

            request.on('end', () => {
                const routes = this.routes[method];
                const ctx = {
                    req: {url, method, headers, query, body},
                    res: Object.assign({}, this.defaultResponse)
                };

                if (routes) for (let i = 0, l = routes.length; i < l; i++) {
                    const {route, handle} = routes[i];

                    if (params = url.match(route)) {
                        ctx.req.params = params;
                        ctx.res.status = 200;
                        ctx.res.reason = 'OK';
                        handle(ctx); break;
                    }
                }

                this.generateResponse(response, ctx.res);                
            });
        });
    }

    generateResponse(response, {status, reason, headers, body}) {
        // 如果 body 是 object，则当做 json 处理
        if (typeof body === 'object') {
            if (!headers['content-type']) {
                headers['content-type'] = 'application/json';
            }

            body = JSON.stringify(body);
        }

        response.writeHead(status, reason || STATUS_TO_REASON[status], headers);
        response.end(body);
    }

    checkArguments(route, handle) {
        const routeType = Object.prototype.toString.call(route);
        const handleType = Object.prototype.toString.call(handle);

        if (routeType !== '[object RegExp]' && routeType !== '[object String]') {
            throw new Error(`route should be a RegExp or a String but got a ${routeType}`);
        } else if (handleType !== '[object Function]') {
            throw new Error(`handle should be a function but got a ${handleType}`);
        } else return true;

        return false;
    }

    get(route, handle) {
        if (this.checkArguments(route, handle)) {
            this.routes.GET.push({route, handle});
        }
    }

    post(route, handle) {
        if (this.checkArguments(route, handle)) {
            this.routes.POST.push({route, handle});
        }
    }
}

module.exports = Server;
