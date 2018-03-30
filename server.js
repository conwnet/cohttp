const _http = require('http');
const _querystring = require('querystring');

const CONTENT_TYPE_TO_DECODE = {
    'application/x-www-form-urlencoded': _querystring.parse,
    'application/json': JSON.parse
};

class Server extends _http.Server {

    constructor(...options) {
        super(...options);
    
        this.routes = {
            GET: [],
            POST: [],
            PUT: [],
            DELETE: []
        };

        this.on('request', (request, response) => {
            const {url, method, headers} = request;
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

                if (routes) for (let i = 0, l = routes.length; i < l; i++) {
                    const {route, handle} = routes[i];

                    if (params = url.match(route)) {
                        return response.end(handle({
                            url, method, headers, params, query, body
                        }, response).toString());
                    }
                }

                response.writeHead(404, 'Not Found');
                response.end();
            });
        });
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
