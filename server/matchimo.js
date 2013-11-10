var express = require("express");
var app = express();
var IMO = require('/home/dan/Dropbox/Code/imoapi-nodejs/imoapi.js');
var Matchimo = require('../web/rules.js');

var mongo = new (require("mongolian"))({log:{debug:function(){}}});
var tc = mongo.db("matchimo");
var db = {};
db.users = tc.collection("users");

var allow_cross_domain = function(req, res, next){
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
}

app.configure(function(){
	app.use(allow_cross_domain);
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({secret: "mozillapersona"}));
});

require("express-persona")(app, {audience: "http://matchimo.xd6.co:80"});

app.listen(8010, '127.0.0.1');

app.get('/', function(req, res){
	res.redirect("http://matchimo.xd6.co/scores");
});

var games = {};

app.get('/check/:channel', function(req, res){
	if(games[req.params.channel]){
		res.statusCode = 503;
		res.send("Already checking channel; try again in a few seconds.");
		return;
	}

	console.log("CHECK", req.params.channel);

	var timeout = -1;

	var clear_timeout = function(){
		if(timeout !== -1)
			clearTimeout(timeout);
	};

	var set_timeout = function(){
		clear_timeout();
		timeout = setTimeout(do_timeout, 5000);
	};

	var do_timeout = function(){
		disconnect("API connection timed out.", 504);
	};

	var disconnect = function(response, code){
		clear_timeout();
		games[req.params.channel].game.destroy();
		delete games[req.params.channel];
		res.statusCode = code;
		res.send(response);
	};

	var handlers = {
		complain: function(cheated, msg){
			if(cheated)
				disconnect(msg, 403);
		},

		game_over: function(){
			games[req.params.channel].scores = {};
			var users = games[req.params.channel].game.get_users();
			for(var i = 0; i < users.length; i++){
				var name = games[req.params.channel].game.get_user_data(users[i], "name");
				var score = games[req.params.channel].game.get_user_data(users[i], "score");
				games[req.params.channel].scores[name] = score;
			}
			games[req.params.channel].winners = games[req.params.channel].game.get_winners();
		},

		connected: function(){
			set_timeout(); // Reset the timeout to allow a full 5 seconds for history to replay
		},

		init: function(){
			if(games[req.params.channel].winners){
				disconnect({
					scores: games[req.params.channel].scores,
					winners: games[req.params.channel].winners
				}, 200);
			}else
				disconnect("Game still in progress", 503);
		}
	};

	set_timeout();
	games[req.params.channel] = {};
	games[req.params.channel].game = new Matchimo(IMO, handlers, req.params.channel, "test_token_1");
	games[req.params.channel].game.init();
});

app.get('/scores.js', function(req, res){
	res.send(/*TODO*/);
});

app.options('/persona/verify', function(req, res){
	res.send();
});
