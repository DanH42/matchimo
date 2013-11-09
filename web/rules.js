/*
Functions that can be implemented:
- user_join(Object event)
- load_board(Array order)
- complain(Boolean cheated, String msg) -- if cheated is true, the entire game is thrown
- select_pair(String id, Array indices, Array pair, Boolean isMatch);
- game_over()
- connected() -- Called once a connection is made to the API
- init() -- Called as soon as the page is loaded and all past events have been replayed

*/

var Matchimo = null;

(function(){
	var debug = false;

	if(typeof $ !== "function"){
		$ = {
			inArray: function(needle, haystack){
				return haystack.indexOf(needle);
			}
		};
	}

	// http://stackoverflow.com/a/3886106/802335
	function non_integer(n){
		return typeof n !== 'number' || n % 1 !== 0;
	}

	Matchimo = function(IMO, handlers, ch_id, token){
		var game = this;

		this.inGame = false;
		this.caughtUp = false;

		this.gridRows = 4;
		this.gridCols = 4;

		this.board = [];
		this.matches = [];
		this.turnOrder = [];

		this.users = {};

		this.currentTurn = -1;

		this.next_turn = function(){
			this.currentTurn++;
			if(this.currentTurn >= this.turnOrder.length)
				this.currentTurn = 0;

			if(typeof check_current_turn === "function")
				check_current_turn();
		};

		this.add_user = function(event){
			var newName = event.object.first_name;
			if(newName === "Guest")
				newName += " " + event.object.last_name;

			this.users[event.setter] = {
				name: newName,
				score: 0,
				icon: event.object.icon_url
			};
		}

		this.get_users = function(){
			var users = [];
			for(var id in this.users)
				users.push(id);
			return users;
		};

		this.get_user = function(id){
			if(this.users[id])
				return this.users[id];
			return null;
		};

		this.get_user_data = function(id, key){
			if(this.users[id]){
				if(typeof this.users[id][key] !== "undefined")
					return this.users[id][key];
				return null;
			}return null;
		};

		this.set_user_data = function(id, key, data){
			if(this.users[id])
				this.users[id][key] = data;
		};

		this.id_to_name = function(id){
			var name = this.get_user_data(id, "name");
			if(name)
				return name;
			return "Someone (" + id + ")";
		};

		this.get_winners = function(){
			var winners = [];
			var highScore = 0;
			for(var i = 0; i < this.turnOrder.length; i++){
				var id = this.turnOrder[i];
				if(!this.get_user(id))
					continue;

				var score = this.get_user_data(id, "score");
				if(score === highScore)
					winners.push(this.get_user_data(id, "name"));
				else if(score > highScore){
					highScore = score;
					winners = [this.get_user_data(id, "name")];
				} 
			}
			return winners;
		};

		this.client = {
			connect: function(){
				game.channel.subscribe([{type: "event_queue", name: "imo.clients"},
				                        {type: "event_queue", name: "board"},
				                        {type: "event_queue", name: "settings"}], 0);
				game.channel.subscribe([{type: "random_permutation_event_queue",
				                         name: "board",
				                         length: game.gridRows * game.gridCols}], 0); // Hard-coded until this can be resized dynamically mid-game
				game.channel.subscribe([{type: "event_stream", name: "joins"}], 0);
				game.channel.event_stream("joins", {object: {}}); // Data is irrelevant
				if(typeof handlers.connected === "function")
					handlers.connected();
			},

			// event_streams don't replay history, so the first time this
			// triggers should indicate that we're caught up with reality.
			event_stream: function(name, event){
				game.caughtUp = true;
				game.channel.unsubscribe([{type: "event_stream", name: "joins"}]);
				if(typeof handlers.init === "function")
					handlers.init();
			},

			event_queue: function(name, event){
				if(debug === true)
					console.log(name, event);
				if(name === "imo.clients" && event.object.action === "join"){
					// The server will always check in with the token for "Test One"
					// This does NOT mean "Test One" is guranteed to be the server,
					// only that it's not a normal client.
					if(event.object.first_name !== "Test" && event.object.first_name !== "One"){
						if(!game.get_user(event.setter))
							game.add_user(event);

						if($.inArray(event.setter, game.turnOrder) === -1)
							game.turnOrder.push(event.setter);

						if(typeof handlers.user_join === "function")
							handlers.user_join(event.setter);
					}
		/*		}else if(name === "settings" && event.object.settings){
					// TODO: Move UI logic outside this script before uncommenting
					if(!inGame == 0){
						if(event.object.settings.gridSize){
							var rows = parseInt(event.object.settings.gridSize.rows);
							var cols = parseInt(event.object.settings.gridSize.cols);
							if(rows && cols && (rows * cols) % 2 === 0 && rows > 0 && cols > 0){
								gridRows = rows;
								gridCols = cols;
								$rows.val(rows);
								$cols.val(cols);
								init_board();
							}else
								console.log(id_to_name(event.setter) + " tried to change the grid size, but they passed invalid data!");
							if(sizeInterval === -1)
								sizeInterval = setInterval(update_size, 100);
						}
					}else
						console.log(id_to_name(event.setter) + " tried to change some settings, but you were in a game!");*/
				}else if(name === "board" && event.object.board){
					if(!game.inGame){
		//					game.channel.subscribe([{type: "random_permutation_event_queue",
		//					                    name: "board",
		//					                    length: event.object.board.length}], 0);
						game.board = event.object.board;
						game.matches = new Array(event.object.board.length);
						game.currentTurn = -1;
						if(typeof handlers.load_board === "function")
							handlers.load_board(event.object.board);
						game.next_turn();
					}else if(typeof handlers.complain === "function")
						handlers.complain(false, game.id_to_name(event.setter) + " tried to start a game, but you were still playing!");
				}
			},
	
			random_permutation_event_queue: function(name, event){
				if(name === "board"){
					if(debug === true)
						console.log(event.setter, event.indices, event.action, event.results);
					if(event.action === "reshuffle"){
						if(typeof handlers.complain === "function")
							handlers.complain(false, game.id_to_name(event.setter) + " shuffled the deck.");
					}else if(event.action === "query"){
						if(event.setter === game.turnOrder[game.currentTurn]){
							if(event.results && event.results.length === 2){
								var pair = event.results;
								if(non_integer(pair[0]) || non_integer(pair[1])
								|| game.board[pair[0]] === undefined
								|| game.board[pair[0]] === undefined){
									if(typeof handlers.complain === "function")
										handlers.complain(false, game.id_to_name(event.setter) + " sent an invalid pair!");
									console.log(pair);
									return;
								}

								var isMatch = game.board[pair[0]].id === game.board[pair[1]].id;
								if(typeof handlers.select_pair === "function")
									handlers.select_pair(event.setter, event.indices, pair, isMatch);

								if(isMatch){
									game.matches[event.indices[0]] = pair[0];
									game.matches[event.indices[1]] = pair[1];

									var score = game.get_user_data(event.setter, "score");
									game.set_user_data(event.setter, "score", score + 1);
								}

								var isOver = true;
								for(var i = 0; i < game.board.length; i++){
									if(game.matches[i] === undefined){
										isOver = false;
										break;
									}
								}

								if(isOver){
									if(typeof handlers.game_over === "function")
										handlers.game_over();
								}else{
									// If they got a match, give them another turn
									// A little hackish, but gets the job done
									if(isMatch)
										game.currentTurn--;
									game.next_turn();
								}
							}else if(typeof handlers.complain === "function")
								handlers.complain(true, game.id_to_name(event.setter) + " looked at too many cards!"); // This will also trigger if they only looked at 1, but that's not really a huge problem.
						}else if(typeof handlers.complain === "function")
							handlers.complain(true, game.id_to_name(event.setter) + " looked at some cards, but it was " + game.id_to_name(game.turnOrder[game.currentTurn]) + "'s turn!");
					}else if(debug === true)
						console.log(game.id_to_name(event.setter), event);
				}
			}
		};

		this.init = function(){
			if(ch_id){
				if(token)
					this.channel = new IMO.Channel(this.client, ch_id, token);
				else
					this.channel = new IMO.Channel(this.client, ch_id);
			}else
				this.channel = new IMO.Channel(this.client);
		}
	};
})();

if(typeof module !== "undefined")
	module.exports = Matchimo;
