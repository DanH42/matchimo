window.cssFinalize = false; // Related to css3finalize jQuery plugin

var game, mySelectionDisabler;
var container, gameBoard, table, userList, startButton;
var $msg, $settings, $lastMatch/*, $settings, $rows, $cols*/;

var selected = [];
var handlers = {};

var currentCard = -1;
var sizeInterval = -1;
var titleInterval = -1;
var currentProfile = -1;

function init_board(){
	table.innerHTML = "";
	for(var i = 0; i < game.gridRows; i++){
		var tr = document.createElement('tr');
		for(var j = 0; j < game.gridCols; j++){
			var td = document.createElement('td');
			var div = document.createElement('div');
			div.className = "profile hidden disabled";

			// Assign each element a name starting at 0
			var n = (game.gridCols * i) + j;
			div.setAttribute("name", n);
			td.appendChild(div);
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}

	recalc_layout();

	mySelectionDisabler.recursively_disable_selection(gameBoard, []);;
	$("#board .profile").click(function(e){
		card_click(e);
	});
}

function create_board(){
	var chosen = [];
	while(chosen.length < (game.gridRows * game.gridCols) / 2){
		for(var i = 0; i < people.length; i++)
			chosen.push(i);
	}
	chosen = shuffle(chosen).slice(0, (game.gridRows * game.gridCols) / 2);

	var order = [];
	for(var i = 0; i < chosen.length; i++){
		order.push({id: chosen[i], opts: {"name": true}});
		order.push({id: chosen[i], opts: {"photo": true}});
	}

	game.channel.random_permutation_event_queue("board", {action: "reshuffle"});
	return order;
}

handlers.load_board = function(order){
	startButton.disabled = game.inGame = true;
	selected = [];
	currentCard = -1;
	$lastMatch.fadeOut();
	$settings.fadeOut();
	for(var i = 0; i < game.board.length; i++)
		hide_profile(document.getElementsByClassName('profile')[i]);
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
	game.channel.event_queue("board", {object: {board: order}});
}

handlers.complain = function(cheated, msg){
	$msg.text(msg);
	console.log(msg);
}

function hide_match(e){
	var i = e.currentTarget.getAttribute('name');
	if(!i || !game.matches[i] || !game.board[game.matches[i]]) return;
	var id = game.board[game.matches[i]].id;
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
	if(!(game.currentTurn !== -1 && game.turnOrder[game.currentTurn] === game.channel.get_public_client_id()))
		return;
	var i = parseInt(e.target.getAttribute("name"));
	var target = e.target;
	if(non_integer(i)){
		i = parseInt(e.target.parentElement.getAttribute("name"));
		target = e.target.parentElement;
	}if(non_integer(i)){
		console.log("Couldn't figure out which card element corresponds to");
		console.log(e);
	}

	if(game.matches[i] !== undefined)
		return;
	if(currentCard !== -1){
		if(i !== currentCard){
			var pair = [currentCard, i];
			currentCard = -1;
			selected.push(i);
			$(e.target).addClass("selected");
			game.channel.random_permutation_event_queue("board", {action: "query", indices: pair});
		}else{
			currentCard = -1;
			deselect_card(i, target);
		}
	}else{
		currentCard = i;
		selected.push(i);
		$(target).addClass("selected");
	}
}

// http://stackoverflow.com/a/3886106/802335
function non_integer(n){
	return typeof n !== 'number' || n % 1 !== 0;
}

function check_current_turn(){
	update_users();

	if(game.turnOrder[game.currentTurn] === game.channel.get_public_client_id()){
		$("table .profile.hidden").removeClass("disabled");
		$msg.text("It's your turn!");

		clear_title();
		titleInterval = setInterval(flash_title, 1000);
	}else{
		$("table .profile.hidden").addClass("disabled");
		$msg.text(game.id_to_name(game.turnOrder[game.currentTurn]) + " is making their move.");

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
	if(game.inGame)
		return;
	if(!text)
		text = "Start Game";
	startButton.disabled = false;
	startButton.value = text;
	startButton.onclick = start_game;
}

handlers.user_join = function(id){
	if(game.turnOrder.length > 1){
		// We have at least 2 users, let's do things!
		allow_game_start();
	}

	$msg.text(game.id_to_name(id) + " has joined");
	update_users();
}

handlers.select_pair = function(id, indices, pair, isMatch){
	var card1 = document.getElementsByClassName('profile')[indices[0]];
	var card2 = document.getElementsByClassName('profile')[indices[1]];
	render_profile(game.board[pair[0]].id, game.board[pair[0]].opts, card1);
	render_profile(game.board[pair[1]].id, game.board[pair[1]].opts, card2);

	deselect_card(indices[0], card1);
	deselect_card(indices[1], card2);

	if(isMatch){
		$(card1).addClass('disabled').mouseover(hide_match);
		$(card2).addClass('disabled').mouseover(hide_match);

		var id = game.board[pair[0]].id;
		var show_profile = (function(){
			currentProfile = id;
			var opts = {photo: true, name: true, position: true, bio: true};
			render_profile(id, opts, $lastMatch, false);
			if(game.caughtUp)
				$lastMatch.fadeIn();
			else
				$lastMatch.show();
		});
		if(game.caughtUp)
			$lastMatch.fadeOut(show_profile);
		else
			show_profile();
	}else{
		if(game.caughtUp)
			$lastMatch.fadeOut();
		else
			$lastMatch.hide();

		var flip_back = (function(){
			// Check to make sure a card hasn't been matched and isn't still selected
			var disabled = game.turnOrder[game.currentTurn] !== game.channel.get_public_client_id();
			if(game.matches[indices[0]] === undefined && $.inArray(indices[0], selected) === -1){
				hide_profile(card1, disabled);
				deselect_card(indices[0], card1);
			}if(game.matches[indices[1]] === undefined && $.inArray(indices[1], selected) === -1){
				hide_profile(card2, disabled);
				deselect_card(indices[1], card2);
			}
		});
		if(game.caughtUp)
			setTimeout(flip_back, 3000);
		else
			flip_back();
	}
}

handlers.game_over = function(){
	game.currentTurn = -1;
	clear_title();
	update_users();
	$("table .profile").addClass("disabled");
	var winners = game.get_winners();
	if(winners.length === 1)
		$msg.text(winners[0] + " wins!");
	else if(winners.length === 2)
		$msg.text(winners[0] + " and " + winners[1] + " tied for first!");
	else{
		var lastWinner = winners.pop();
		winners[winners.length - 1] += ", and " + lastWinner;
		$msg.text(winners.join(', ') + " tied for first!");
	}
	if(game.caughtUp)
		$settings.fadeIn();
	else
		$settings.show();
	game.inGame = false;
	allow_game_start("Play Again");
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

	for(var i = 0; i < game.turnOrder.length; i++){
		var id = game.turnOrder[i];
		if(!game.get_user(id))
			continue;

		tr = document.createElement("tr");

		var name_td = document.createElement("td");
		name_td.className = "name";
		$(name_td).text(game.get_user_data(id, "name"));
		var img = game.get_user_data(id, "icon");
		var color = "255,255,255";
		if(game.currentTurn === i){
			tr.className = "current";
			color = "255,153,0";
		}else if(id === game.channel.get_public_client_id()){
			tr.className = "me";
			color = "181,211,255";
		}
		var gradient = "linear-gradient(to right, rgba(" + color + ",0) 0%,rgba(" + color + ",1) 100%)";
		$(name_td).css("background", gradient + " repeat-y, url(" + img + ") no-repeat");
		tr.appendChild(name_td);

		var score_td = document.createElement("td");
		$(score_td).text(game.get_user_data(id, "score"));
		tr.appendChild(score_td);

		userList.appendChild(tr);
	}
	userList.style.display = "table";
}

/*function check_size(e, ui){
	var input = e.target.id;
	if(!input)
		input = e.target.parentElement.id;
	if(!input){
		console.log("Couldn't figure out which spinner element corresponds to");
		console.log(e);
		return;
	}

	var size = {rows: game.gridRows, cols: game.gridCols};
	var amount = (size[input] < ui.value) ? 1 : -1;
	size[input] += amount;
	while((size.rows * size.cols) % 2 !== 0){
		console.log(size.rows, size.cols, input, ui.value);
		size[input] += amount;
		// Why isn't this lots simpler? I have no idea...
		setTimeout(function(){
			$('#' + input).val(size[input]);
		}, 1);
	}
}

function update_size(){
	var gridSize = {
		rows: parseInt($rows.val()),
		cols: parseInt($cols.val())
	};
	if(gridSize.rows != game.gridRows || gridSize.cols != game.gridCols){
		console.log("Changed");
		if((gridSize.rows * gridSize.cols) % 2 === 0
		&& gridSize.rows > 0 && gridSize.cols > 0){
			channel.event_queue("settings", {object: {settings: {gridSize: gridSize}}});
			if(sizeInterval !== -1){
				clearInterval(sizeInterval);
				sizeInterval = -1;
			}
		}else{
			if(gridSize.rows != game.gridRows)
				$rows.val(game.gridRows).effect("highlight", {color: "red"});
			else
				$cols.val(game.gridCols).effect("highlight", {color: "red"});
		}
	}
}*/

handlers.connected = function(){
	init_board();
	$msg.text("Connected.");
}

handlers.init = function(){
	if(!game.inGame === 0)
		$settings.fadeIn();
}

// http://stackoverflow.com/a/6274381/802335
function shuffle(o){
	for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
}

window.onload = function(){
	gameBoard = document.getElementById('game');
	table = document.getElementById('board');
	userList = document.getElementById('userList');
	startButton = document.getElementById('start');

	$msg = $('#msg');
	$container = $('#container');
	$lastMatch = $('#lastMatch');
	$settings = $('#settings');
/*	$rows = $('#rows');
	$cols = $('#cols');

	$rows.val(game.gridRows).spinner({spin: check_size});
	$cols.val(game.gridCols).spinner({spin: check_size});
	// I hate using a timer, but no events fired reliably and cross-browser
	sizeInterval = setInterval(update_size, 100);*/

	mySelectionDisabler = new IMO.SelectionDisabler();
	$(window).resize(recalc_layout);

	game = new Matchimo(IMO, handlers);
	game.init();
	$msg.text("Connecting...");
};
