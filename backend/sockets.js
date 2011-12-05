

exports.register = function() {

    var users = [];

    var user_sockets = [];

    var blocked_users = [];

    var history = require('../backend/historyList').init();

    var field = require('../backend/field').init();

    var io = require('socket.io').listen(8081);

    io.configure(function(){
	io.set('heartbeat timeout', 5);
	io.set('close timeout', 5);
	io.set('heartbeat interval', 10);
	io.set('debug', 1);
    })

    var prepare_message = function(data, socket) {

	return {
	    message: data.message,
	    user_to: data.to,
	    timestamp: Date.now(),
	    id: socket.id
	};
    }

    var delete_block = function(id) {

	if(blocked_users[id]) {
	    delete blocked_users[id];
	}
    }

    io.sockets.on('connection', function (socket, data) {

	socket.on('nick', function(data){

	    field.add(socket.id);

	    users[socket.id] = data.nick;

	    user_sockets[socket.id] = socket;

	    io.sockets.json.emit('redraw', field.get_field());

	    socket.broadcast.emit('new_user', {id: socket.id}); //emit new user to the all previous users
	})


	//New message came in
	socket.on('chat_message', function (data, calback) {

	    var message = prepare_message(data, socket);

	    message.nick = users[socket.id];

	    history.add(socket.id, data.to, message);

	    user_sockets[data.to].json.emit('new_message', message);
	});

	socket.on('history', function(data, fn){

	    fn(history.conversation_history(data.id, socket.id));
	});

	socket.on('disconnect', function () {

	    var position = field.remove(socket.id);

	    io.sockets.emit('disconnected', position);
	});

	socket.on('chat_end', function(data){

	    delete_block(socket.id);
	    delete_block(data.id);

	    if(data.id && user_sockets[data.id]) {
		user_sockets[data.id].emit('chat_end');
	    }
	});

	socket.on('move', function(data){

	    var result = {status: 'fail'};

	    if(data.direction == 'up') {
		result = field.up(socket.id);
	    }
	    if(data.direction == 'down') {
		result = field.down(socket.id);
	    }
	    if(data.direction == 'left') {
		result = field.left(socket.id);
	    }
	    if(data.direction == 'right') {
		result = field.right(socket.id);
	    }

	    if(result.status == 'moved') {
		io.sockets.json.emit('moved', result);
	    }

	    if(result.status == 'ocupied') {

		var user_to = field.get_user(socket.id);

		if(blocked_users[result.user.id]) {
		    return;
		}

		blocked_users[result.user.id] = true;
		blocked_users[socket.id] = true;

		socket.json.emit('start_chat', result);
		user_sockets[result.user.id].json.emit('start_chat', user_to);
	    }
	})
    });
};
