window.cssFinalize = false; // Related to css3finalize jQuery plugin

var channel, myUserList, mySelectionDisabler;
var container, game, table, userList, startButton;
var $msg, $settings, $lastMatch, $settings;

var caughtUp = false;

var gridRows = 4;
var gridCols = 4;

var board = [];
var matches = [];
var selected = [];
var turnOrder = [];
var boardCache = [];
var currentTurn = -1;
var currentCard = -1;
var titleInterval = -1;
var currentProfile = -1;

function init_board(){
	table.innerHTML = "";
	for(var i = 0; i < gridRows; i++){
		var tr = document.createElement('tr');
		for(var j = 0; j < gridCols; j++){
			var td = document.createElement('td');
			var div = document.createElement('div');
			div.className = "profile hidden disabled";

			// Assign each element a name starting at 0
			var n = (gridCols * i) + j;
			div.setAttribute("name", n);
			td.appendChild(div);
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}

	recalc_layout();

	mySelectionDisabler.recursively_disable_selection(game, []);;
	$("#board .profile").click(function(e){
		card_click(e);
	});
}

function create_board(){
	var chosen = [];
	while(chosen.length < (gridRows * gridCols) / 2){
		for(var i = 0; i < people.length; i++)
			chosen.push(i);
	}
	chosen = shuffle(chosen).slice(0, (gridRows * gridCols) / 2);

	var order = [];
	for(var i = 0; i < chosen.length; i++){
		order.push({id: chosen[i], opts: {"name": true}});
		order.push({id: chosen[i], opts: {"photo": true}});
	}

	return shuffle(order);
}

function load_board(order){
	board = order;
	boardCache = board;
	matches = [];
	selected = [];
	currentTurn = -1;
	currentCard = -1;
	$lastMatch.fadeOut();
	$settings.fadeOut();
	for(var i = 0; i < board.length; i++)
		hide_profile(document.getElementsByClassName('profile')[i]);
	next_turn();
}

function recalc_layout(){
	var width = $(window).width();
	var minWidth = $(table).width() + 310;
	$container.width(minWidth);
	
	if(width > minWidth + 300)
		$container.css("padding-left", "300px");
	else
		$container.css("padding-left", "0px");
}

function start_game(){
	var order = create_board();
	channel.event_queue("board", {"object": {"board": order}});
}

// http://stackoverflow.com/a/3886106/802335
function non_integer(n){
	return typeof n !== 'number' || n % 1 !== 0;
}

function hide_match(e){
	var i = e.currentTarget.getAttribute('name');
	if(!i || !boardCache[i]) return;
	var id = boardCache[i].id;
	if(id !== currentProfile){
		currentProfile = id;
		$lastMatch.fadeOut(reshow_match);
	}
}

function reshow_match(){
	var opts = {photo: true, name: true, position: true, bio: true};
	render_profile(currentProfile, opts, $lastMatch, false);
	$lastMatch.fadeIn();
}

function deselect_card(i, el){
	var index = $.inArray(i, selected);
	if(index !== -1)
		selected.splice(index, 1);
	$(el).removeClass("selected");
}

function card_click(e){
	if(!(currentTurn !== -1 && turnOrder[currentTurn] === channel.get_public_client_id()))
		return;
	var i = parseInt(e.target.getAttribute("name"));
	if(non_integer(i))
		i = parseInt(e.target.parentElement.getAttribute("name"));
	if(non_integer(i)){
		console.log("Couldn't figure out which card element corresponds to");
		console.log(e);
	}

	if($.inArray(i, matches) !== -1)
		return;
	if(currentCard !== -1){
		if(i !== currentCard){
			var pair = [currentCard, i];
			currentCard = -1;
			selected.push(i);
			$(e.target).addClass("selected");
			channel.event_queue("moves", {"object": {"pair": pair}});
		}else{
			currentCard = -1;
			deselect_card(i, e.target);
		}
	}else{
		currentCard = i;
		selected.push(i);
		$(e.target).addClass("selected");
	}
}

function next_turn(){
	currentTurn++;
	if(currentTurn >= turnOrder.length)
		currentTurn = 0;
	update_users();

	// Is it our turn now?
	if(turnOrder[currentTurn] === channel.get_public_client_id()){
		$("table .profile.hidden").removeClass("disabled");
		$msg.text("It's your turn!");

		clear_title();
		titleInterval = setInterval(flash_title, 1000);
	}else{
		$("table .profile.hidden").addClass("disabled");
		$msg.text(id_to_name(turnOrder[currentTurn]) + " is making their move.");

		clear_title();
	}
}

function clear_title(){
	document.title = "Matchimo";
	if(titleInterval !== -1)
		clearInterval(titleInterval);
}

function flash_title(){
	if(document.title === "Matchimo")
		document.title = "!!! Your turn !!!";
	else
		document.title = "Matchimo";
}

function allow_game_start(text){
	// Don't do anything if there's a game in progress
	if(board.length !== 0)
		return;
	if(!text)
		text = "Start Game";
	startButton.disabled = false;
	startButton.value = text;
	startButton.onclick = start_game;
}

function game_over(){
	currentTurn = -1;
	clear_title();
	update_users();
	$("table .profile").addClass("disabled");
	var winners = get_winners();
	if(winners.length === 1)
		$msg.text(winners[0] + " wins!");
	else if(winners.length === 2)
		$msg.text(winners[0] + " and " + winners[1] + " tied for first!");
	else{
		var lastWinner = winners.pop();
		winners[winners.length - 1] += ", and " + lastWinner;
		$msg.text(winners.join(', ') + " tied for first!");
	}
	if(caughtUp)
		$settings.fadeIn();
	else
		$settings.show();
	board = [];
	allow_game_start("Play Again");
}

function get_winners(){
	var winners = [];
	var highScore = 0;
	for(var i = 0; i < turnOrder.length; i++){
		var id = turnOrder[i];
		if(!myUserList.users[id])
			continue;

		var score = myUserList.get_data(id, "score");
		if(score === highScore)
			winners.push(myUserList.get_data(id, "name"));
		else if(score > highScore){
			highScore = score;
			winners = [myUserList.get_data(id, "name")];
		} 
	}
	return winners;
}

function id_to_name(id){
	var name = myUserList.get_data(id, "name")
	if(name)
		return name;
	return "Someone (" + id + ")";
}

// Call this function any time a user's information changes
function update_users(){
	userList.style.display = "none";
	userList.innerHTML = "";
	var tr = document.createElement("tr");
	var th = document.createElement("th");
	tr.appendChild(th);
	th = document.createElement("th");
	th.innerHTML = "Matches";
	tr.appendChild(th);
	userList.appendChild(tr);

	for(var i = 0; i < turnOrder.length; i++){
		var id = turnOrder[i];
		if(!myUserList.users[id])
			continue;

		tr = document.createElement("tr");

		var name_td = document.createElement("td");
		name_td.className = "name";
		$(name_td).text(myUserList.get_data(id, "name"));
		var img = myUserList.users[id].icon_url;
		var color = "255,255,255";
		if(currentTurn === i){
			tr.className = "current";
			color = "255,153,0";
		}else if(id === channel.get_public_client_id()){
			tr.className = "me";
			color = "181,211,255";
		}
		var gradient = "linear-gradient(to right, rgba(" + color + ",0) 0%,rgba(" + color + ",1) 100%)";
		$(name_td).css("background", gradient + " repeat-y, url(" + img + ") no-repeat");
		tr.appendChild(name_td);

		var score_td = document.createElement("td");
		$(score_td).text(myUserList.get_data(id, "score"));
		tr.appendChild(score_td);

		userList.appendChild(tr);
	}
	userList.style.display = "table";
}

// Called as soon as the page is loaded and all past events have been replayed
function init(){
	if(board.length === 0)
		$settings.fadeIn();
}

// http://stackoverflow.com/a/6274381/802335
function shuffle(o){
	for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
}

function connect(){
	var client = {
		connect: function(){
			init_board();
			$msg.text("Connected.");
			channel.subscribe([{type: "event_queue", name: "imo.clients"},
			                   {type: "event_queue", name: "board"},
			                   {type: "event_queue", name: "moves"},
			                   {type: "event_queue", name: "settings"}], 0);
			channel.subscribe([{type: "event_stream", name: "joins"}], 0);
			channel.event_stream("joins", {"object": {}}); // Data is irrelevant
			myUserList = new IMO.UserList({
				"public_client_id": channel.get_public_client_id()
			});
		},

		// event_streams don't replay history, so the first time this triggers
		// should indicate that we're caught up with real time.
		event_stream: function(name, event){
			caughtUp = true;
			channel.unsubscribe([{type: "event_stream", name: "joins"}]);
			init();
		},

		event_queue: function(name, event){
			console.log(name, event);
			if(name === "imo.clients" && event.object.action === "join"){
				if(!myUserList.users[event.setter])
					myUserList.add_user(event);

				if($.inArray(event.setter, turnOrder) === -1)
					turnOrder.push(event.setter);

				// This seems to be a minor glitch in the API; Calling
				// myUserList.get_data when no data was ever set throws an error
				if(!myUserList.users[event.setter].data)
					myUserList.users[event.setter].data = {};

				if(!myUserList.get_data(event.setter, "name")){
					var newName = event.object.first_name;
					if(newName === "Guest")
						newName += " " + event.object.last_name;

					myUserList.set_data(event.setter, "name", newName);
				}

				if(!myUserList.get_data(event.setter, "score"))
					myUserList.set_data(event.setter, "score", 0);

				if(turnOrder.length > 1){
					// We have at least 2 users, let's do things!
					allow_game_start();
				}

				$msg.text(id_to_name(event.setter) + " has joined");
				update_users();
            }else if(name === "settings" && event.object.settings){
				if(board.length == 0){
					if(event.object.settings.gridSize){
						var rows = event.object.settings.gridSize.rows;
						var cols = event.object.settings.gridSize.cols;
						if(rows && cols && (rows * cols) % 2 === 0){
							gridRows = rows;
							gridCols = cols;
							init_board();
						}else
							console.log(id_to_name(event.setter) + " tried to change the grid size, but they passed invalid data!");
					}
				}else
					console.log(id_to_name(event.setter) + " tried to change some settings, but you were in a game!");
			}else if(name === "board" && event.object.board){
				if(board.length == 0){
					startButton.disabled = true;
					load_board(event.object.board);
				}else
					console.log(id_to_name(event.setter) + " tried to start a game, but you were still playing!");
			}else if(name === "moves" && event.object.pair){
				if(event.setter === turnOrder[currentTurn]){
					if(event.setter === channel.get_public_client_id()){
						// It's no longer our turn, so disallow user input
					}

					var pair = event.object.pair;
					if(non_integer(pair[0]) || non_integer(pair[1])
					|| board[pair[0]] === undefined
					|| board[pair[0]] === undefined){
						console.log("Invalid pair sent by " + id_to_name(event.setter));
						console.log(pair);
						return;
					}

					var card1 = document.getElementsByClassName('profile')[pair[0]];
					var card2 = document.getElementsByClassName('profile')[pair[1]];
					render_profile(board[pair[0]].id, board[pair[0]].opts, card1);
					render_profile(board[pair[1]].id, board[pair[1]].opts, card2);

					deselect_card(pair[0], card1);
					deselect_card(pair[1], card2);

					if(board[pair[0]].id === board[pair[1]].id){
						matches = matches.concat(pair);
						var score = myUserList.get_data(event.setter, "score");
						myUserList.set_data(event.setter, "score", score + 1);

						$(card1).addClass('disabled').mouseover(hide_match);
						$(card2).addClass('disabled').mouseover(hide_match);

						var id = board[pair[0]].id;
						var show_profile = (function(){
							currentProfile = id;
							var opts = {photo: true, name: true, position: true, bio: true};
							render_profile(id, opts, $lastMatch, false);
							if(caughtUp)
								$lastMatch.fadeIn();
							else
								$lastMatch.show();
						});
						if(caughtUp)
							$lastMatch.fadeOut(show_profile);
						else
							show_profile();

						if(matches.length === board.length)
							game_over();

						// If they got a match, give them another turn
						// A little hackish, but gets the job done
						currentTurn--;
						next_turn();
					}else{
						if(caughtUp)
							$lastMatch.fadeOut();
						else
							$lastMatch.hide();
						next_turn();

						var flip_back = (function(){
							// Check to make sure a card hasn't been matched and isn't selected
							var disabled = turnOrder[currentTurn] !== channel.get_public_client_id();
							if($.inArray(pair[0], matches) === -1 && $.inArray(pair[0], selected) === -1){
								hide_profile(card1, disabled);
								deselect_card(pair[0], card1);
							}if($.inArray(pair[1], matches) === -1 && $.inArray(pair[1], selected) === -1){
								hide_profile(card2, disabled);
								deselect_card(pair[1], card1);
							}
						});
						if(caughtUp)
							setTimeout(flip_back, 3000);
						else
							flip_back();
					}
				}else
					console.log(id_to_name(event.setter) + " tried to make a move, but it wasn't their turn!");
			}
		}
	};
	return new IMO.Channel(client);
};

window.onload = function(){
	game = document.getElementById('game');
	table = document.getElementById('board');
	userList = document.getElementById('userList');
	startButton = document.getElementById('start');
	

	$msg = $('#msg');
	$container = $('#container');
	$lastMatch = $('#lastMatch');
	$settings = $('#settings');

	mySelectionDisabler = new IMO.SelectionDisabler();
	$(window).resize(recalc_layout);

	channel = connect();
	$msg.text("Connecting...");
};
