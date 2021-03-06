// client side config
var socket = io.connect();
// to see if user is typing
var typing = false;
var timeout = undefined;
var userCount = 0;
var currentUser = '';
var array = [];

var prevNotification;
function timeoutFunction(){
  typing = false;
  socket.emit("typing", {isTyping: false, person: currentUser});
}

socket.on("isTyping", function(data) {
  if (data.isTyping) {
    if ($("#"+data.person+"").length === 0) {
      $("#updates").append("<li id='"+ data.person +"'><span class='text-muted'><small><i class='fa fa-keyboard-o'></i>" + data.person + " is typing...</small></li>");
      timeout = setTimeout(timeoutFunction, 5000);
    }
  } else {
    $("#"+data.person+"").remove();
  }
});


function addMessage(msg, name) {
    if(currentUser != name) {
      $("#chatEntries").append('<div class="message"><p>' + name + ': ' + msg + '</p></div> <div class="clear"></div>');
    } else {
      $("#chatEntries").append('<div class="messageSelf"><p>' + name + ': ' + msg + '</p></div> <div class="clear"></div>');
    }
    console.log("SCROLL");
    $('#chatEntries').animate({
        scrollTop: $("#chatEntries").offset().bottom
    }, 2000);

    // scroll automatically when new message arrives
    var $cont = $('#chatEntries');
    $cont[0].scrollTop = $cont[0].scrollHeight;

    $('#messageInput').keyup(function(e) {
        if (e.keyCode == 13) {
            // $cont.append('<p>' + $(this).val() + '</p>');
            $cont[0].scrollTop = $cont[0].scrollHeight;
            $(this).val('');
        }
    })
}

function sendMessage() {
    if ($('#messageInput').val() != "") 
    {
        socket.emit('message', $('#messageInput').val());
        // addMessage($('#messageInput').val(), "Me"); // replace Me with current user
        $('#messageInput').val(''); // clear
    }
}

function setName(isSignIn) {
    if ($("#nameInput").val() != "")
    {
		$.modal.close();
		socket.emit('setName', $("#nameInput").val());
		socket.emit('setUser', {username: $("#nameInput").val(), password: $("#passwordInput").val(), isSignIn: isSignIn});
		socket.on('nameStatus', function(data){
			if(data == "ok")
			{
				// user entered room -- make light colored
				socket.emit('enteredRoom', "User " + $("#nameInput").val() + " entered the room");

				// addMessage("User " + $("#nameInput").val() + " entered room", "Me"); 
			    currentUser = $("#nameInput").val();
		    	array.push(currentUser);
		   		//console.log(array);
		        $('#chatControls').show();
		        // $('#nameInput').hide();
		        // $('#signUp').hide();
		  // 		  $('#signIn').hide();
		        $("#welcomeParagraph").show();
		        $("#welcomeParagraph").html('<div class="Welcome"><p> Hello! ' + $("#nameInput").val() + '. Welcome to Emomix.</p></div>');   
		    // $("#userName").html('<div class="User in room"><p> ' + $("#nameInput").val() + '</p></div>');  
			}
			else if(data == "error")
			{
				alert("Name Already Taken");
				$('#nameForm').modal({escapeClose: false, clickClose: false, showClose: false});
			}
			else if(data == "wrongPassword")
			{
				alert("Wrong password");
				$("#nameForm").modal({escapeClose: false, clickClose: false, showClose: false});
			}
		})  

    // scroll automatically when new message arrives
    var $cont = $('#room');
    $cont[0].scrollTop = $cont[0].scrollHeight;

    $('#room').keyup(function(e) {
        if (e.keyCode == 13) {
            // $cont.append('<p>' + $(this).val() + '</p>');
            $cont[0].scrollTop = $cont[0].scrollHeight;
            $(this).val('');
        }
    })
  }
}

socket.on('emotion', function(data) {
  addEmotion(data['emotion'], data['name']);
});


// added custom method to String
String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

