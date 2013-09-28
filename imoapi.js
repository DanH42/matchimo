var channel;
var userName;
var msg, game, nameForm, nameInput, nameButton, userList;
var scoreForm, scoreInput, scoreButton;

// Map user IDs (setters) to names and other data
var users = {};
// Array of user IDs to indicate turn order
var turn_order = [];

function on_submit_name(){
	// Check if any name has been entered
	if($.trim(nameInput.value) !== ""){
		nameInput.disabled = nameButton.disabled = true;
		// Send a message announcing the user's arrival to all users
		channel.event_queue("users", {"object": {"name": nameInput.value}});
		on_join(nameInput.value);
	}
	return false;
}

function on_join(name){
	// Store the user's name for later
	userName = name;
	// Yes, eew for many reasons.
	game.innerHTML = '<form id="score_form">Add Score: <input type=text id="score_input" /><input type="submit" id="score_button" value="Add" /></form>';
	scoreForm = document.getElementById("score_form");
	scoreInput = document.getElementById("score_input");
	scoreButton = document.getElementById("score_button");
	$(scoreForm).submit(on_submit_score);
}

////////////////////////////////////////////////////////////////////////////////

function on_submit_score(){
	var points = parseInt(scoreInput.value);
	// Check if any score has been entered
	if(points !== NaN){
		scoreInput.value = "";
		channel.event_queue("scores", {"object": {"points": points}});
	}
	return false;
}

////////////////////////////////////////////////////////////////////////////////

// Call this function any time a user's information changes
function update_users(){
	userList.style.display = "none";
	userList.innerHTML = "<tr><th></th><th>Score</th></tr>";
	for(var i in turn_order){
		var user = users[turn_order[i]];
		if(!user) continue;

		var tr = document.createElement("tr");
		if(turn_order[i] === channel.get_public_client_id())
			tr.className = "me";

		var name_td = document.createElement("td");
		name_td.className = "name";
		$(name_td).text(user.name);
		tr.appendChild(name_td);

		var score_td = document.createElement("td");
		$(score_td).text(user.score);
		tr.appendChild(score_td);

		userList.appendChild(tr);
	}
	userList.style.display = "block";
}

function connect(){
	var client = {
		connect: function(){
			// Enable name entry
			nameInput.disabled = nameButton.disabled = false;
			nameInput.focus();
			msg.innerHTML = "Please choose a name.";

			// Subscribe to event queues to receive all past and future messages
			channel.subscribe([{type: "event_queue", name: "users"}], 0);
			channel.subscribe([{type: "event_queue", name: "moves"}], 0);
			channel.subscribe([{type: "event_queue", name: "scores"}], 0);
		},

		event_queue: function(name, event){
			console.log([name, event.object]);
			if((name == "users") && (event.object.name)){
				if(!users[event.setter]){
					turn_order.push(event.setter);
					// Create a default "player file"
					users[event.setter] = {
						name: event.object.name,
						score: 0
					};
				}else
					users[event.setter].name = event.object.name;

				if(event.setter === channel.get_public_client_id())
					on_join(event.object.name);

				if(turn_order.length > 1){
					// We have at least 2 users, let's do things!
					msg.innerHTML = event.object.name + " has joined";
					// TODO: Things.
				}else
					msg.innerHTML = "Waiting for another user...";
				update_users();
			}else if((name == "moves") && (event.object.move)){
				//
			}else if((name == "scores") && (event.object.points)){
				users[event.setter].score += event.object.points;
				var playerName = "Someone";
				if(users[event.setter])
					playerName = users[event.setter].name;
				msg.innerHTML = playerName + " earned " + event.object.points + " points!";
				update_users();
			}
		}
	};
	return new IMO.Channel(client);
};

window.onload = function(){
	nameForm = document.getElementById("name_form");
	nameInput = document.getElementById("name_input");
	nameButton = document.getElementById("name_button");
	$(nameForm).submit(on_submit_name);

	msg = document.getElementById('msg');
	game = document.getElementById('game');
	userList = document.getElementById('userList');

	channel = connect();
	msg.innerHTML = "Connecting...";
};
