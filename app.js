var http = require('http'); //the http module is required be cause this server serves an html page
var fs = require('fs'); //the fs module is used to read the html page that is served
var socketio = require('socket.io'); //the chat communication is done using socket.io

var messages = [];


//this function is called when the http server is created. 
//no matter what the url is, it only returns 'index.html'
//I use 'fs' to read the html file, and then send it back to the browser in the response. 
var handler = function (req, res) {
    fs.readFile('index.html', function (err, data) {
        if (err) {
            res.writeHead(500);
            return (res.end("Error loading file."));
        } else {
            res.writeHead(200);
            return (res.end(data));
        }
    });
};


var server = http.createServer(handler); //create the http server. 
var io = socketio.listen(server); //create and instance of socket.io and have it listen to the http server. 

//When a connection is made to the server, this function runs. 
io.sockets.on('connection', function (socket) {
    console.log("A new user connected: " + " id: " + socket.id + " room: " + socket.room);

    //This send all the message to the new user that just connected
    var numMessages = messages.length;
    for (i = 0; i < numMessages; i++) {
        socket.emit('broadcast', messages[i].name + ":" + messages[i].message);
    }

    //runs when a 'message' event is recieved
    socket.on('message', function (msg, name) {
        messages.push({
            name: name,
            message: msg
        }); // add the message to the array of messages. 
        console.log(name + " said: " + msg);
        socket.broadcast.emit('broadcast', name + ": " + msg); //this broadcasts to all connected sockets except the one that the message came from. 
        socket.emit('broadcast', name + ": " + msg); // this emits on the socket that the message came from. 
    });

    socket.on('disconnect', function (reason) {
        console.log(socket.id + "has disconnected. Reason: " + reason);
    });
});


//start the server listening. 
server.listen(8080, function () {
    var d = new Date();
    console.log("Server started on " + d.toUTCString());
});
