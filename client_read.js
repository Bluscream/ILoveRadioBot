var ilr = {
	server: 'http://chat.iloveradio.de:13000',
	room: '101',
	name: 'Blu',
	mentions: ['Blu', 'Timo'],
	friends: ['Angi', 'Lost', 'Jessi.', 'Phip', 'Rudeltier'],
	blocked: ['Jessi', 'echtjetzt.', 'NoGamer01']
};
var socket = null;var debug = false;var skipBlocked = true;
var io = require('socket.io-client');
var $ = require('jquery');
var Entities = require('html-entities').XmlEntities;
entities = new Entities();
var chalk = require('chalk');
process.on('uncaughtException', function (e) {
  console.log(chalk.white.bgRed(e+'.'));
});
//	'String'.contains(str);
String.prototype.contains = function(str) {
	return this.indexOf(str) != -1;
};
function inArray(elem, array, i) {
    var len;
    if ( array ) {
        if ( array.indexOf ) {
            return array.indexOf.call( array, elem, i );
        }
        len = array.length;
        i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;
        for ( ; i < len; i++ ) {
            // Skip accessing in sparse arrays
            if ( i in array && array[ i ] === elem ) {
                return i;
            }
        }
    }
    return -1;
}
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
var room = function(room){
	socket.emit('joinroom', {
		'room': room
	});
};
var connect = function(server, chatroom, name){
	if(server){ilr.server = server;}
	socket = io(ilr.server, {
		transports: ['websocket', 'xhr-polling', 'polling', 'htmlfile', 'flashsocket']
	});
	socket.connect();
	if(chatroom){ilr.room = chatroom;}
	room(ilr.room);
	console.log(chalk.green('Connected to '+ilr.server+'/'+ilr.room));
};
var registerEvents = function(){
	socket.on('chat message', function(msg) {
		var _name = entities.decode(msg.name);
		var text = entities.decode(msg.text);
		var _text = text.toLowerCase();
		if(msg.verified){
			console.info(chalk.green(_name)+': '+text);
		}else{
			if(_name == ilr.name){
				console.log(chalk.underline.bold.cyan(_name)+': '+chalk.grey(text));
			}else{
				var custom = false;var skip = false;
				if(inArray(_name, ilr.blocked) != -1){
					if(skipBlocked){skip = true;
					}else{custom = true;_name = chalk.red(_name);text = chalk.grey('< Blocked message >');}
				}
				var _mentions = ilr.mentions.length;
				for (var i = 0; i < _mentions; i++) {
					if(_text.contains(ilr.mentions[i].toLowerCase()) || _text.contains(ilr.name.toLowerCase())){
						custom = true;_name = chalk.cyan(_name);text = chalk.underline.inverse(text);break;
					}
				}
				var _friends = ilr.friends.length;
				for (var i = 0; i < _friends; i++) {
					if(_name == ilr.friends[i]){
						custom = true;_name = chalk.magenta(_name);break;
					}
				}
				if(!skip){
					if(custom){
						console.log(_name+': '+text);
					}else{
						console.log(chalk.cyan(_name)+': '+text);
					}
				}
			}
		}
	});
	socket.on('room in', function() {
		console.log('chat wants me to room in');
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