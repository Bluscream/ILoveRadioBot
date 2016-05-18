var io = require('socket.io-client');
var $ = require('jquery');
var chalk = require('chalk');
var ownlogout = false;var socket = null;var debug = false;
var ilr = {
	server: 'http://chat.iloveradio.de:13000',
	room: '101',
	name: 'Blu'
};
var currentName = ilr.name;
process.on('uncaughtException', function (e) {
  console.log(chalk.white.bgRed(e+'.'));
});
function query(text, callback) {
    'use strict';
    process.stdin.resume();
    process.stdout.write(text);
    process.stdin.once("data", function (data) {
        callback(data.toString().trim());
    });
}
var waitForMessage = function(){
	query('', function(response){
		if(response.startsWith('name ')){
			logout();login(response.replace('name ', ''));
		}else if(response.startsWith('eval ')){
			try{
				var _result = eval('(' + response.replace('eval ', '') + ')');
				console.log(_result);
			}catch(e){console.error(e);}
		}else if(response.startsWith('log ')){
			console.log(eval(response.replace('log ', '')));
		}else{
			message(response);console.log('\033[2J');
		}
		process.stdin.pause();
		waitForMessage();
	});
};
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
var randomString = function(len){
	var text = "";var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for(var i=0;i<len;i++){text += possible.charAt(Math.floor(Math.random() * possible.length));}
	return text;
};
var getPlaying = function(){
	$.ajax({
		url: 'http://www.iloveradio.de/xmlparser.php?allchannels=13',
		success: function(xmlAll) {
			for (var c = 1; c <= 13; c++) {
				(function(c) {
					var xml = $(xmlAll).find('ilr_trackinfo[channel=' + c + ']');
					var csrc = xml.find('image').attr('src');
					var a = xml.find('artist').text();
					var t = xml.find('title').text();
					console.log(xml+": "+t+" - "+a);
				});	
			}
		},
	});
}
var login = function(name){
	currentName = name;
	socket.emit('login', { 'name': name });
};
var logout = function() {
	ownlogout = true;
    socket.emit('logout'); 
};
var room = function(room){
	socket.emit('joinroom', {
		'room': room
	});
};
var message = function(msg){
	if(debug){console.log(chalk.grey('Sending message: '+msg));}
	socket.emit('chat message', { 'text': msg });
};
var connect = function(server, chatroom, name){
	if(server){ilr.server = server;}
	socket = io(ilr.server, {
		transports: ['websocket', 'xhr-polling', 'polling', 'htmlfile', 'flashsocket']
	});
	console.log(chalk.green('Welcome to the ILoveRadio Shoutbox!'));
	console.log(chalk.green('Commands: <message>, eval <code>, name <newname>'));
	socket.connect();
	if(chatroom){ilr.room = chatroom;}
	room(ilr.room);
	if(name){ilr.name = name;}
	login(name);
};
var registerEvents = function(){
	socket.on('login', function(msg) {
		if (msg.success === 'true') {
			console.log(chalk.black.bgGreen('Logged in.'));
		} else if (msg.success === 'wrong') {
			console.log(chalk.red('Login wrong.'));
		} else {
			console.log(chalk.red('Could not log in.'));
			connect();
		}
	});
	socket.on('logout', function() {
		console.log(chalk.black.bgYellow('Logged out!'));
		if(!ownlogout){
			if(ilr.name){
				login(ilr.name);
			}else{
				login(randomString(9));
			}
		}else{
			ownlogout = false;
		}
	});
	socket.on('room in', function() {
		console.log('chat wants me to room in');
	});
	socket.on('vum_registration_fail', function() {
		console.log(chalk.red('vum_registration_fail'));
	});
	socket.on('vum_registration_done', function() {
		console.log('vum_registration_done');
	});
};
if (null === socket) {
	connect();registerEvents();
} else {
	if (socket.disconnected) {
		console.log(chalk.white.bgRed('Socket Disconnected: reconnecting...'));
		connect();
	}
}
waitForMessage('');