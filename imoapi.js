window.cssFinalize = false;

var channel, myUserList, mySelectionDisabler;
var msg, game, userList, startButton;

// Make this dynamic later, maybe?
var gridSize = 4;
var board = [];

function create_board(){
	var selected = [];
	for(var i = 0; i < people.length; i++)
		selected.push(i);
	selected = shuffle(selected).slice(0, 8);

	var order = [];
	for(var i = 0; i < selected.length; i++){
		order.push({i: selected[i], type: "name"});
		order.push({i: selected[i], type: "photo"});
	}

	return shuffle(order);
}

function load_board(order){
	board = order;
	for(var i = 0; i < board.length; i++){
		var opts = {};
		opts[board[i].type] = true;
		render_profile(board[i].i, opts, document.getElementsByClassName('profile')[i]);
	}
}

function startGame(){
	var order = create_board();
	channel.event_queue("board", {"object": {"board": order}});
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
	userList.innerHTML = "<tr><th></th><th>Score</th></tr>";
	for(var id in myUserList.users){
		var tr = document.createElement("tr");

		var name_td = document.createElement("td");
		name_td.className = "name";
		$(name_td).text(myUserList.get_data(id, "name"));
		var img = myUserList.users[id].icon_url;
		var color = "255,255,255";
		if(id === channel.get_public_client_id()){
			tr.className = "me";
			color = "181,211,255";
		}
		$(name_td).css("background", "linear-gradient(to right, rgba(" + color + ",0) 0%,rgba(" + color + ",1) 100%) repeat-y, url(" + img + ") no-repeat");
		tr.appendChild(name_td);

		var score_td = document.createElement("td");
		$(score_td).text(myUserList.get_data(id, "score"));
		tr.appendChild(score_td);

		userList.appendChild(tr);
	}
	userList.style.display = "block";
}

// http://stackoverflow.com/a/6274381/802335
function shuffle(o){
	for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
}

function connect(){
	var client = {
		connect: function(){
			msg.innerHTML = "Connected.";
			channel.subscribe([{type: "event_queue", name: "imo.clients"}], 0);
			channel.subscribe([{type: "event_queue", name: "board"}], 0);
			channel.subscribe([{type: "event_queue", name: "moves"}], 0);
			myUserList = new IMO.UserList({
				"title": "Players",
				"public_client_id": channel.get_public_client_id(),
				"device": "web",
				"list_style": "column"
			});
		},

		event_queue: function(name, event){
			console.log([name, event.object]);
			if(name === "imo.clients" && event.object.action === "join"){
				if(!myUserList.users[event.setter]){
					myUserList.add_user(event);
					var newName = event.object.first_name;
					if(newName === "Guest")
						newName += " " + event.object.last_name;

					// Create a default "player file"
					myUserList.set_data(event.setter, "name", newName);
					myUserList.set_data(event.setter, "score", 0);
				}

				if(event.setter !== channel.get_public_client_id()){
					// We have at least 2 users, let's do things!
					startButton.disabled = false;
					startButton.value = "Start Game";
					startButton.onclick = startGame;

					msg.innerHTML = myUserList.get_data(event.setter, "name") + " has joined";
				}

				update_users();
            }else if(name === "board" && event.object.board){
				if(board.length == 0){
					startButton.disabled = true;
					load_board(event.object.board);
				}else
					console.log(id_to_name(event.setter) + " tried to start a game, but you were still playing!");
			}else if(name === "moves" && event.object.move){
				// Moves go here
			}
		}
	};
	return new IMO.Channel(client);
};

window.onload = function(){
	msg = document.getElementById('msg');
	game = document.getElementById('game');
	userList = document.getElementById('userList');
	startButton = document.getElementById('start');
	mySelectionDisabler = new IMO.SelectionDisabler();
	mySelectionDisabler.recursively_disable_selection(game, []);
	$(".profile").click(function(){
		$(this).toggleClass("selected");
	});

	channel = connect();
	msg.innerHTML = "Connecting...";
};
