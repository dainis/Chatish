
exports.init = function() {

    var field = [];

    var field_x = 22;
    var field_y = 16;

    var avatars = [1, 2, 3, 4, 5];

    for(var x = 0; x < field_x; x++) {
	field[x] = new Array(field_y);

	for(var y = 0; y < field_y; y++) {
	    field[x][y] = null;
	}
    }

    this.get_user = function(id) {

	for(var x = 0; x < field_x; x++) {
	    for(var y = 0; y < field_y; y++) {

		if(field[x][y] && field[x][y].id == id) {
		    return field[x][y];
		}
	    }
	}

	return false;
    }

    this.add = function(id) {

	var added = false;
	var x, y;

	while(! added) {
	    x = Math.floor(Math.random() * field_x);
	    y = Math.floor(Math.random() * field_y);

	    if(! field[x][y]) {
		added = true;
	    }
	}

	var user = {id: id,
		    avatar: avatars[Math.floor(Math.random() * avatars.length)],
		    x: x,
		    y: y};

	field[x][y] = user;

	return user;
    }

    this.remove = function(id) {

	for(var x = 0; x < field_x; x++) {

	    for(var y = 0; y < field_y; y++) {
		if(field[x][y] && field[x][y].id == id) {

		    var return_obj = field[x][y];

		    delete field[x][y];
		    field[x][y] = null;
		    
		    return return_obj;
		}
	    }
	}

	return false;
    }

    this.get_field = function() {

	var return_array = [];

	for(var x = 0; x < field_x; x++) {

	    for(var y = 0; y < field_y; y++) {
		if(field[x][y] != null) {
		    return_array.push(field[x][y]);
		}
	    }
	}

	return return_array;
    }

    var current_position = function(id) {
	for(var x = 0; x < field_x; x++) {

	    for(var y = 0; y < field_y; y++) {

		if(field[x][y] != null && field[x][y].id == id) {
		    return {x: x, y: y};
		}
	    }
	}

	return false;
    }

    var move_to_position = function(id, new_pos, old_pos) {

	console.log(field[new_pos.x][new_pos.y]);

	if(field[new_pos.x][new_pos.y] != null) {
	    return {status: 'ocupied', user: field[new_pos.x][new_pos.y]};
	}

	field[new_pos.x][new_pos.y] = field[old_pos.x][old_pos.y];
	field[old_pos.x][old_pos.y] = null;
	field[new_pos.x][new_pos.y].x = new_pos.x;
	field[new_pos.x][new_pos.y].y = new_pos.y;

	return {status: 'moved', old_position : old_pos, new_position_user: field[new_pos.x][new_pos.y]};

    }

    this.up = function(id) {
	var position = current_position(id);

	if(position && position.y - 1 >= 0) {
	    return move_to_position(id, {x: position.x, y: position.y - 1}, position);
	}

	return {status : 'fail'};
    }

    this.down = function(id) {
	var position = current_position(id);

	if(position && position.y + 1 < field_y) {
	    return move_to_position(id, {x: position.x, y: position.y + 1}, position);
	}

	return {status : 'fail'};
    }

    this.right = function(id) {
	var position = current_position(id);

	if(position && position.x + 1 < field_x) {
	    return move_to_position(id, {x: position.x + 1, y: position.y}, position);
	}

	return {status : 'fail'};
    }

    this.left = function(id) {

	var position = current_position(id);

	if(position && position.x - 1 >= 0) {
	    return move_to_position(id, {x: position.x - 1, y: position.y}, position);
	}

	return {status : 'fail'};
    }

    return this;
}