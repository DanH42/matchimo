Matchimo
========

**Matchimo** is a turn-based card matching memory game for 2 or more players. It is built using the [imo.im API](https://imo.im/developers/)

Objective
---------

Matchimo features the 20 current full-time employees at [imo.im](http://imo.im/about). In a game, 8 employees will be chosen at random, and 2 cards for each will be placed onto the game board: one with the employee's name, and another showing their face. The object is to match names to faces; the player with the most correct matches wins.

Gameplay
--------

In order to begin a game, there must be at least 2 players present. To invite a friend, just share the link from your browser with the auto-generated `ch_id` with a friend, up to but *not* including the text after the `#`. The text after the `#` in the URL is your identity key for the current session, and is used to resume your session in the event of a page refresh or browser crash.

Once at least one friend has joined, click the "Start Game" button at the top of the screen. It will then be the turn of the first person to have joined the game. Turn order is based on the order in which players join. When it's your turn, the cards will turn blue. Click two of them, and they'll flip over. All current players will be able to see your selection. If you made a correct match, the cards will stay turned over, the full bio of the person you just matched will appear, and you get to have another turn. Once you make an incorrect guess, it becomes the turn of the next person in line. You can hover over completed matches to see their biographies while you wait for your turn.

Once all matches have been made, you have the option of keeping the current scores and resetting the board to play another game with new names and faces.

Server
------

Matchimo also has a **very beta** server component, written in Node.JS, that can keep track of user scores. It has the following dependencies:

- [imoapi](https://github.com/DanH42/imoapi-nodejs) (Used to connect to the imo API)
- [express](https://github.com/visionmedia/express) (Used to handle HTTP connections)
- [express-persona](https://github.com/jbuck/express-persona) (Handles user authentication using [Mozilla Persona](https://login.persona.org/about))
- [connect-mongo](https://github.com/kcbanner/connect-mongo) (Stores login session data using [MongoDB](http://www.mongodb.org/))
- [mongolian](https://github.com/marcello3d/node-mongolian) (Stores all other data using MongoDB(http://www.mongodb.org/))

These can all be installed by running `npm install` from the `server/` directory.

To start the server, run `node matchimo.js`, also from the `server/` directory. This will start up an HTTP server on `http://127.0.0.1:8010` by default.
