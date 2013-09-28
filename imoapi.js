var channel;
var userName;
var msg, game;

// Map user IDs (setters) to names
var users = {};
// Array of user IDs to indicate turn order
var turn_order = [];

function join_game(){
	// Subscribe to event queues to receive all past and future messages
	channel.subscribe([{type: "event_queue", name: "users"}], 0);
	channel.subscribe([{type: "event_queue", name: "moves"}], 0);

	// Autogenerate a name for now
	userName = "User " + (Math.random() + '').substr(-4);
	// Send a message announcing the user's arrival to all users
	channel.event_queue("users", {"object": {"name": userName}});
};

function connect(){
	var client = {
		connect: function(){
			console.log("Connected");
			join_game();
		},

		event_queue: function(name, event){
			if((name == "users") && (event.object.name)){
				console.log("Join: " + event.object.name);
				users[event.setter] = event.object.name;
				turn_order.push(event.setter);
				if(turn_order.length > 1){
					// We have at least 2 users, let's do things!
					msg.innerHTML = event.object.name + " has joined";
					//
				}
			}else if((name == "moves") && (event.object.move)){
				//
			}
		}
	};
	return new IMO.Channel(client);
};

window.onload = function(){
	msg = document.getElementById('msg');
	game = document.getElementById('game');

	channel = connect();
	msg.innerHTML = "Waiting for partners...";
};
