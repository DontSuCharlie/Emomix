var serverPort = 43543;

// Import

var express = require('express'), app = express();
var http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
var jade = require('jade');

// Using Jade

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set("view options", { layout: false });

app.use(express.static(__dirname + '/public'));

// Render and send the main page

app.get('/', function(req, res){
  res.render('home.jade');
});
server.listen(serverPort);
console.log("Server listening on port " + serverPort);

io.sockets.on('connection', function (socket) {
    // new connection
	socket.on('setName', function (data) {
		socket.set('name', data);
	});

	socket.on('message', function (data) { // Broadcast the message
		if(pseudoSet(socket))
		{
			var transmit = {date : new Date().toISOString(), pseudo : socket.nickname, message : data};
			socket.broadcast.emit('message', transmit);
			console.log("user "+ transmit['pseudo'] +" said \""+data+"\"");
		}
	});
});


