const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');

app.use(express.static('public'));
app.use('/libs', express.static('node_modules'));

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/message', (req, res) => {
	console.log("Got message: ", req.body);
	io.sockets.emit('msg', req.body);
	res.sendStatus(200);
});

http.listen(3000, () => {
	console.log("Server listening on port localhost:3000");
});
