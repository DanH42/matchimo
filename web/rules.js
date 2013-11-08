/*
Functions that need to be implemented:
- user_join(Object event)
- load_board(Array order)
- complain(Boolean cheated, String msg)
- select_pair(String id, Array indices, Array pair, Boolean isMatch);
- game_over()

Optional functions:
- connected() -- Called once a connection is made to the API
- init() -- Called as soon as the page is loaded and all past events have been replayed

*/

var Matchimo = {};

(function(){
	function call_optional(func){
		if(typeof func === "function")
			func();
	}

	// http://stackoverflow.com/a/3886106/802335
	function non_integer(n){
		return typeof n !== 'number' || n % 1 !== 0;
	}

	function add_user(event){
		var newName = event.object.first_name;
		if(newName === "Guest")
			newName += " " + event.object.last_name;

		Matchimo.users[event.setter] = {
			name: newName,
			score: 0,
			icon: event.object.icon_url
		};
	}

	Matchimo = {
		inGame: false,
		caughtUp: false,

		gridRows: 4,
		gridCols: 4,

		board: [],
		matches: [],
		turnOrder: [],

		users: {},

		currentTurn: -1,

		next_turn: function(){
			Matchimo.currentTurn++;
			if(Matchimo.currentTurn >= Matchimo.turnOrder.length)
				Matchimo.currentTurn = 0;

			call_optional(check_current_turn);
		},

		get_user: function(id){
			if(this.users[id])
				return this.users[id];
			return null;
		},

		get_user_data: function(id, key){
			if(this.users[id]){
				if(typeof this.users[id][key] !== "undefined")
					return this.users[id][key];
				return null;
			}return null;
		},

		set_user_data: function(id, key, data){
			if(this.users[id])
				this.users[id][key] = data;
		},

		id_to_name: function(id){
			var name = this.get_user_data(id, "name");
			if(name)
				return name;
			return "Someone (" + id + ")";
		},

		client: {
			connect: function(){
				channel.subscribe([{type: "event_queue", name: "imo.clients"},
						           {type: "event_queue", name: "board"},
						           {type: "event_queue", name: "settings"}], 0);
				channel.subscribe([{type: "random_permutation_event_queue",
						            name: "board",
						            length: Matchimo.gridRows * Matchimo.gridCols}], 0); // Hard-coded until this can be resized dynamically mid-game
				channel.subscribe([{type: "event_stream", name: "joins"}], 0);
				channel.event_stream("joins", {object: {}}); // Data is irrelevant
				call_optional(connected);
			},

			// event_streams don't replay history, so the first time this triggers
			// should indicate that we're caught up with real time.
			event_stream: function(name, event){
				Matchimo.caughtUp = true;
				channel.unsubscribe([{type: "event_stream", name: "joins"}]);
				call_optional(init);
			},

			event_queue: function(name, event){
				console.log(name, event);
				if(name === "imo.clients" && event.object.action === "join"){
					if(!Matchimo.get_user(event.setter))
						add_user(event);

					if($.inArray(event.setter, Matchimo.turnOrder) === -1)
						Matchimo.turnOrder.push(event.setter);

					user_join(event.setter);
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
					if(!Matchimo.inGame){
		//					channel.subscribe([{type: "random_permutation_event_queue",
		//					                    name: "board",
		//					                    length: event.object.board.length}], 0);
						load_board(event.object.board);
					}else
						complain(false, Matchimo.id_to_name(event.setter) + " tried to start a game, but you were still playing!");
				}
			},
	
			random_permutation_event_queue: function(name, event){
				if(name === "board"){
					console.log(event.setter, event.indices, event.action, event.results);
					if(event.action === "reshuffle"){
						complain(false, Matchimo.id_to_name(event.setter) + " shuffled the deck.");
					}else if(event.action === "query"){
						if(event.setter === Matchimo.turnOrder[Matchimo.currentTurn]){
							if(event.results && event.results.length === 2){
								var pair = event.results;
								if(non_integer(pair[0]) || non_integer(pair[1])
								|| Matchimo.board[pair[0]] === undefined
								|| Matchimo.board[pair[0]] === undefined){
									complain(false, Matchimo.id_to_name(event.setter) + " sent an invalid pair!");
									console.log(pair);
									return;
								}

								var isMatch = Matchimo.board[pair[0]].id === Matchimo.board[pair[1]].id;
								select_pair(event.setter, event.indices, pair, isMatch);

								var isOver = true;
								for(var i = 0; i < Matchimo.board.length; i++){
									if(Matchimo.matches[i] === undefined){
										isOver = false;
										break;
									}
								}

								if(isOver){
									game_over();
								}else{
									// If they got a match, give them another turn
									// A little hackish, but gets the job done
									if(isMatch)
										Matchimo.currentTurn--;
									Matchimo.next_turn();
								}
							}else
								complain(true, Matchimo.id_to_name(event.setter) + " looked at too many cards!"); // This will also trigger if they only looked at 1, but that's not really a huge problem.
						}else
							complain(true, Matchimo.id_to_name(event.setter) + " looked at some cards, but it wasn't their turn!");
					}else
						console.log(Matchimo.id_to_name(event.setter), event);
				}
			}
		}
	};
})();

if(typeof module !== "undefined")
	module.exports = Matchimo;
