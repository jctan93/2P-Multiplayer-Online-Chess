$(document).ready(function(){
	
	var usersOnline = [];
	var one = 1;
	
	//Checks if the user belongs on the page
	 if(getCookie("login_cookie"))
	 {
		 console.log("Cookie exists? ".concat(getCookie("login_cookie")));
	 }
	 else
	 {
		 console.log("Cookie doesn't exist");
		 window.location="/login";
	 }

	//console.log("READY!");
	  var socket = io();
	  
	//Creates Socket Room to communicate with the server
	console.log("User logged in now is: " + getCookie("login_cookie").split(":")[0])
	//var current_user = getCookie("login_cookie").split(":")[0];
	var current_user;
	
	console.log("Joining room: " + getCookie("login_cookie"))
	socket.emit('join', {ID: getCookie("login_cookie")});
	
	console.log("Requesting login cookie info");
	socket.emit('get login cookie', getCookie("login_cookie"));
	
	var join_attempt;
	  
	$(document).on('click', "#new-game", function(){
		//var game_details = current_user + ":" + "Waiting for P2:" + getCookie("login_cookie");
		//console.log(game_details);
		socket.emit('create game', getCookie("login_cookie"));
	});
	
	$(document).on('click', "#new-game-button", function(){
		$("#new-game-button").css("background", "#333333");
		$("#new-game-button").css("color", "#fff");
		$("#new-game-button").css("border-bottom", "1px solid #333333");
		
		$("#lobby-button").css("background", "");
		$("#lobby-button").css("color", "#000");
		$("#lobby-button").css("border-bottom", "1px solid #000");
		
		$("#global-chat-button").css("background", "");
		$("#global-chat-button").css("color", "#000");
		$("#global-chat-button").css("border-bottom", "1px solid #000");
		
		$("#button-tab").css("display", "block");
		$("#lobby-tab").css("display", "none");
		$("#chat-tab").css("display", "none");
	});
	
	$(document).on('click', "#lobby-button", function(){
		$("#new-game-button").css("background", "");
		$("#new-game-button").css("color", "#000");
		$("#new-game-button").css("border-bottom", "1px solid #000");
		
		$("#lobby-button").css("background", "#333333");
		$("#lobby-button").css("color", "#fff");
		$("#lobby-button").css("border-bottom", "1px solid #333333");
		
		$("#global-chat-button").css("background", "");
		$("#global-chat-button").css("color", "#000");
		$("#global-chat-button").css("border-bottom", "1px solid #000");
		
		//$("#lobby-tab").css("display", "block");
		//$("#button-tab").css("display", "none");
		
		$(".popup-bck").css("display", "block");
		$(".popup-loading").css("display", "block");
		
		$("#chat-tab").css("display", "none");
		
		socket.emit('get lobbies', getCookie("login_cookie"));
		socket.emit('get users online', getCookie("login_cookie"));
	});
	
	$(document).on('click', "#global-chat-button", function(){
		$("#new-game-button").css("background", "");
		$("#new-game-button").css("color", "#000");
		$("#new-game-button").css("border-bottom", "1px solid #000");
		
		$("#lobby-button").css("background", "");
		$("#lobby-button").css("color", "#000");
		$("#lobby-button").css("border-bottom", "1px solid #000");
		
		$("#global-chat-button").css("background", "#333333");
		$("#global-chat-button").css("color", "#fff");
		$("#global-chat-button").css("border-bottom", "1px solid #333333");
		
		$("#lobby-tab").css("display", "none");
		$("#button-tab").css("display", "none");
		$("#chat-tab").css("display", "block");
	});
	
	$(document).on('submit', 'form', function() {
		//alert("HELLO");
		if($(this).attr("name") == "chat-form")
		{
			//console.log("ENTERS HERE $(this).attr(name) == chat-form");
			
			var chat_message = document.getElementById("chat-input").value;
			chat_message = chat_message.concat("::;").concat(current_user);
			//alert(chat_message);
			socket.emit('global chat', chat_message);
			/*
			if(one == 1)
			{
				
				var appendone = '<div class="row-one">';	
								
				var appendtwo = current_user + ": " +document.getElementById("chat-input").value;
								
				var appendthree = '</div>';
				
				var to_append = appendone + appendtwo + appendthree;
				//console.log(to_append);
				$("#append-chat-here").append(to_append);
				
				one--;

			}
			else
			{

				var appendone = '<div class="row-two">';	
								
				var appendtwo = current_user + ": " +document.getElementById("chat-input").value;
								
				var appendthree = '</div>';
				
				var to_append = appendone + appendtwo + appendthree;
				//console.log(to_append);
				$("#append-chat-here").append(to_append);
				one++;

			}
			*/
			document.getElementById("chat-input").value = "";
		}
		

		return false;
     });
	 

	$('#chat-form').submit(function(){
		return false;
	});
	
	//Updates the session info if user chooses to enter a lobby
	$(document).on('click', ".session", function(){
		
		//console.log(jQuery(".player-one", this).text());
		//console.log(jQuery(".player-two", this).text());
		//console.log(	(jQuery(".sessionID", this).text()).substring(4,(jQuery(".sessionID", this).text()).length)	);

		
		//console.log($(this).get(0).outerHTML);
		document.getElementById("append-here").innerHTML = $(this).get(0).outerHTML;
		
		$(".popup-bck").css("display", "block");
		$(".popup-content-box").css("display", "block");
		/*
		var split_string = $(this).text().trim().split(/\s+/);
		for(var i = 0; i < split_string.length; i++)
		{
			console.log(split_string[i]);
		}
		*/
	});
	
	//UPDATES THE SESSION INFO IF USER CHOOSES TO ENTER A LOBBY
	$(document).on('click', "#confirm_button_two", function(){
		var player_one = jQuery(".player-one", document.getElementById('append-here')).text();
		var player_two = jQuery(".player-two", document.getElementById('append-here')).text();
		var session_id = (jQuery(".sessionID", document.getElementById('append-here')).text()).substring(4,(jQuery(".sessionID", document.getElementById('append-here')).text()).length);
		//console.log(player_one);
		//console.log(player_two);
		//console.log(session_id);
		var to_send = current_user + ":" + player_one + ":"+ player_two + ":" + session_id + ":" + getCookie("login_cookie");
		
		socket.emit('join attempt', to_send);
		
		console.log(to_send);
	});
	
	//UPDATES THE SESSION INFO IF USER CHOOSES TO ENTER A LOBBY
	$(document).on('click', "#spectate_button", function(){
		var player_one = jQuery(".player-one", document.getElementById('append-here')).text();
		var player_two = jQuery(".player-two", document.getElementById('append-here')).text();
		var session_id = (jQuery(".sessionID", document.getElementById('append-here')).text()).substring(4,(jQuery(".sessionID", document.getElementById('append-here')).text()).length);
		var to_send = current_user + ":" + player_one + ":"+ player_two + ":" + session_id + ":" + getCookie("login_cookie");
		
		socket.emit('spectate attempt', to_send);
	});
	
	//CLOSES THE INFO TAB WHEN CLICKED
	$(document).on('click', "#cancel_button_two", function(){
		$(".popup-bck").css("display", "none");
		$(".popup-content-box").css("display", "none");
	});
	
	//CLOSES THE INFO TAB WHEN CLICKED
	$(document).on('click',".close-two",function()
		{
			$(".popup-bck").css("display", "none");
			$(".popup-content-box").css("display", "none");
		}
	);
	
	//Logout button clears session cookie when clicked + redirects to login page
	$(document).on('click',".logout-button",function()
	{
		//console.log(	(getCookie("login_cookie").split(":"))[0]	);
		var user = (getCookie("login_cookie").split(":"))[0];
		socket.emit('logout attempt', user);
		
		console.log("Clearing cookies");
		document.cookie = "login_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
		window.location="/login";
	});
	  
	socket.on('global chat message', function(msg){
		var split = msg.split("::;");
		var message = split[1] + " : " + split[0];
		console.log("Message: " + message);
		
		if(one == 1)
		{
			var appendone = '<div class="row-one">';	
							
			var appendtwo = message;
							
			var appendthree = '</div>';
			
			var to_append = appendone + appendtwo + appendthree;
			//console.log(to_append);
			$("#append-chat-here-global").append(to_append);
			
			one--;
		}
		else
		{
			var appendone = '<div class="row-two">';	
							
			var appendtwo = message;
							
			var appendthree = '</div>';
			
			var to_append = appendone + appendtwo + appendthree;
			//console.log(to_append);
			$("#append-chat-here-global").append(to_append);
			one++;
		}
		
	});
	
	socket.on('get login cookie', function(msg){
		//console.log(msg);
		//
		for(var i = 0; i < msg.length; i++)
		{
			console.log();
			var cookie = msg[i].Cookie;
			console.log("Current user: " + cookie.split(":")[0]);
			document.getElementById("logout-button").innerHTML = "Logout".concat(" : " + cookie.split(":")[0]);
			current_user = cookie.split(":")[0];
		}
	});
	
	//MODIFY TO GET LOBBY DETAILS FROM SERVER INSTEAD OF FROM THE PAGE
	socket.on('join confirmation', function(msg){
		switch(msg.split(":")[0])
		{
			case "Own Lobby":
				console.log("OWNER REJOINING LOBBY");
				//var player_one = jQuery(".player-one", document.getElementById('append-here')).text();
				//var player_two = jQuery(".player-two", document.getElementById('append-here')).text();
				//var session_id = (jQuery(".sessionID", document.getElementById('append-here')).text()).substring(4,(jQuery(".sessionID", document.getElementById('append-here')).text()).length);

				//var to_send = player_one + ":"+ player_two + ":" + session_id;
				document.cookie = "session_details=".concat(msg.split(":")[1]);
				 window.location="/game";
				break;
			
			case "Rejoining lobby":
				document.cookie = "session_details=".concat(msg.split(":")[1]);
				 window.location="/game";
				break;
			
			case "Lobby full":
				alert("LOBBY IS FULL!");
				break;
			
			case "Join successful":
				alert("JOINED SUCCESSFULLY!");
				document.cookie = "session_details=".concat(msg.split(":")[1]);
				 window.location="/game";
				break;
			
			default:
				console.log(msg.split(":")[1]);
				alert(msg.split(":")[1]);
				break;
		}
		
	});
	
	//SPECTATE CONFIRMATION REPLY FROM SERVER
	socket.on('spectate confirmation', function(msg){
		switch(msg.split(":")[0])
		{
			case "allowed":
				document.cookie = "session_details=".concat(msg.split(":")[1]);
				 window.location="/spectate";
				break;
			
			case "failed":
				document.cookie = "session_details=".concat(msg.split(":")[1]);
				 window.location="/spectate";
				break;
			
			default:
				console.log(msg.split(":")[1]);
				alert(msg.split(":")[1]);
				break;
		}
		
	});
	
	
	socket.on("lobbies", function(msg){
		//$("#lobby-tab").html = "";
		document.getElementById("lobby-tab").innerHTML = '<div id="lobby-header">\
						<ul>\
							<li class="col-one-third">Owner</li><!--\
							--><li class="col-one-third">Player Two</li><!--\
							--><li class="col-one-third">Lobby ID</li>\
						</ul>\
					</div>';
		
		for(var i = 0; i < msg.length; i++)
		{
			console.log(msg[i]);
			
			var appendone = '<div class="session">\
					<nav class="lobby-nav">\
					<ul>\
						<li class="col-one-third">\
							<div class="player-one">';	
							
			var appendtwo = '</div>\
						</li><!----><li class="col-one-third">\
							<div class="player-two">';
							
			var appendthree = '</div>\
						</li><!----><li class="col-one-third">\
							<div class="sessionID">';
							
			var appendfour ='</div>\
						</li>\
					</ul>\
				</nav>\
				</div>';
				
			var toappend = appendone + msg[i].PlayerOne + appendtwo + msg[i].PlayerTwo + appendthree + "ID: " + msg[i].SessionID + appendfour;
			
			$("#lobby-tab").append(toappend);
			//console.log("appended");
		}
	});
	
	socket.on('create-lobby',function(msg){
		console.log("create lobby event reply: " + msg);
		if(msg != "no")
		{
			/*
			console.log("Successful! Session details: " + msg);
			
			var split_string = msg.split(":");
			
			var appendone = '<div class="session">\
					<nav class="lobby-nav">\
					<ul>\
						<li class="col-one-third">\
							<div class="player-one">';	
							
			var appendtwo = '</div>\
						</li><!----><li class="col-one-third">\
							<div class="player-two">';
							
			var appendthree = '</div>\
						</li><!----><li class="col-one-third">\
							<div class="sessionID">';
							
			var appendfour ='</div>\
						</li>\
					</ul>\
				</nav>\
				</div>';
				
			var toappend = appendone + split_string[0] + appendtwo + split_string[1] + appendthree + "ID: " + split_string[2] + ":" + split_string[3] + appendfour;
			
			$("#lobby-tab").append(toappend);
			*/
			
			socket.emit('get lobbies', getCookie("login_cookie"));
			socket.emit('get users online', getCookie("login_cookie"));
			alert("Session ID: " + msg + " created successfully");
		}
		else
			alert("FAILED! TO CREATE LOBBY");
	});
	
	socket.on('users online', function(msg){
	   console.log("Users online: ");
	   for(var i = 0; i < msg.length; i++)
	   {
			//console.log(msg[i]);
			usersOnline.push(msg[i].Username);
	   }
	   
	   $(".lobby-nav li .player-one").each( function()
		{
			if (usersOnline.includes($(this).text()))
			{
				$(this).css("color", "#33cc33");
				$(this).css("font-weight", "bold");
			}
			else
			{
				$(this).css("color", "#cc0000");
				$(this).css("font-weight", "bold");
			}
		});
		
		$(".lobby-nav li .player-two").each( function()
		{
			if (usersOnline.includes($(this).text()))
			{
				$(this).css("color", "#33cc33");
				$(this).css("font-weight", "bold");
			}
			else
			{
				$(this).css("color", "#cc0000");
				$(this).css("font-weight", "bold");
			}
		});
		
		$(".lobby-nav li .sessionID").each( function()
		{
				$(this).css("color", "#3333ff");
				$(this).css("font-weight", "bold");
		});
	   
	   console.log(usersOnline);
		$(".popup-bck").css("display", "none");
		$(".popup-loading").css("display", "none");
	   
	   
		$("#new-game-button").css("background", "");
		$("#new-game-button").css("color", "#000");
		$("#new-game-button").css("border-bottom", "1px solid #000");
		
		$("#lobby-button").css("background", "#333333");
		$("#lobby-button").css("color", "#fff");
		$("#lobby-button").css("border-bottom", "1px solid #333333");
		
		$("#global-chat-button").css("background", "");
		$("#global-chat-button").css("color", "#000");
		$("#global-chat-button").css("border-bottom", "1px solid #000");
		
		$("#lobby-tab").css("display", "block");
		$("#button-tab").css("display", "none");
	});

	socket.on("session cookie", function(msg){
	   console.log("creating session cookie");
		document.cookie = "login_cookie=".concat(msg);
	});
});

	function getCookie(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i = 0; i <ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length,c.length);
			}
		}
		return "";
	}
 
