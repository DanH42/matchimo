var $login, $logout, $name;

navigator.id.watch({
	onlogin: function(assertion){
		$.ajax({
			type: "POST",
			url: "http://scores.matchimo.xd6.co/persona/verify",
			crossDomain: true,
			data: {assertion: assertion},
			success: function(data){
				if(data && data.status === "okay"){
					$login.hide();
					$logout.show();
					$name.text(data.email);
				}
			}
		});
	},
	onlogout: function(){
		$.ajax({
			type: "POST",
			url: "http://scores.matchimo.xd6.co/persona/logout",
			crossDomain: true,
			data: "",
			success: function(){
				$name.text("");
				$logout.hide();
				$login.show();
			}
		});
	}
});

$(function(){
	$login = $("#login");
	$logout = $("#logout");
	$name = $("#name");

	$login.click(function(){
		navigator.id.request();
	});
	$logout.click(function(){
		navigator.id.logout();
	});

	var sortedScores = [];
	for(var email in scores)
		sortedScores.push(email);
	sortedScores.sort(function(a, b){
		if(scores[a] < scores[b])
			return 1;
		if(scores[a] > scores[b])
			return -1;
		return 0;
	});

	var table = document.getElementById("scores");
	for(var i = 0; i < sortedScores.length; i++){
		var email = sortedScores[i];
		var tr = document.createElement("tr");
		var td = document.createElement("td");
		$(td).text(email);
		td.className = "email";
		tr.appendChild(td);
		td = document.createElement("td");
		$(td).text(scores[email]);
		td.className = "score";
		tr.appendChild(td);
		table.appendChild(tr);
	}
});
