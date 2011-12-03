exports.init = function(){

    var history = [];

    /**
     * Adds message between two users
     */
    this.add = function(id1, id2, message) {

	for(i=0; i < history.length; i++) {
	    if((history[i].id1 == id1 && history[i].id2 == id2) || (history[i].id2 == id1 && history[i].id1 == id2)) {

		history[i].messages.push(message);
		return;
	    }
	}

	history.push({id1: id1, id2: id2, messages: []});
    }

    /**
     * Remove messages when user disconnects
     */
    this.disconnect = function(id) {

	for(i=0; i < history.length; i++) {
	    if(history[i].id1 == id || history[i].id2 == id) {
		splice(i + 1, 1);
	    }
	}

    }

    /**
     * Returns history of conversation
     */
    this.conversation_history = function(id1, id2) {

	for(i = 0; i < history.length; i++ ) {
	    if((history[i].id1 == id1 && history[i].id2 == id2) || (history[i].id2 == id1 && history[i].id1 == id2)) {

		return history[i].messages;
	    }
	}

	return [];
    }

    return this;
}