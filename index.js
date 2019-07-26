let port = 8888;
let wrap = require('./util/async_wrap');

let app = require('./web/web_config')(wrap, __dirname);
let http = require('http').createServer(app);
let db = require('./db/config')();

let io = require('./socket/socket_config')(http, wrap);

http.listen(port, function(){
    console.log("server start port number ->", port);
})