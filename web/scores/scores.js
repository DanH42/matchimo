$(function(){
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
