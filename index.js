//import Game from './game.js';

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');

const Game = require( './game.js');
const g = new Game();


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

io.on('connection', function(socket){
   const _id = socket.id;

   socket.on('new user', function(usr){
      g.addUser(socket.id, usr);
      io.emit('new user', g.users);
   });

   socket.on('new game', function(selWord){

      if(!g.on){
         g.newGame(selWord);

         if(g.config.useDictionary){
            g.dictionary = loadDataArray(__dirname + '/dictionary/' + g.game.letter + '.txt');
         }

         io.emit('on game', g.game);

      }else{
         io.emit('game error', {error:'game was started', game: g.game});
      }
   });        
    
   socket.on('message', function(msg){
      if(g.on){
         g.playTurn(msg);
         io.emit('on game', g.game);
      }else{
         io.emit('message', msg);
      }
   });
 
   socket.on('disconnect', function(){
      const removed = g.removeUser(_id);
      if(removed !== null){
         io.emit('bye user', {user:removed, arr:g.users});
      }
   });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});