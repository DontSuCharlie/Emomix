// var serverPort = 43543;
// server side
// Import

//bluemix initialization
var cfenv = require('cfenv');
var serverPort = (process.env.VCAP_APP_PORT || 3000);//process.env finds the port for bluemix. we || it so that if we're not on bluemix, we can run locally on laptop
var host = (process.env.VCAP_APP_HOST || '0.0.0.0');//same with host

//express init
var express = require('express'), app = express();

var http = require('http')//for node js to connect to internets
  , server = http.createServer(app)//creates actual server
  , io = require('socket.io').listen(server)//uses socket.io library
  , watson = require('watson-developer-cloud');//support for Watson
var jade = require('jade');//support for jade
var nameArray = [];	// contain all name of user in the room
var users = 0; //number of connected users

server.listen(serverPort, host, function() {
	// print a message when the server starts listening
  console.log("server starting on " + host + ":" + serverPort);
});//creating actual server

/*Database shit is here. Please read comments fully
Uncomment to play around with*/
///////////////////////////////////////////////////////////////////////////////

//to include the database.js code into server.js
//every function/variable from database.js will be accessed as db.func() or db.var
var db = require('./database.js');

function getMsg(name, text, emotion)
{
	var message = {name: name, message: text};
	var emoticon = {name: name, emotion: emotion["emotion"]};
	console.log("name = " + name + "\t\ntext = " + text + "\t\nemotion = " + emotion);
	io.sockets.emit('message', message);
	io.sockets.emit('emotion', emoticon);
}

function getRooms(str, rooms)
{
	if(str == "success")
	{
		//load rooms
		for(var i = 0; i < rooms.length; i++)
		{
			console.log("found room:");
			console.log(rooms[i]);
		}
		for(var room_ID in rooms[0])
		{
			db.enterChatroom(room_ID, getMsg);
		}
	}
	else
	{
		console.log(str);
	}
}

//sign up = adds user to userbase if user already not in database
//arguments are (username, password)
//db.signup("Charlie", "ilikepie");
//db.signup("Tarang", "ilikepie2");
//db.signup("Jun Ming", "noilikepie");
//signin = checks if username and password match. if so, returns an array of rooms the user is in
//arguments are (username, password)
//db.signup("Charlie", "ilikepie");
//db.signin("Charlie", "ilikepie", getRooms);

//createChatroom = adds a new room to the roomList. Also adds the ID of the room to the user's roomlist
//arguments are (username, name_of_room)
//db.createChatroom("Charlie", "CS252");
//var addTheseUsers = ["Tarang", "Jun Ming", "Charlie"];

//db.enterChatroom({room_ID: "-KFwxfEIgyC_z6omvB0P", name_of_room: "CS Majors Only"}, getMsg);
//db.addUsersToChatroom(addTheseUsers, {room_ID: "-KFwxfEIgyC_z6omvB0P", name_of_room: "CS Majors Only"});
//db.sendMessage("Jun Ming", "no", {room_ID: "-KFwxfEIgyC_z6omvB0P", name_of_room: "CS Majors Only"});
//db.test();//test function
//////////////////////////////////////////////////////////////////////////////////

app.set('views', __dirname + '/public');//view = front end
app.set('view engine', 'jade');
app.set("view options", { layout: false });

app.use(express.static(__dirname + '/public'));//Express helps serve files

// Render and send the main page
//does magical mapping
app.get('/', function(req, res){
  res.render('home.jade');
});

var tone_analyzer = watson.tone_analyzer({
  username: '170164d6-1f7b-4e0b-8d7c-aaf844ea0d5a',
  password: 'oX1pVjLDnWZj',
  version: 'v3-beta',
  version_date: '2016-02-11'
});

app.get('/settings', function(req, res){
  res.render('settings.jade');
});


//actual socket shit happens here
io.sockets.on('connection', function (socket) {
    // new connection
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
				var transmitEmotion = {name: socket.nickname, emotion :"is feeling " + emotionTone[largest]["tone_name"]};
				var emotionMsg = {emotion: "is feeling " + emotionTone[largest]["tone_name"]};
				io.sockets.emit('emotion', transmitEmotion);
				db.sendMessage(socket.nickname, data, emotionMsg);
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
		// console.log(data);
   		io.sockets.emit("isTyping", {isTyping: data.isTyping, person: data.person});
	});

	socket.on('setName', function (data) { // Assign a name to the user
		
	});	

	socket.on('setUser', function (data) {
		// DB
		console.log("in socket.on: " + socket.nickname);
		if(data['isSignIn']) {
			// sign in
			db.signin(data['username'], data['password'], function(str, room)
				{
					if(str == "success") {
						getRooms(str, room);
						if (nameArray.indexOf(data['username']) == -1) // Test if the name is already taken
						{
							name = data['username'];
							nameArray.push(data['username']);
							socket.nickname = data['username'];
							socket.emit('nameStatus', 'ok');
							users += 1; // only increment when name is not taken
							reloadUsers();
							reloadUsersName();
						}
						else
						{
							socket.emit('nameStatus', 'error') // Send the error
						}
						reloadUsersName();
					}
					else
						socket.emit("nameStatus", "wrongPassword");
				});
		} 
		else {
			// sign up
			db.signup(data['username'], data['password'], function(username, password, bool)
				{
					if(bool){
						db.signin(data['username'], data['password'], getRooms);
						if (nameArray.indexOf(data['username']) == -1) // Test if the name is already taken
						{
							name = data['username'];
							nameArray.push(data['username']);
							socket.nickname = data['username'];
							socket.emit('nameStatus', 'ok');
							users += 1; // only increment when name is not taken
							reloadUsers();
							reloadUsersName();
						}
						else
						{
							socket.emit('nameStatus', 'error') // Send the error
						}
						reloadUsersName();
					}
					else
						socket.emit('nameStatus', 'error');
				});
		}
	});

	socket.on('disconnect', function () { // Disconnection of the client
		// sent by socket io automatically 
		console.log("Disconnection");
		name = socket.nickname;
		var index = nameArray.indexOf(name);

		if(index != -1) { // make sure the name exists
			nameArray.splice(index, 1);
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
	io.sockets.emit('usersInRoom', {"un": nameArray});
}