class Game{

    constructor(config = {useDictionary: true}){
        this._oldLetter = [];
        this._users = [];
        this._words = [];
        this._dictionary = []; //map
        this._game = {letter: '', loser: '', on: false};
        this._config = config;
        this._usrCount = 0;
    }

    get game(){
        return this._game;
    }

    get on(){
        return this._game.on;
    }

    get users(){
        return this._users;
    }

    get userCount(){
        return this._users.length;
    }

    set config(config){
        this._config = config;
    }

    get config(){
        return this._config;
    }

    get dictionary(){
        return this._dictionary;
    }

    set dictionary(dictionary){
        this._dictionary = dictionary;
    }

    addUser(sId, usr){
        this._users.push({id:sId, u:usr});
    }

    removeUser(sId){
        let usr = null;
        const u = this._users;

        for(let i=0;i<u.length;i++){
            if(sId === u[i].id){
                usr = u[i];
                u.splice(i, 1);
                break;
            }
        }

        if(this.userCount === 0){
            this._game.on = false;
         }

        return usr;
    }

    newGame(selWord){
        this._words = [];
        this._usrCount = 0;
        
        const rand = selWord === '' ? this.getNewLetter() : selWord;
        this._game = {letter: rand, word: '', loser: '', turn: this._users[0], on: true, message: null};
    }

    playTurn(msg){
        let endGame = '';
        const g = this._game;
        g.word = msg.text.toLowerCase();

        if(!g.word.startsWith(g.letter)){
            endGame = `the word must be started with ${g.letter.toUpperCase()} and not ${g.word.toUpperCase()}`;
        }else if(this.containWord(g.word)){
            endGame = `${g.word} has been used`;
        }else if(!this.containWordDictionary(g.word)){
            endGame = `my dictionary don\'t contains the word ${g.word}`;
        }

        if(endGame !== ''){
            g.loser = msg.user;
            g.on = false;
            g.endGame = endGame;
            g.countUserWords = this.getWordUserCount();
        }else{
            this._words.push({u: msg.user, w: g.word});
            g.turn = this.nextUserTurn();
        }

        g.message = msg;
    }

    nextUserTurn(){
        ++this._usrCount;
        if(this._usrCount >= this._users.length){
            this._usrCount = 0;
        }

        return this._users[this._usrCount];
    }

    containWord(word){
        return this._words.filter(e => e.w === word).length > 0;
    }

    containWordDictionary(word){
        return !this.config.useDictionary || this._dictionary[word.toLowerCase()] !== undefined;
    }

    getWordUserCount(){
        let res = [];
        let t = [];
        
        this._users.forEach(u => t[u.u] = 0);
        this._words.forEach(w => t[w.u] += 1);

        for (let p in t) {
            res.push({u: p, c: t[p]});
        }
        
        return res;
    }

    getNewLetter() {
        const possible = "abcdefghijklmnopqrstuvwxyz";
        let l = '';

        if(this._oldLetter.length >= possible.length){
            this._oldLetter = [];
        }

        do{
            l = possible.charAt(Math.floor(Math.random() * possible.length)); 
        }while(this._oldLetter.indexOf(l) !== -1);

        this._oldLetter.push(l);
        return l;
    }
}
module.exports = Game;