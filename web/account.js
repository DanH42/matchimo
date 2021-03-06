var $login, $logout, $name;
var email = null;

navigator.id.watch({
	onlogin: function(assertion){
		$.ajax({
			type: "POST",
			url: "https://scores.matchimo.xd6.co/persona/verify",
			crossDomain: true,
			xhrFields: {withCredentials: true},
			data: {assertion: assertion},
			success: function(data){
				if(data && data.status === "okay"){
					email = data.email;
					$login.hide();
					$logout.css("display", "block");
					$name.text(email).css("display", "block");
				}
			}
		});
	},
	onlogout: function(){
		$.ajax({
			type: "POST",
			url: "https://scores.matchimo.xd6.co/persona/logout",
			crossDomain: true,
			xhrFields: {withCredentials: true},
			data: "",
			success: function(){
				email = null;
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
});
