var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

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

var usrCount = 0;
var oldLetter = [];
var users = [], words = [], dictionary = [];
var game = {letter:'', loser:'', on:false};
var config = {useDictionary: true};

function containWord(word){
    for(var i=0;i<words.length;i++){
        if(words[i].w === word){
            return true;
        }
    }
    
    return false;
}

function containWordDictionary(word){
   if(!config.useDictionary){
      return true;
   }
   
   return dictionary[word.toLowerCase()] !== undefined;
}

/*
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
        
        if(max === null || max.c < count){
            max = {u:users[i], c:count};
        }else{
        }
    }
    
    return max != null ? max.u : 'No winner...';
}
*/

function getWordUserCount(){
    var res = [];
    
	for(var i=0;i<users.length;i++){
        var count = 0;
        
        for(var j=0;j<words.length;j++){
            if(words[j].u === users[i].u){
                count++;
            }
        }
        
		res.push({u:users[i].u, c: count});
    }
    
    return res;
}

function loadDataArray(path){
   var map = [];
   fs.readFile(path, "utf8", function(err, data) {
      if (err){
         console.log('Error loading ' + path);
      }else{
         var temp = data.split('\n');
         for(var i=0; i<temp.length;i++){
            if( temp[i] !== "" ){
               map[temp[i].trim().toLowerCase()] = i;
            }
            
         }
      }
   });
   
   return map;
}

function getNewLetter() {
   var possible = "abcdefghijklmnopqrstuvwxyz";

   if(oldLetter.length >= possible.length){
      oldLetter = [];
   }
   
  do{
    l = possible.charAt(Math.floor(Math.random() * possible.length)); 
  }while(oldLetter.indexOf(l) !== -1 );
  
  oldLetter.push(l);
  return l;
}

io.on('connection', function(socket){
   
   const _id = socket.id;
   
   socket.on('new game', function(selWord){

      if(!game.on){
         words = [];
         usrCount = 0;

         var rand = selWord === '' ? getNewLetter() : selWord;
         game = {letter:rand, word: '', loser:'', turn: users[usrCount], on:true, message:null};

         if(config.useDictionary){
            dictionary = loadDataArray(__dirname + '/dictionary/' + rand + '.txt');
         }

         io.emit('on game', game);

      }else{
         io.emit('game error', {error:'game was started', game:game});
      }
   });        
    
   socket.on('message', function(msg){
      if(game.on){
         game.word = msg.text.toLowerCase();

         var endGame = '';

         if(!game.word.startsWith(game.letter)){
            endGame = 'the word must be started with ' + game.letter.toUpperCase() + ' and not ' + game.word.toUpperCase();
         }else if(containWord(game.word)){
            endGame = game.word + ' has been used';
         }else if(!containWordDictionary(game.word)){
            endGame = 'my dictionary don\'t contains the word ' + game.word;
         }

         if(endGame !== ''){
            game.loser = msg.user;
            game.on = false;
            game.endGame = endGame;
            game.countUserWords = getWordUserCount();

         }else{
            words.push({u: msg.user, w: game.word});

            usrCount++;
            if(usrCount >= users.length){
               usrCount=0;
            }

            game.turn = users[usrCount];                
         }

         game.message = msg;
         io.emit('on game', game);

      }else{
         io.emit('message', msg);
      }
   });
    
   socket.on('new user', function(usr){
      users.push({id:socket.id, u:usr});
      io.emit('new user', users);
   });
    
   socket.on('disconnect', function(){
      var idx = -1;
      
      for(var i=0;i<users.length;i++){
         if(_id === users[i].id){
            idx = i;
            break;
         }
      }
      
      if(idx > -1){
         var usr = users[idx];   
         users.splice(idx, 1);
         io.emit('bye user', {user:usr, arr:users});         
      }
      
      if(users.length === 0){
         game.on = false;
      }
      
   });
   
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});