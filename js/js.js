
$(document).ready(function(){

	$('#nick_modal').modal({
		backdrop: 'static'
	}).modal('show');

	var socket = io.connect('http://192.168.88.238:8081');

	$('#send_nick').click(function(){

		socket.emit('nick', {
			nick: $('#nick').val()
			});
		$('#nick_modal').modal('hide');

		return false;
	})


	var active_user = 0;

	var image_cache = [];
	var tile_h = 55;
	var tile_w = 55;
	var tiles_x = 22;
	var tiles_y = 16;
	var img_path = '/img/';

	var canva = document.getElementById('canvas').getContext('2d');
	document.getElementById('canvas').setAttribute('width',tiles_x * tile_w);
	document.getElementById('canvas').setAttribute('height',tiles_y * tile_h);

	var can_move = true;

	var chat_modal = $('#chat_modal').modal({
		backdrop: true,
		keyboard: true
	});

	socket.on('connect', function(){
		
		//new user came in
		socket.on('new_user', function(data) {
			draw_avatar(data.x, data.y, data.avatar, data.nick);
		})

		socket.on('redraw', function(data){

			clear_canva();
			
			if(data) {
				$.each(data, function(i, user){
					draw_avatar(user.x, user.y, user.avatar, user.nick);
				})
			}

		});

		socket.on('moved', function(data){
			clear_avatar(data.old_position.x, data.old_position.y);
			draw_avatar(data.new_position_user.x, data.new_position_user.y, data.new_position_user.avatar, data.new_position_user.nick);
		});

		socket.on('disconnected', function(data){

			if(data) {

				if($('input[name="user_id"]', chat_modal).val() == data.id) {
					$('input[name="user_id"]', chat_modal).val('');
					chat_modal.modal('hide');
				}

				clear_avatar(data.x, data.y);
			}
		});

		socket.on('new_message', function(response) {
			push_message(response);
		})

		socket.on('start_chat', function(data) {

			chat_modal.modal('show');

			if(data.user) {
				$('input[name="user_id"]', chat_modal).val(data.user.id);
			}
			else if(data.id) {
				$('input[name="user_id"]', chat_modal).val(data.id);
			}
		});

		socket.on('chat_end', function(){
			$('input[name="user_id"]', chat_modal).val('');
			chat_modal.modal('hide');
		});

		$('#close_chat').click(function(){
			chat_modal.modal('hide');

			return false;
		})

		chat_modal.bind('hide', function(){
			if($('input[name="user_id"]', chat_modal).val() != '') {
				socket.emit('chat_end', {
					id : $('input[name="user_id"]', chat_modal).val()
				});
			}

			can_move = true;
		});

		chat_modal.bind('show', function(){
			$('#messages', chat_modal).html('');

			can_move = false;
		});

		$('#send_message').click(function(){

			socket.emit('chat_message', {
				message: $('#message').val(),
				to: $('input[name="user_id"]', chat_modal).val()
			});

			push_message({
				message: $('#message').val(),
				nick: 'You'
			});
			$('#message').val('');

			return false;
		})

		$(document).keydown(function(e){

			if (e.keyCode == 37 && can_move) {
				socket.json.emit('move', {
					direction: 'left'
				});
			}
			else if(e.keyCode == 38 && can_move) {
				socket.json.emit('move', {
					direction: 'up'
				});
			}
			else if(e.keyCode == 39 && can_move) {
				socket.json.emit('move', {
					direction: 'right'
				});
			}
			else if(e.keyCode == 40 && can_move) {
				socket.json.emit('move', {
					direction: 'down'
				});
			}
			else if(e.keyCode == 27) {
				return false;
			}
		});

	});

	var draw_avatar = function(x, y, avatar, nick) {

		if(! image_cache[avatar]) {

			var img = new Image();
			img.src = img_path + avatar + '.png';

			img.onload=function(){

				var img_canva = document.createElement('canvas');
				var ctx = img_canva.getContext('2d');

				img_canva.width = img.width;
				img_canva.height = img.height;

				ctx.drawImage(img, 0, 0, img.width, img.height);
				image_cache[avatar] = ctx.getImageData(0,0, img.width, img.height);

				draw_avatar_from_cache(x, y, avatar, nick);
			};
		}
		else {
			draw_avatar_from_cache(x, y, avatar, nick);
		}

	}

	var draw_avatar_from_cache = function(x, y, avatar, nick) {
		
		canva.putImageData(image_cache[avatar], x * tile_w, y * tile_h);
		
		if(nick) {
			canva.font = '12px sans-serif';
			canva.textBaseline = 'top';
			canva.textAlign = 'center';

			canva.fillText(nick, x * tile_w + tile_w / 2, y * tile_h, tile_w);
		}
		
	}

	var clear_canva = function() {
		canva.clearRect(0, 0, tiles_x * tile_w, tiles_y * tile_h);
	}

	var clear_avatar = function(x,y) {
		canva.clearRect(x * tile_w, y * tile_h,tile_w ,tile_h);
	}


})

var push_message = function(response){

	var message = $('<p><span></span><span><span></p>');

	$('span:eq(1)', message).text(response.message);
	$('span:eq(0)', message).text(response.nick + ' : ');
	$('#messages').append(message)
}

