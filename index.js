var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

/*
io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});
*/

var i=0;
var users = [];
var words = [];
var game = {letter:'', winner:'', loser:'', on:false};

function containWord(word){
    for(var i=0;i<words.length;i++){
        if(words[i].w === word){
            return true;
        }
    }
    
    return false;
}

function getWinner(loser){
    var max = null;
    for(var i=0;i<users.length;i++){
        if(loser === users[i]){
            continue;
        }
        
        var count = 0;
        
        for(var j=0;j<words.length;j++){
            if(words[j].u === users[i]){
                count++;
            }
        }
        
        if(max === null){
            max = {u:users[i], c:count};
        }else if(max.c < count){
            max = {u:users[i], c:count};
        }
    }
    
    return max != null ? max.u : 'No winner...';
}

io.on('connection', function(socket){
    
    socket.on('new game', function(usr){
        
        if(!game.on){
            i = 0;
            words = [];
            var rand = String.fromCharCode(97 + Math.floor((Math.random() * 25)));
            game = {letter:rand, word: '', winner:'', loser:'', turn: users[i], on:true, message:null};
        }else{
        }
        
        io.emit('on game', game);
    });        
    
    socket.on('message', function(msg){
        if(game.on){
            game.word = msg.text.toLowerCase();
            if(!game.word.startsWith(game.letter) || containWord(game.word)){
                game.winner = getWinner(msg.user);
                game.loser = msg.user;
                game.on = false;
            }else{
                words.push({u: msg.user, w: game.word});
                
                i++;
                if(i >= users.length){
                    i=0;
                }

                game.turn = users[i];                
            }
            
            game.message = msg;
            io.emit('on game', game);
            
        }else{
            io.emit('message', msg);
        }
    });
    
    socket.on('new user', function(usr){
        users.push(usr);
        io.emit('new user', users);
    });    
    
    socket.on('disconnect', function(){
        io.emit('bye user');
    });    
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});