var $login, $logout, $name;

navigator.id.watch({
	onlogin: function(assertion){
		$.ajax({
			type: "POST",
			url: "http://scores.matchimo.xd6.co/persona/verify",
			crossDomain: true,
			xhrFields: {withCredentials: true},
			data: {assertion: assertion},
			success: function(data){
				if(data && data.status === "okay"){
					$login.hide();
					$logout.css("display", "block");
					$name.text(data.email).css("display", "block");
				}
			}
		});
	},
	onlogout: function(){
		$.ajax({
			type: "POST",
			url: "http://scores.matchimo.xd6.co/persona/logout",
			crossDomain: true,
			xhrFields: {withCredentials: true},
			data: "",
			success: function(){
				$name.text("").hide();
				$logout.hide();
				$login.css("display", "block");
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
		var row = document.createElement("div");
		row.className = "row";
		var col = document.createElement("div");
		col.className = "col-md-10";
		$(col).text(email);
		row.appendChild(col);
		col = document.createElement("col");
		col.className = "col-md-2 text-right";
		$(col).text(scores[email]);
		row.appendChild(col);
		table.appendChild(row);
	}
});
