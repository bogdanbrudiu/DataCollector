var express = require('express'),
	path = require('path'),
	http = require('http'), 
    repository= require('./routes/repository');
 
var app = express();


app.configure(function () {
	app.set('port', process.env.PORT || 8080);
	app.set('host', process.env.IP || '192.168.1.10');
	app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
	app.use(express.bodyParser()),
	app.use(express.static(path.join(__dirname, 'public')));

});


app.param('collectionName', function (req, res, next, collectionName) { req.collection = db.collection(collectionName); return next() });
app.post('/login', repository.login);
//app.get('/', function(req, res) {  res.send('please select a collection, e.g., /collections/messages')})
app.get('/collections/:collectionName', repository.getEntries);
app.post('/collections/:collectionName', repository.addEntry);
app.put('/collections/:collectionName/:id',repository.updateEntry);
app.delete('/collections/:collectionName/:id',repository.deleteEntry);

var server= http.createServer(app)
server.listen(app.get('port'),app.get('host'), function () {
var addr = server.address();
    console.log("Server listening at", addr.address + ":" + addr.port);
});

var io = require('socket.io');
io = io.listen(server);

io.configure(function () {
    io.set('authorization', function (handshakeData, callback) {
        if (handshakeData.xdomain) {
            callback('Cross-domain connections are not allowed');
        } else {
            callback(null, true);
        }
    });
});
io.sockets.on('connection', function (socket) {

    socket.on('message', function (message) {
        console.log("Got message: " + message);
        var ip = socket.handshake.address.address;
        var url = message;
        io.sockets.emit('pageview', { 'connections': Object.keys(io.connected).length, 'ip': '***.***.***.' + ip.substring(ip.lastIndexOf('.') + 1), 'url': url, 'xdomain': socket.handshake.xdomain, 'timestamp': new Date()});
    });

    socket.on('disconnect', function () {
        console.log("Socket disconnected");
        io.sockets.emit('pageview', { 'connections': Object.keys(io.connected).length});
    });

});