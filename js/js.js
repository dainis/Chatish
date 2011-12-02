
$(document).ready(function(){

	var socket = io.connect('http://192.168.88.238:8081');

	socket.on('connect', function(data){alert(data)});

	$('#send').click(function(){
		
		socket.emit('chat_message', $('#chat').val(), function(response){
			console.log(response);
		});
		
		return false;
	})

})
