var io = require('socket.io-client');
var md5 = require(__dirname+'/md5.js');
var spam;var ownlogout = false;
var server = 'http://chat.iloveradio.de:13000';var chatroom = '101';
console.log('Server: '+server+'/'+chatroom);
var socket = null;
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});
function query(text, callback) {
    'use strict';
    process.stdin.resume();
    process.stdout.write(text);
    process.stdin.once("data", function (data) {
        callback(data.toString().trim());
    });
}
function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

var randomString = function(len){
	var text = "";var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for(var i=0;i<len;i++){text += possible.charAt(Math.floor(Math.random() * possible.length));}
	return text;
};
var waitForMessage = function(){
	query('', function(response){
		if(response.startsWith('msg ')){
			message(response.replace('msg ', ''));
		}else if(response.startsWith('name ')){
			logout();
			login(response.replace('name ', ''));
		}else if(response.startsWith('eval ')){
			eval(response.replace('eval ', ''));
		}else if(response == 'restart'){
			process.exit(1);
		}
		process.stdin.pause();
		waitForMessage();
	});
}
var register = function(name, email, pw){
	socket.emit('vum_register', {'name': name, 'mail': email, 'password': pw});
}
var login = function(name){
	socket.emit('login', {
		'name': name
	});
}
var logout = function() {
	ownlogout = true;
    socket.emit('logout'); 
}
var room = function(roomnumber){
	socket.emit('joinroom', {
		'room': roomnumber
	});
}
var message = function(msg){
	socket.emit('chat message', {
		'text': msg
	});
}
var connect = function(){
	socket = io(server, {
		transports: ['websocket', 'xhr-polling', 'polling', 'htmlfile', 'flashsocket']
	});
	socket.connect();
	room(chatroom);
	// login(randomString(9));
}
if (null === socket) {
	connect();
	socket.on('chat message', function(msg) {
		if(msg.verified){
			console.info(msg.name+' (VERIFIED): '+msg.text);
		}else{
			console.log(msg.name+': '+msg.text);
		}
	});
	socket.on('login', function(msg) {
		if (msg.success === 'true') {
			console.log('Logged in.');
		} else if (msg.success === 'wrong') {
			console.log('Der Login hat nicht geklappt! Prüfe bitte Name und Passwort.');
		} else {
			console.log('Dein Name scheint schon belegt zu sein... benutze bitte einen anderen!');
			connect();
		}
	});
	socket.on('logout', function() {
		console.log('Logged out!');
		if(!ownlogout){
			login(randomString(9));
		}else{
			ownlogout = false;
		}
	});
	socket.on('disconnect', function() {
		console.log(chalk.white.bgRed('Socket Disconnected: reconnecting...'));
		socket.reconnect();
	});
	} else {
	if (socket.disconnected) {
		console.log(chalk.white.bgRed('Socket not connected: reconnecting...'));
		socket.connect();
	}
};
waitForMessage();