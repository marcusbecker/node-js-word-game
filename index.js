let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let fs = require('fs');

app.get('/', (req, res) => {
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

let usrCount = 0;
let oldLetter = [];
let users = [], words = [], dictionary = [];
let game = {letter:'', loser:'', on:false};
const config = {useDictionary: true};

function containWord(word){
   return words.filter(e => e.w === word).length > 0;
}

function containWordDictionary(word){
   return !config.useDictionary || dictionary[word.toLowerCase()] !== undefined;
}

/*
function getWinner(loser){
    let max = null;
    for(let i=0;i<users.length;i++){
        if(loser === users[i]){
            continue;
        }
        
        let count = 0;
        
        for(let j=0;j<words.length;j++){
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
   let res = [];
   let t = [];
   
   users.forEach(u => t[u.u] = 0);
   words.forEach(w => t[w.u] = t[w.u] + 1);

   for (let p in t) {
      res.push({u: p, c: t[p]});
   }
   
   return res;
}

function loadDataArray(path){
   let map = [];
   fs.readFile(path, "utf8", function(err, data) {
      if (err){
         console.log('Error loading ' + path);
      }else{
         let temp = data.split('\n');
         temp.forEach((t, i) => {
            if( t !== "" ){
               map[t.trim().toLowerCase()] = i;
            }            
         });
      }
   });
   
   return map;
}

function getNewLetter() {
   const possible = "abcdefghijklmnopqrstuvwxyz";

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

         const rand = selWord === '' ? getNewLetter() : selWord;
         game = {letter: rand, word: '', loser: '', turn: users[usrCount], on: true, message: null};

         if(config.useDictionary){
            dictionary = loadDataArray(__dirname + '/dictionary/' + rand + '.txt');
         }

         io.emit('on game', game);

      }else{
         io.emit('game error', {error:'game was started', game: game});
      }
   });        
    
   socket.on('message', function(msg){
      if(game.on){
         game.word = msg.text.toLowerCase();

         let endGame = '';

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
               usrCount = 0;
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
      for(let i=0;i<users.length;i++){
         if(_id === users[i].id){
            let usr = users[i];   
            users.splice(i, 1);
            io.emit('bye user', {user:usr, arr:users});
            break;
         }
      }
      
      if(users.length === 0){
         game.on = false;
      }

   });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});