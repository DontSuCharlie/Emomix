// var serverPort = 43543;
// server side
// Import

var cfenv = require('cfenv'); // for bluemix
// run locally or on cloud
var serverPort = (process.env.VCAP_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || '0.0.0.0');
var express = require('express'), app = express();
var http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , watson = require('watson-developer-cloud');
var jade = require('jade');
var db = require('./database.js');
var nameArray = [];	// contain all name of user in the room
var users = 0; //number of connected users
var name;

// Using Jade

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

server.listen(serverPort, host, function() {
	// print a message when the server starts listening
  console.log("server starting on " + host + ":" + serverPort);
});

db.test();

app.set('views', __dirname + '/public');
app.set('view engine', 'jade');
app.set("view options", { layout: false });

app.use(express.static(__dirname + '/public'));

// Render and send the main page

app.get('/', function(req, res){
  res.render('home.jade');
});
var watson = require('watson-developer-cloud');

var tone_analyzer = watson.tone_analyzer({
  username: '170164d6-1f7b-4e0b-8d7c-aaf844ea0d5a',
  password: 'oX1pVjLDnWZj',
  version: 'v3-beta',
  version_date: '2016-02-11'
});

// tone_analyzer.tone({ text: 'This project is going to be epic!' },
//   function(err, tone) {
//     if (err)
//       console.log(err);
//     else
//       console.log(JSON.stringify(tone, null, 2));
// });

app.get('/settings', function(req, res){
  res.render('settings.jade');
});

io.sockets.on('connection', function (socket) {
    // new connection
    // reloadUsers();
	socket.on('message', function (data) { // Broadcast the message
		var transmit = {name : socket.nickname, message : data};
		io.sockets.emit('message', transmit);
		tone_analyzer.tone({ text: data },
		  function(err, tone) {
		    if (err)
		    	console.log(err);
		    else {
				// console.log(JSON.stringify(tone, null, 2));
				var emotionTone = tone.document_tone.tone_categories[0].tones,
				writingTone = tone.document_tone.tone_categories[1].tones,
				socialTone = tone.document_tone.tone_categories[2].tones;
				// console.log(JSON.stringify(emotionTone, null, 2));
				// find largest emotion
				largest = 0;
				for ( var i = 0, l = emotionTone.length; i < l; i++ ) {
					// console.log("is " + emotionTone[i]["score"] + " larger" + emotionTone[largest]["score"]);
					if(emotionTone[i]["score"] > emotionTone[largest]["score"]) {
						largest = i;
					}
				    // console.log(emotionTone[i]["score"]);
				    // console.log(emotionTone[i]["tone_name"]);
				}
				console.log(emotionTone[largest]["score"]);
				console.log(emotionTone[largest]["tone_name"]);
				// need better way to show emotion along with message--both same time
				var transmit2 = {name : socket.nickname, message : "Emotion is " + emotionTone[largest]["tone_name"]};
				io.sockets.emit('message', transmit2);
		    }
		});

		console.log("user "+ transmit['name'] +" said \""+data+"\"");
	});


	socket.on('enteredRoom', function(data) {
		var transmit = {name : socket.nickname, message : data};
		socket.broadcast.emit('message', transmit);
		console.log("user entered room");
	});

	socket.on("typing", function(data) {  
		console.log(data);
   		io.sockets.emit("isTyping", {isTyping: data.isTyping, person: data.person});
	});

	socket.on('setName', function (data) { // Assign a name to the user
		if (nameArray.indexOf(data) == -1) // Test if the name is already taken
		{
			name = data;
			nameArray.push(data);
			socket.nickname = data;
			socket.emit('nameStatus', 'ok');
			users += 1; // only increment when name is not taken
			reloadUsers();
			reloadUsersName();
			console.log("user " + data + " connected");

		}
		else
		{
			socket.emit('nameStatus', 'error') // Send the error
		}
		reloadUsersName();
	});	
	socket.on('disconnect', function () { // Disconnection of the client
		// sent by socket io automatically 
		name = socket.nickname;
		var index = nameArray.indexOf(name);
		if(index != -1) { // make sure the name exists
			name.slice(index - 1, 1);
			users -= 1;
			reloadUsers();
			reloadUsersName();
		}
	});
});

function reloadUsers() { // Send the count of the users to all
	io.sockets.emit('nbUsers', {"nb": users});
}

function reloadUsersName() {
	io.sockets.emit('userName', {"un": name});
}
