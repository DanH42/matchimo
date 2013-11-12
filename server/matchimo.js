var fs = require("fs");
var express = require("express");
var app = express();
var IMO = require('imoapi');
var Matchimo = require('../web/rules.js');

var MongoStore = require('connect-mongo')(express);
var mongo = new (require("mongolian"))({log:{debug:function(){}}});
var mdb = mongo.db("matchimo");
var db = {};
db.scores = mdb.collection("scores");

var allow_cross_domain = function(req, res, next){
	res.header('Access-Control-Allow-Origin', 'http://matchimo.xd6.co');
	res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	res.header('Access-Control-Allow-Credentials', 'true');
	next();
}

app.configure(function(){
	app.use(allow_cross_domain);
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	var secret = "MatchimoPersonaDefaultSecret";
	if(fs.existsSync("secret.txt"))
		secret = fs.readFileSync("secret.txt") + '';
	else
		console.log("WARNING: Using default session secret.\nYou should use your own by putting something in a file called secret.txt");
	app.use(express.session({
		store: new MongoStore({
			db: 'matchimo'
		}),
		cookie: {
			maxAge: 1209600000 // 2 weeks
		},
		secret: secret
	}));
});

require("express-persona")(app, {audience: "http://matchimo.xd6.co:80"});

app.listen(8010, '127.0.0.1');

app.get('/', function(req, res){
	res.send();
	//res.redirect("http://matchimo.xd6.co/scores");
});

var games = {};

app.get('/check/:channel/:id', function(req, res){
	if(!req.session.email){
		res.statusCode = 401;
		res.send("Not logged in!");
		return;
	}

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
				var score = games[req.params.channel].game.get_user_data(users[i], "score");
				games[req.params.channel].scores[users[i]] = score;
			}
			games[req.params.channel].winners = games[req.params.channel].game.get_winners();
		},

		connected: function(){
			// Reset the timeout to allow a full 5 seconds for history to replay
			set_timeout();
		},

		init: function(){
			if(games[req.params.channel].scores){
				if(games[req.params.channel].scores[req.params.id]){
					db.scores.findOne({
						channel: req.params.channel,
						id: req.params.id
					}, function(err, session){
						if(!err && session){
							if(session.email === req.session.email){
								db.scores.update(session, {
									$set: {
										score: games[req.params.channel].scores[req.params.id]
									}
								}, function(){
									disconnect("Score updated", 200);
								});
							}else
								disconnect("Score already belongs to another user", 503);
						}else{
							if(err)
								console.log(err);
							db.scores.insert({
								email: req.session.email,
								channel: req.params.channel,
								id: req.params.id,
								score: games[req.params.channel].scores[req.params.id]
							}, function(){
								disconnect("Score added", 200);
							});
						}
					});
				}else{
					console.log(games[req.params.channel].scores);
					disconnect("User never played game", 503);
				}
			}else
				disconnect("Game still in progress", 503);
		}
	};

	set_timeout();
	games[req.params.channel] = {};
	games[req.params.channel].game = new Matchimo(IMO, handlers, req.params.channel, "test_token_1");
	games[req.params.channel].game.init();
});

app.options('*', function(req, res){
	// Handle OPTIONS requests, which are needed for CORS
	res.send();
});
