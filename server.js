const _http = require('http');
const _querystring = require('querystring');

// Http Request Body 解码方式
const CONTENT_TYPE_TO_DECODE = {
    'application/x-www-form-urlencoded': _querystring.parse,
    'application/json': JSON.parse
};

// 获取 Url 中的 Query
const getQuery = url => {
    if ((pos = url.indexOf('?')) > 0) {
        return _querystring.parse(url.slice(pos + 1));
    }

    return {};
}

// 设置 HTTP Response
const setResponse = (response, {status, headers, body}) => {
    // 如果 body 是 object，则当做 json 处理
    if (!((body instanceof Buffer) || (typeof body === 'string'))) {
        if (!headers['content-type']) {
            headers['content-type'] = 'application/json';
        }
        body = JSON.stringify(body);
    }

    response.writeHead(status, headers);
    response.end(body);
};

// 检查路由是否合法
const checkRoute = (route, handle) => {
    const routeType = Object.prototype.toString.call(route);
    const handleType = Object.prototype.toString.call(handle);

    if (routeType !== '[object RegExp]' && routeType !== '[object String]') {
        throw new Error(`route should be a RegExp or a String but got a ${routeType}`);
    } else if (handleType !== '[object Function]') {
        throw new Error(`handle should be a function but got a ${handleType}`);
    } else return true;

    return false;
};

class Server extends _http.Server {

    // options 是默认 response
    constructor(options = {}) {
        super();

        this.defaultResponse = Object.assign({
            body: '', status: 404, headers: {}
        }, options.response);
    
        this.routes = {
            GET: [], POST: [],
            PUT: [], DELETE: []
        };

        if (options.cors !== false) {            
            this.allCors();
        }

        this.on('request', async (request, response) => {
            const res = await this.handleRequest(request);

            setResponse(response, res);
        });
    }

    allCors() {
        const headers = this.defaultResponse;

        if (!headers['Access-Control-Allow-Origin']) {
            headers['Access-Control-Allow-Origin'] = '*';
        }

        if (!headers['Access-Control-Allow-Headers']) {
            headers['Access-Control-Allow-Headers'] = 'Content-type';
        }

        this.routes.OPTIONS = [{route: /.*/}];
    }

    // 根据 request 获取初始化的 context
    async getInitialContext(request) {
        const {method, headers} = request;
        const url = decodeURI(request.url);
        const query = getQuery(url);

        return {
            req: {url, method, headers, query},
            res: Object.assign({}, this.defaultResponse)
        };
    };

    // 根据 Request 和 this.routes 获取最终要返回的 res
    async handleRequest(request) {
        const {method, url, headers} = request;
        const ctx = await this.getInitialContext(request);
        const routes = this.routes[method];

        request.on('data', data => {
            const parse = CONTENT_TYPE_TO_DECODE[headers['content-type']];

            try {
                ctx.req.body = parse(data.toString());
            } catch (e) {
                ctx.req.body = data.toString();
            }
        });

        return new Promise(resolve => {
            request.on('end', () => {
                if (routes) for (let i = 0, l = routes.length; i < l; i++) {
                    const {route, handle} = routes[i];
                    const matches = url.match(route);

                    if (matches) {
                        ctx.req.matches = matches;
                        ctx.res.status = 200;
                        handle && handle(ctx);
                        break;
                    }
                }

                resolve(ctx.res);
            });
        });
    }

    get(route, handle) {
        if (checkRoute(route, handle)) {
            this.routes.GET.push({route, handle});
        }
    }

    post(route, handle) {
        if (checkRoute(route, handle)) {
            this.routes.POST.push({route, handle});
        }
    }

    put(route, handle) {
        if (checkRoute(route, handle)) {
            this.routes.put.push({route, handle});
        }
    }

    delete(route, handle) {
        if (checkRoute(route, handle)) {
            this.routes.delete.push({route, handle});
        }
    }
}

module.exports = Server;
