# node-js-word-game

## What is it

It is a multiplayer word game built with Node.js 

## How to start
Download the project and [Node.js](https://nodejs.org/en/)

Install the required libraries:

1. npm install --save express@4.15.2
2. npm install --save socket.io

Start the game:

1. Go to application folder
2. execute "node index.js" command
3. Open http://localhost:3000/

## How to play

Open Node.js address in your (Chrome) browser
![Open game](https://github.com/marcusbecker/node-js-word-game/blob/master/doc/open.png "Run game")

Whait for players (or not) and click in **New Game**
![Gameplay](https://github.com/marcusbecker/node-js-word-game/blob/master/doc/gameplay.png "Two players playing")

## The rules

The game ends when: 
1. You choose a word that doesn't start with the selected letter
2. You use a repeated word
3. You write a word that isn't in our dictionary (thanks https://github.com/dwyl/english-words)

## And more

If you aren't playing the game you can use it like a chat :)
