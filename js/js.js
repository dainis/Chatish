
$(document).ready(function(){

    var socket = io.connect('http://localhost:8081');

    var active_user = 0;

    var tile_h = 55;
    var tile_w = 55;
    var tiles_x = 18;
    var tiles_y = 8;
    var img_path = '/img/';
    var canva = document.getElementById('canvas').getContext('2d');
    document.getElementById('canvas').setAttribute('width',tiles_x * tile_w);
    document.getElementById('canvas').setAttribute('height',tiles_y * tile_h);


    //new user came in
    socket.on('new_user', function(data) {
	$('#users').append('<p><a href="#" class="user" rel="' + data.id + '">' + data.id + '</a></p>');
    })

    socket.on('connect', function(data){

	$('#users').html('');

	if(data) {
	    $.each(data, function(i, user){
		$('#users').append('<p><a href="#" class="user" rel="' + user + '">' + user + '</a></p>');
	    })
	}

    });

    socket.on('redraw', function(data){

	clear_canva();

	if(data) {
	    $.each(data, function(i, user){
		draw_avatar(user.x, user.y, user.avatar);
	    })
	}

    });

    socket.on('moved', function(data){
	clear_avatar(data.old_position.x, data.old_position.y);
	draw_avatar(data.new_position_user.x, data.new_position_user.y, data.new_position_user.avatar);
    });

    socket.on('disconnect', function(data){
	clear_avatar(data.x, data.y);
    });


    $('.user').live('click', function(){

	var that = $(this);
	$('#messages').html('');

	active_user = that.attr('rel');

	draw_avatar(1, 1, 1);

	socket.emit('history', {user: that.attr('rel')}, function(response) {

	    if(response) {
		$.each(response, function(i, message){

		})
	    }
	})

	return false;
    });

    socket.on('new_message', function(response) {
	push_message($.extend(response, {user: 'He'}));
    })

    $('#send').click(function(){

	socket.emit('chat_message', {message: $('#chat').val(), to: active_user}, function(response){
	    console.log(response);
	});

	 push_message({message: $('#chat').val(), user: 'You'});

	return false;
    })

    var draw_avatar = function(x, y, avatar) {
	var img = new Image();
	img.src = img_path + avatar + '.png';

	img.onload=function(){
	    canva.drawImage(img, x * tile_w, y * tile_h, tile_w, tile_h);
	};
    }

    var clear_canva = function() {
	canva.clearRect(0, 0, tiles_x * tile_w, tiles_y * tile_h);
    }

    var clear_avatar = function(x,y) {
	canva.clearRect(x * tile_w, y * tile_h,tile_w ,tile_h);
    }

    $(document).keydown(function(e){
	if (e.keyCode == 37) {
	   socket.json.emit('move', {direction: 'left'});
	}
	else if(e.keyCode == 38) {
	    socket.json.emit('move', {direction: 'up'});
	}
	else if(e.keyCode == 39) {
	    socket.json.emit('move', {direction: 'right'});
	}
	else if(e.keyCode == 40) {
	    socket.json.emit('move', {direction: 'down'});
	}
    });
})

var push_message = function(response){

    var message = $('<div><span></span><p></p></div>');

    $('p', message).text(response.message);
    $('span', message).text(response.user);
    $('#messages').append(message)
}

