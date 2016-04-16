// var serverPort = 43543;

// Import

var cfenv = require('cfenv'); // for bluemix
// run locally or on cloud
var serverPort = (process.env.VCAP_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || '0.0.0.0');

var express = require('express'), app = express();
var http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
var jade = require('jade');
var nameArray = ['Tarang'];
var users = 0; //number of connected users

// Using Jade

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

server.listen(serverPort, host, function() {
	// print a message when the server starts listening
  console.log("server starting on " + host + ":" + serverPort);
});


app.set('views', __dirname + '/public');
app.set('view engine', 'jade');
app.set("view options", { layout: false });

app.use(express.static(__dirname + '/public'));

// Render and send the main page

app.get('/', function(req, res){
  res.render('home.jade');
});

app.get('/settings', function(req, res){
  res.render('settings.jade');
});

io.sockets.on('connection', function (socket) {
    // new connection
	socket.on('message', function (data) { // Broadcast the message
		if(nameSet(socket))
		{
			var transmit = {date : new Date().toISOString(), pseudo : socket.nickname, message : data};
			socket.broadcast.emit('message', transmit);
			console.log("user "+ transmit['pseudo'] +" said \""+data+"\"");
		}
	});
	users += 1; 
	socket.on('setName', function (data) { // Assign a name to the user
		if (nameArray.indexOf(data) == -1) // Test if the name is already taken
		{
			nameArray.push(data);
			socket.nickname = data;
			socket.emit('nameStatus', 'ok');
			console.log("user " + data + " connected");
		}
		else
		{
			socket.emit('nameStatus', 'error') // Send the error
		}
	});
});