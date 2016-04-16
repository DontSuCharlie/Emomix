// client side config
var socket = io.connect();
function addMessage(msg, name) {
    $("#chatEntries").append('<div class="message"><p>' + name + ' : ' + msg + '</p></div>');
}

function sentMessage() {
    if ($('#messageInput').val() != "") 
    {
        socket.emit('message', $('#messageInput').val());
        addMessage($('#messageInput').val(), "Me"); // replace Me with current user
        $('#messageInput').val('');
    }
}
function setName() {
    if ($("#nameInput").val() != "")
    {
        socket.emit('setName', $("#nameInput").val());
        $('#chatControls').show();
        $('#nameInput').hide();
        $('#nameSet').hide();
        $("#welcomeParagraph").show();
        $("#welcomeParagraph").append('<div class="Welcome"><p> Hello! Welcome ' + $("#nameInput").val() + '</p></div>');
    }
}
socket.on('message', function(data) {
    addMessage(data['message'], data['name']);
    console.log(data);
});

// init

$(function() {
    $("#chatControls").hide();
    $("#nameSet").click(function() {setName()});
    $("#submit").click(function() {sentMessage();});
    $("#welcomeParagraph").hide();
});