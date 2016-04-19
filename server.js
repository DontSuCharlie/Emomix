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
var nameArray = [];	// contain all name of user in the room
var users = 0; //number of connected users
// var allUser = function(uName){
// 	this.name = uName;
// };


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
    users += 1; // increment number of users 
    reloadUsers(); 
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
	
	socket.on('setName', function (data) { // Assign a name to the user
		reloadUsers();
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

function reloadUsers() { // Send the count of the users to all
	io.sockets.emit('nbUsers', {"nb": users});
}
