
$(document).ready(function(){

	var socket = io.connect('http://192.168.88.238:8081');

	$('#send').click(function(){
		console.log($('#chat').val());
		
		socket.emit('chat_message', $('#chat').val(), function(response){
			console.log(response);
		});
		
		return false;
	})

})
