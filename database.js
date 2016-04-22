/*
#Database Code

emomix.firebaseIO.com is the URL of our Firebase database

##Structure of Database
In our database we have:
1) a list of users
2) a list of chat rooms

The list of users is for checking if the person signing in already exists. 

	User{
		name
		password
		rooms[]
	}

The chat rooms will hold an object called room_info

	Room_Info{
		room name
		room emotion
	}

The chat rooms will also hold the chat messages

	Message{
		sender name
		sender message
		sender emotion
		sender date
	}

##Operations
1. Create account
	a) Check if username is already taken, if so, return error
	b) If username is not taken, .push() the new user into list
2. Sign into account
	a) Check if username exists, if not, return error
	b) Check if password matches, if not, return error
	c) Else, load the chat rooms into the UI
	d) Set firebase URL directory to current user
3. Create new room
	a) Go to the current user's room[] and push() the new room
4. Add users to room
	a) Search for user(s), load their rooms[] and push() the room
	b) Should result in an immediate change for the other users too
5. Select room
	a) Removes the current room selected
	b) Get the ID of the new room selected
	c) Search for the ID of the new room
	d) Load the new room's info + all messages
6. Exit room (as in leave the group chat)
	a) If last person, delete the room
	b) Go to the person's room[] and pop() the room ID
7. Search users
	a) Returns the list of users
8. Send message (to current room)
	a) pushes to current room


*/

module.exports = {
	test: test,
	signup: signup,
	/*
	signin: signin,
	createChatRoom: createChatRoom,
	addUsersToChatRoom: addUsersToChatRoom,
	enterChatRoom: enterChatRoom,
	removeChatRoom: removeChatRoom,
	searchUsers: searchUsers,
	sendMessage: sendMessage*/
};

var Firebase = require("firebase");
//Pointer to Firebase (needs to update if we move to a different object)
var firebase_url = "https://emomix.firebaseIO.com";
var username = "none";
var firebase_ref = new Firebase(firebase_url);
var myRooms;

function test()
{

	//var test1 = "Charlie";
	//var test2 = "password";
	//var test3 = [];
	//console.log("database module is connected!");
	//var newUser = new Object;
	//newUser[test1] = {password: test2, rooms: test3};
	//var id = firebase_ref.child("userlist").set(newUser);
	var searchName = new Firebase("https://emomix.firebaseio.com/userlist/Charlie").once('value', queryForUser);
	if(searchName == null)
		console.log("2: user not found");
	else
		console.log("2: user found");
}

function queryForUser(snapshot)
{
	console.log("1: snapshot.val = " + snapshot.val());
	return snapshot.val();
}

/*
1. Create account
	a) Check if username is already taken, if so, return error
	b) If username is not taken, .push() the new user into list
Pet Peeve #1 with Javascript: The only way to prevent asynchrony is with callbacks. Let's say I have a function that does two actions where the second
action is dependent on the first. The only way to guarantee it is to turn both actions into functions and then chain them together. Talk about unnecessary overuse of the stack!
*/
function signup(username, password)
{
	var userlist_ref = new Firebase("https://emomix.firebaseio.com/userlist");
	return userlist_ref.once('value', function(snapshot)
	{
		//first check if the username exists
		if(!snapshot.child(username).exists())
		{
			console.log("Creating new user " + username);
			//create new object
			var newUser = new Object();
			newUser[username] = {password: password, rooms: []};
			userlist_ref.set(newUser);
			return true;
		}
		//if it doesn't, add the new user!
		else//return error
		{
			console.log("Username already exists");
			return false;
		}
	});
}

/*
2. Sign into account
	a) Check if username exists, if not, return error
	b) Check if password matches, if not, return error
	c) Else, load the chat rooms into the UI
	d) Set firebase URL directory to current user
*/
function signin(username, password)
{
	//first check if the username exists
	var search = new Firebase(firebase_url + "/emomix/" + username).once('value', queryForUser);
	//password matching doesn't matter atm
	if(username == search.name)
	{
		var numRooms = search.rooms.length();
		for (var i = 0; i < numRooms; i++) {
			myRooms.push(search.rooms[i]);
		}
	}
}
/*
3. Create new room
	a) Go to the current user's room[] and push() the new room
	b) 
*/
function createChatRoom(name_of_room)
{
	//get user's room
	var search = new Firebase(firebase_url + "/emomix/" + username).once('value', queryForUser);
	var chatRooms = new Firebase(firebase_url + "/emomix/" + username + "/" + chatRooms.room);
	chatRooms.push(name_of_room);
	//insert room itself into user's room array
}

/*
4. Add users to room
	a) Search for user(s), load their rooms[] and push() the room
	b) Should result in an immediate change for the other users too
*/

function addUsersToChatRoom(users)
{
	var numUsers = users.length();

	for(var i = 0; i < numUsers; i++)
	{

	}
}

/*
5. Select room
	a) Removes the current room selected
	b) Get the ID of the new room selected
	c) Search for the ID of the new room
	d) Load the new room's info + all messages
*/
function enterChatRoom(name_of_room)
{
	//remove previous callback
	firebase_ref.off("child_added", onCallback);
	//update pointer to the room
	firebase_ref = new Firebase(firebase_url + "/" + name_of_room);
	//reattach callback
	firebase_ref.on("child_added", onCallback);
}


function onCallback(snapshot)
{
	var name = snapshot.name;
	var text = snapshot.text;
	var emotion = snapshot.emotion;
}

function displayChat(name, text, emotion)
{
	console.log("Name = " + name);
	console.log("Text = " + text);
	console.log("Emotion = " + emotion);
}