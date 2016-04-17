// client side config
var socket = io.connect();
// to see if user is typing
var typing = false;
var timeout = undefined;

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
        addMessage($('#messageInput').val(), "Me"); // replace Me with current user
        $('#messageInput').val(''); // clear
    }
}
function setName() {
    if ($("#nameInput").val() != "")
    {
    	socket.emit('setName', $("#nameInput").val());
        socket.on('nameStatus', function(data){
			if(data == "ok")
			{
		        $('#chatControls').show();
		        $('#nameInput').hide();
		        $('#nameSet').hide();
		        $("#welcomeParagraph").show();
		        $("#welcomeParagraph").append('<div class="Welcome"><p> Hello! Welcome ' + $("#nameInput").val() + '</p></div>');
			}
			else
			{
				alert("Name Already Taken");
			}
		})
    }
}

socket.on('message', function(data) {
    addMessage(data['message'], data['name']);
    console.log(data);
});

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

    $("#nameSet").click(function() {setName()});
    $('#nameForm').modal("open");
    $("#submit").click(function() {sendMessage();});
    $("#chatEntries").slimScroll({height: '600px'});
    $("#welcomeParagraph").hide();
});