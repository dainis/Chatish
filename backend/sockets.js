

exports.register = function() {

    var users = [];

    var user_sockets = new Array();

    var history = require('../backend/historylist').init();

    var field = require('../backend/field').init();

    var io = require('socket.io').listen(8081);

    var prepare_message = function(data, socket) {

	return {
	    message: data.message,
	    user_to: data.to,
	    timestamp: Date.now(),
	    id: socket.id
	};
    }

    io.sockets.on('connection', function (socket) {

	socket.emit('connect', users); //emit previously connected users

	field.add(socket.id);

	users.push(socket.id);

	user_sockets[socket.id] = socket;

	io.sockets.json.emit('redraw', field.get_field());

	socket.broadcast.emit('new_user', {id: socket.id}); //emit new user to the all previous users

	//New message came in
	socket.on('chat_message', function (data, calback) {

	    var message = prepare_message(data, socket);

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
		socket.json.emit('start_chat', result);
		user_sockets[result.user.id].json.emit('start_chat', field.get_user(socket.id));
	    }
	})
    });
};
