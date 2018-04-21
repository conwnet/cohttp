# cohttp

## 安装

~~~
npm -g i cohttp
~~~

完全使用 node.js 原生接口实现，不需要安装额外依赖。

## 静态服务器

此模块也可以作为静态文件的 http server 使用：

~~~
Usage: cohttp [-p port] [path]
~~~

可以通过 -p / --port 参数指定监听端口，默认为 5261
path 设置 webroot 目录，默认为当前所在目录

## Node HTTP Request 库

提供一个 HTTP Request 库，支持 HTTP/HTTPS

## Example

~~~javascript
const URL = 'https://www.baidu.com';

request.get(URL).then(res => {
    console.log(res.data);
});
~~~

## Node HTTP Server 库

提供一个 HTTP Server 库

### Example

~~~javascript
const server = new Server();

server.get(/^\/hello/, ({req, res}) => {
    res.body = 'Hello World';
})

server.listen(3000);
~~~
