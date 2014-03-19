var express = require('express'),
	path = require('path'),
	http = require('http'), 
    repository= require('./routes/repository');
 
var app = express();
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
app.use(function (req, res, next) {
  if (!req.session.authStatus || 'loggedOut' === req.session.authStatus) {
    req.session.authStatus = 'loggingIn';

    // cause Express to issue 401 status so browser asks for authentication
    req.user = false;
    req.remoteUser = false;
    if (req.headers && req.headers.authorization) { delete req.headers.authorization; }
  }
  next();
});

app.configure(function () {
	app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080);
	app.set('host', process.env.OPENSHIFT_NODEJS_IP || process.env.IP || '127.0.0.1');//'192.168.1.10');



	app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
	app.use(express.bodyParser()),
	app.use(express.static(path.join(__dirname, 'public')));

});


var basicAuth = express.basicAuth,
auth = function(req, res, next) {

            basicAuth(function(username, password, callback) {
		repository.apilogin(username, password, function(result) { 
			callback(null /* error */, result);
		});
            })(req, res, function(){ req.session.authStatus = 'loggedIn'; next();});
};


app.param('collectionName', function (req, res, next, collectionName) { req.collection = repository.db.collection(collectionName); return next() });
app.post('/login', repository.login);
app.get('/collections/', auth, function(req, res) {  res.send('please select a collection, e.g., /collections/messages')})
app.get('/collections/:collectionName', auth, repository.getEntries);
app.post('/collections/:collectionName', auth, repository.addEntry);
app.put('/collections/:collectionName/:id', auth, repository.updateEntry);


app.get('/logout', auth, function (req, res) {
  console.log('API Logout:[' + req.user.username + ']');
  delete req.session.authStatus;
  res.send("Done!");
});   


var server= http.createServer(app)
console.log("Trying to start server at", app.get('host')+ ":" + app.get('port'));
server.listen(app.get('port'),app.get('host'), function () {
var addr = server.address();
    console.log("Server listening at", addr.address + ":" + addr.port);
});

var io = require('socket.io');
io = io.listen(server);

io.configure(function () {
    io.set("transports", ["websocket"]);		
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
