var http = require('http');
var port = 8900; // Peut-être le récupérer depuis l'argument en CLI ?
// Création du serveur
var server = http.createServer(function(req, res) {
	res.writeHead(200, {"Content-Type": "text/html"});
	res.end();
});

// Chargement de socket.io
var io = require('socket.io').listen(server);

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
	
	socket.emit("serveur_message", "Vous êtes connecté");
	
    // Quand le serveur reçoit un signal de type "tchat_message" d'un client    
	socket.on('tchat_message', function(message) {
		io.sockets.emit("tchat_message", message);
	})
	
	socket.on('disconnect', function () {
        io.sockets.emit('serveur_message', "Votre interlocuteur s'est déconnecté");
    });
});

server.listen(port);
console.log("Now listening on http://localhost:"+port);