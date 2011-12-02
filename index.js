var sys = require("util"), http = require("http");  

var io = require('socket.io').listen(8081);

var fs = require('fs');
var index = '';

fs.readFile('./htmls/index.html', function (err, data) {
	if (err) {
		throw err; 
	}
	index = data;
});


io.sockets.on('connection', function (socket) {
	sys.puts('connected');
	
	socket.emit('news', {
		hello: 'world'
	});
	socket.on('chat_message', function (data) {
		socket.emit('trolololo', {head : 'tail'})
		console.log(data);
	});
});

try {
	var http = require('http');
	var fs = require('fs');
	var path = require('path');
 
	http.createServer(function (request, response) {
 
		console.log('request starting...');
     
		console.log(request.url);
	 
		var filePath = '.' + request.url;
		if (filePath == './')
			filePath = './htmls/index.html';
         
		var extname = path.extname(filePath);
		var contentType = 'text/html';
		
		switch (extname) {
			case '.js':
				contentType = 'text/javascript';
				break;
			case '.css':
				contentType = 'text/css';
				break;
		}
     
		path.exists(filePath, function(exists) {
     
			if (exists) {
				fs.readFile(filePath, function(error, content) {
					if (error) {
						response.writeHead(500);
						response.end();
					}
					else {
						response.writeHead(200, {
							'Content-Type': contentType
						});
						response.end(content, 'utf-8');
					}
				});
			}
			else {
				response.writeHead(404);
				response.end();
			}
		});
     
	}).listen(8080); 
}   
catch (e) {
	console.log('fuck')
}

      
sys.puts("Server running at http://192.168.88.238:8080/");  