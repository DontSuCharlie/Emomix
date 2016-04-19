// client side config
var socket = io.connect();
// to see if user is typing
var typing = false;
var timeout = undefined;
var userCount = 0;

function timeoutFunction(){
  typing = false;
  socket.emit("typing", false);
}

socket.on("isTyping", function(data) {  
  if (data.isTyping) {
    if ($("#"+data.person+"").length === 0) {
      $("#updates").append("<li id='"+ data.person +"'><span class='text-muted'><small><i class='fa fa-keyboard-o'></i>" + data.person + " is typing.</small></li>");
      timeout = setTimeout(timeoutFunction, 5000);
    }
  } else {
    $("#"+data.person+"").remove();
  }
});

function addMessage(msg, name) {
    $("#chatEntries").append('<div class="message"><p>' + name + ' : ' + msg + '</p></div>');
}

function sendMessage() {
    if ($('#messageInput').val() != "") 
    {
        socket.emit('message', $('#messageInput').val());
        // addMessage($('#messageInput').val(), "Me"); // replace Me with current user
        $('#messageInput').val(''); // clear
    }
}
function setName() {
    if ($("#nameInput").val() != "")
    {
    	$.modal.close();
    	socket.emit('setName', $("#nameInput").val());
        socket.on('nameStatus', function(data){
			if(data == "ok")
			{
				// user entered room -- make light colored
				socket.emit('message', "User " + $("#nameInput").val() + " entered the room");
				// addMessage("User " + $("#nameInput").val() + " entered room", "Me"); 
		        
		        $('#chatControls').show();
		        $('#nameInput').hide();
		        $('#nameSet').hide();
		        $("#welcomeParagraph").show();
		        $("#welcomeParagraph").append('<div class="Welcome"><p> Hello! ' + $("#nameInput").val() + '. Welcome to Emomix.</p></div>');     
            // $("#userInRoom").show();
            // div#userInRoom
            // for(i = 0; i < nameArray.length; i++){
            //   ul
            //     li=nameArray[i]
            // }
			}
			else
			{
				alert("Name Already Taken");
				$('#nameForm').modal();
			}
		})  

  }
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


// push notifications 
function notifyMe(user,message) {
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

// init

$(function() {
    $("#chatControls").hide();
    $("#messageInput").keypress(function(e) {
		// alert("typing");
	 	 if (e.which !== 13) {
		    if (typing === false && $("#messageInput").is(":focus")) {
		      typing = true;
		      socket.emit("typing", true);
		    } else {
		      clearTimeout(timeout);
		      timeout = setTimeout(timeoutFunction, 5000);
		    }
		} else {
			sendMessage();
		}
	});
    $('#nameForm').modal();
    $("#nameSet").click(function() {setName()});
    $("#submit").click(function() {sendMessage();});
    $("#welcomeParagraph").hide();
});