function addEmotion(msg, name) {
    if(currentUser != name) {
      if(msg.contains("Joy")) { // happy 
        $("#chatEntries").append('<div class="emotion"><a href="http://www.sherv.net/"><img alt="Bouncing" width=80 height=90 src="http://www.sherv.net/cm/emo/laughing/bouncing-smiley-emoticon.gif"></a></div><div class="clear"></div>');
      } else if(msg.contains("Sadness")) {
        $("#chatEntries").append('<div class="emotion"><a href="http://www.sherv.net/"><img alt="Sad face"width=80 height=90 src="http://www.sherv.net/cm/emo/sad/sad-face.gif"></a></div><div class="clear"></div>');
      } else if(msg.contains("Anger")) {
        $("#chatEntries").append('<div class="emotion"><a href="http://www.sherv.net/"><img alt="3D smiley full of anger" width=80 height=90 src="http://www.sherv.net/cm/emo/angry/3d-mad.gif"></a></div><div class="clear"></div>');
      } else if(msg.contains("Disgust")) {
        $("#chatEntries").append('<div class="emotion"><a href="http://www.freesmileys.org/smileys.php"><img width=80 height=90 src="http://www.freesmileys.org/smileys/smiley-sick006.gif"></a></div><div class="clear"></div>');
        // $("#chatEntries").append('<div class="messageSelf"><p>' + name + ' ' + msg + '</p></div> <div class="clear"></div>' + '<div class="emotionSelf"><a href="http://www.sherv.net/"><img alt="3D smiley full of anger" src="http://www.sherv.net/cm/emo/angry/3d-mad.gif"></a></div>');
      } else if(msg.contains("Fear")) {
        $("#chatEntries").append('<div class="emotion"><a href="http://www.sherv.net/"><img alt="Scary Smiley Screaming" width=80 height=90 src="http://www.sherv.net/cm/emoticons/shocked/scary-smiley-screaming-emoticon.gif"></a></div><div class="clear"></div>');
      }

    } else { // current user sent message
      if(msg.contains("Joy")) { // happy 
        $("#chatEntries").append('<div class="emotionSelf"><a href="http://www.sherv.net/"><img alt="Bouncing" width=80 height=90 src="http://www.sherv.net/cm/emo/laughing/bouncing-smiley-emoticon.gif"></a></div><div class="clear"></div>');
      } else if(msg.contains("Sadness")){
        $("#chatEntries").append('<div class="emotionSelf"><a href="http://www.sherv.net/"><img alt="Sad face" width=80 height=90 src="http://www.sherv.net/cm/emo/sad/sad-face.gif"></a></div><div class="clear"></div>');
      } else if(msg.contains("Anger")) {
        $("#chatEntries").append('<div class="emotionSelf"><a href="http://www.sherv.net/"><img alt="3D smiley full of anger" width=80 height=90 src="http://www.sherv.net/cm/emo/angry/3d-mad.gif"></a></div><div class="clear"></div>');
      } else if(msg.contains("Disgust")) {
        $("#chatEntries").append('<div class="emotionSelf"><a href="http://www.freesmileys.org/smileys.php"><img width=80 height=90 src="http://www.freesmileys.org/smileys/smiley-sick006.gif"></a></div><div class="clear"></div>');
        // $("#chatEntries").append('<div class="messageSelf"><p>' + name + ' ' + msg + '</p></div> <div class="clear"></div>' + '<div class="emotionSelf"><a href="http://www.sherv.net/"><img alt="3D smiley full of anger" src="http://www.sherv.net/cm/emo/angry/3d-mad.gif"></a></div>');
      } else if(msg.contains("Fear")) {
        $("#chatEntries").append('<div class="emotionSelf"><a href="http://www.sherv.net/"><img alt="Scary Smiley Screaming" width=80 height=90 src="http://www.sherv.net/cm/emoticons/shocked/scary-smiley-screaming-emoticon.gif"></a></div><div class="clear"></div>');
      }
    }

    $('#chatEntries').animate({
        scrollTop: $("#chatEntries").offset().bottom
    }, 2000);

    // scroll automatically when new message arrives
    var $cont = $('#chatEntries');
    $cont[0].scrollTop = $cont[0].scrollHeight;

    $('#messageInput').keyup(function(e) {
        if (e.keyCode == 13) {
            // $cont.append('<p>' + $(this).val() + '</p>');
            $cont[0].scrollTop = $cont[0].scrollHeight;
            $(this).val('');
        }
    })
}

socket.on('message', function(data) {
    addMessage(data['message'], data['name']);
    console.log(data);
    notifyMe(data['name'],data['message']);
});

socket.on('nbUsers', function(msg) {
    console.log(msg.nb);
    $("#nbUsers").html(msg.nb);
});

socket.on('usersInRoom', function(msg){
    $("#room").empty(); // clear, users might disconnect, and its appending
    $("#room").append("Users in room: <br/>")
    for(i = 0; i < msg.un.length; i++){
      $("#room").append("- " + msg.un[i] + "<br/>");
    }
    // $("#updates").append("------------");
});


// push notifications 
function notifyMe(user,message) {
  if(currentUser != user) { // do not notify user sending the message ofc
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }
    // Let's check if the user is okay to get some notification
    else if (Notification.permission === "granted") {
      // If okay let's create a notification
      var options = {
          body: message,
          dir : "ltr"
      };
      var notification = new Notification(user + " Sent a message",options);
      
    }
    // Otherwise, we need to ask the user for permission
    // Note, Chrome does not implement the permission static property
    // So we have to check for NOT 'denied' instead of 'default'
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission(function (permission) {
        // Whatever the user answers, we make sure we store the information
        if (!('permission' in Notification)) {
          Notification.permission = permission;
        }
        // If the user is okay, let's create a notification
        if (permission === "granted") {
          var options = {
                  body: message,
                  dir : "ltr"
          };
          var notification = new Notification(user + " Sent a message",options);
        }
      });
    }
    // Do nothing if user denies notification
  }
}

// init

$(function() {
    // $('html, body').css({
    //   'overflow': 'hidden',
    //   'height': '100%'
    // });
    $("#chatControls").hide();
    $("#messageInput").keypress(function(e) {
		// alert("typing");
	 	 if (e.which !== 13) {
		    if (typing === false && $("#messageInput").is(":focus")) {
		      typing = true;
		      socket.emit("typing", {isTyping: true, person: currentUser});

		    } else {
		      clearTimeout(timeout);
		      timeout = setTimeout(timeoutFunction, 5000);
		    }
		} else {
			sendMessage();
		}
	});
	
    $('#nameForm').modal({escapeClose: false, clickClose: false, showClose: false});
    $("#signUp").click(function() {setName(0)});
    $("#signIn").click(function() {setName(1)});
    $("#").click(function() {setName()});
    $("#submit").click(function() {sendMessage();});
    $("#welcomeParagraph").hide();
});