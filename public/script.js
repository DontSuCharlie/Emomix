// client side config
var socket = io.connect();
// to see if user is typing
var typing = false;
var timeout = undefined;
var userCount = 0;
var currentUser = '';
var array = [];

function timeoutFunction(){
  typing = false;
  socket.emit("typing", {isTyping: false, person: currentUser});
}

socket.on("isTyping", function(data) {  
  console.log("typing");
  console.log(data);
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
      $("#chatEntries").append('<div class="message"><p>' + name + ' : ' + msg + '</p></div> <div class="clear"></div>');
    } else {
      $("#chatEntries").append('<div class="messageSelf"><p>' + name + ' : ' + msg + '</p></div> <div class="clear"></div>');
    }
    console.log("SCROLL");
    $('#chatEntries').animate({
        scrollTop: $("#chatEntries").offset().bottom
    }, 2000);

    // add here
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

function setName() {
    if ($("#nameInput").val() != "")
    {
    	$.modal.close();
    	socket.emit('setName', $("#nameInput").val());
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
		        $('#nameInput').hide();
		        $('#nameSet').hide();
		        $("#welcomeParagraph").show();
		        $("#welcomeParagraph").html('<div class="Welcome"><p> Hello! ' + $("#nameInput").val() + '. Welcome to Emomix.</p></div>');   
            // $("#userName").html('<div class="User in room"><p> ' + $("#nameInput").val() + '</p></div>');  
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

socket.on('userName', function(msg){

    // $("#userName").html(msg.un); 
    // console.log(array);
    // console.log("length is: " + array.length);
    // // array.push(msg.un);
    // for(i = 0; i < array.length-1; i++){
    //   console.log("i is: " + i);
    //   $("#userName").append(array[i]+ "<br/>");
    // }
    // $("#userName").append("<li>" + msg.un + "</li>");
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
    $('#nameForm').modal();
    $("#nameSet").click(function() {setName()});
    $("#submit").click(function() {sendMessage();});
    $("#welcomeParagraph").hide();
});