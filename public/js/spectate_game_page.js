
var clicked = false;

var turn = 0;

// Player 0 is white, 1 is black
var current_player = 0;

var clicked_square = "";
var origin_square = "";
var destination_square = "";

var selected_unit = "";
var unit_is_selected = false;
var moved_unit = false;

var start_time = "";
var first_run = 1;
var start_time_datefile;

var checkmate = false;

var current_row = 0;
var player_one;
var player_two;
var user_logged_in;

//For global chat colors
var one = 1;
var username;

$(document).ready(function(){

	$(".popup-bck").css("display","block");
	$(".popup-loading").css("display","block");
	
	//Checks if the user belongs on the page
	 if(getCookie("login_cookie"))
	 {
		 console.log("Login Cookie exists? ".concat(getCookie("login_cookie")));
	 }
	 else
	 {
		 console.log("Cookie doesn't exist");
		// window.location="/login.html";
	 }
	 
	var socket = io();
	

	
	//Function I found online to sanitize HTML text
	var decodeEntities = (function() {
	  // this prevents any overhead from creating the object each time
	  var element = document.createElement('div');

	  function decodeHTMLEntities (str) {
		if(str && typeof str === 'string') {
		  // strip script/html tags
		  str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
		  str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
		  element.innerHTML = str;
		  str = element.textContent;
		  element.textContent = '';
		}

		return str;
	  }

	  return decodeHTMLEntities;
	})();
	
	//Function I found online that I modified to replace Unicode Chess symbols with plain text
	if(typeof escapeHtmlEntities == 'undefined') {
        escapeHtmlEntities = function (text) {
            return text.replace(/[\u00A0-\u2666<>\&]/g, function(c) {
                return '&#' + 
                (escapeHtmlEntities.entityTable[c.charCodeAt(0)] || '#'+c.charCodeAt(0));
            });
        };

        escapeHtmlEntities.entityTable = {
            9812 : '9812', 
            9813 : '9813', 
            9814 : '9814', 
            9815 : '9815', 
            9816 : '9816',  
            9817 : '9817', 
            9818 : '9818', 
            9819 : '9819', 
            9820 : '9820', 
			9821 : '9821', 
            9822 : '9822', 
            9823 : '9823' 
        };
    }
	
	//Creates Socket Room to communicate with the server
	console.log("User logged in now is: " + getCookie("login_cookie").split(":")[0])
	var current_user = getCookie("login_cookie").split(":")[0];
	socket.emit('join', {ID: current_user});
	
	console.log("Requesting login cookie info");
	socket.emit('get login cookie', getCookie("login_cookie"));
	
	update_details();
	
	//Checks if the user belongs on the page
	 if(getCookie("session_details"))
	 {
		 console.log("Session Cookie exists? ".concat(getCookie("session_details")));
		 
		 var game_cookie = getCookie("session_details");
		 var login_cookie = getCookie("login_cookie");
		 var to_send = login_cookie + ":" + game_cookie;
		 
		 //Gets P1 & P2 Details from the server
		 socket.emit('get game_session details', to_send);
	 }
	 else
	 {
		 console.log("Cookie doesn't exist");
		 //window.location="/choose_game.html";
	 }
	 
	 //Displays current user logged in
	 socket.on('get login cookie', function(msg){
		//console.log(msg);
		//
		for(var i = 0; i < msg.length; i++)
		{
			console.log();
			var cookie = msg[i].Cookie;
			console.log("Current user: " + cookie.split(":")[0]);
			document.getElementById("logout-button").innerHTML = document.getElementById("logout-button").innerHTML.concat(" : " + cookie.split(":")[0]);
			username = cookie.split(":")[0];
			user_logged_in = cookie.split(":")[0];
		}
	});
	 
	 
	//Gets P1 & P2 Details from the server
	 socket.on('get game_session details', function(msg){
		var split_string = msg.split(":::");
		document.getElementById("player-one").innerHTML = "Player One: " + split_string[0];
		player_one = split_string[0];
		document.getElementById("player-two").innerHTML = "Player Two: " + split_string[1];
		player_two = split_string[1];
		
		//console.log("Board is undefined: ");
		//console.log(typeof split_string[2] == 'undefined');
		
		//Updates the board based on data sent from the server
		if(typeof split_string[2] != 'undefined' && split_string[2] != '')
		{
			//document.getElementById("board").innerHTML = split_string[2];
			//console.log("Board data: " + split_string[2]);
			var squares = split_string[2].split(":?");
			
			for(var i = 0; i < squares.length-1; i++)
			{
				//console.log("Square: " + squares[i]);
				var squaredata = squares[i].split(":");
				//console.log("Square: " + squaredata[0] + " Unit: " + squaredata[1]);
				document.getElementById(squaredata[0]).innerHTML = squaredata[1];
			}
		}
		
		//console.log("Info is undefined: ");
		//console.log(typeof split_string[3] == 'undefined');
		
		//Updates the pop-up info tab with data from the server/database
		if(typeof split_string[3] != 'undefined' && split_string[3] != '')
		{
			var split_info = split_string[3].split(":;");
			
			var game_log = split_info[0].replace(/\s+/g,' ');
			var game_log_split = game_log.split(";");
			for (var i = 0; i < game_log_split.length; i++)
			{
				if(game_log_split[i] != "")
				{
					$("#log-area").append(game_log_split[i].concat(";<br>"));
				}
				
			}
			//document.getElementById("log-area").innerHTML = game_log;
			//console.log("Game log:" + game_log);
			var units_captured = split_info[1].split(";?");
			for(var i = 0; i < units_captured.length; i++)
			{
				var units_captured_split = units_captured[i].split(":");
				//console.log(units_captured_split[0]);
				//console.log(units_captured_split[1]);
				document.getElementById(units_captured_split[0]).innerHTML = units_captured_split[1];
			}
		}
		
		console.log("Current Player: " + split_string[4]);
		if(split_string[4] == "PlayerOne")
		{
			current_player = 0;
		}
		else if (split_string[4] == "PlayerTwo")
			current_player = 1;
		
		$(".popup-bck").css("display","none");
		$(".popup-loading").css("display","none");
	 });
	 
	//Server pushes this update to the player when P2 joins
	 socket.on('P2 Joined', function(msg){
		 console.log("P2 Joined!");
		document.getElementById("player-two").innerHTML = "Player Two: " + msg;
	 });
	 
	 
	//SERVER PUSHES THIS UPDATE TO THE OTHER PLAYER/SPECTATORS WHEN THE ACTIVE PLAYER CLICKS A SQUARE
	socket.on('transmit move', function(msg){
		console.log('transmit move, other player clicked ' + msg);
		click_square.call(document.getElementById(msg).parentElement);
	});
	
	 //SERVER PUSHES THIS UPDATE TO THE OTHER PLAYER/SPECTATORS WHEN THE ACTIVE PLAYER CANCELS HIS/HER CLICK
	socket.on('cancel', function(msg){
		cancel_function.call("");
	});
	 
	//Restores state of previous game when it receives the "game state" emit from the server
	socket.on("game state", function(msg)
	{
		console.log("Restoring game state");
		if(msg == "NO")
		{
			
		}
		else
		{
			//document.getElementById('board').innerHTML = msg;
			document.body.innerHTML = msg;
		}
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
	
	socket.on('private game chat', function(msg)
	{
		console.log("Private game chat: " + msg);
		var split_string = msg.split(":");
		
		if(player_one == split_string[0])
		{
			var appendone = '<div class="row-one">';	
							
			var appendtwo = msg;
							
			var appendthree = '</div>';
			
			var to_append = appendone + appendtwo + appendthree;
			//console.log(to_append);
			$("#append-chat-here").append(to_append);
		}
		else
		{
			var appendone = '<div class="row-two">';	
							
			var appendtwo = msg;
							
			var appendthree = '</div>';
			
			var to_append = appendone + appendtwo + appendthree;
			console.log(to_append);
			$("#append-chat-here").append(to_append);
		}
		
		$( ".chat-button").addClass("flash-button");
	});
	
	
	//Updates the board with data pushed from the server
	socket.on('update board', function(msg)
	{
		console.log("Received board update from server!");
		//document.getElementById("board").innerHTML = msg;
		//console.log("Board data: " + msg);
		var squares = msg.split(":?");
		
		for(var i = 0; i < squares.length-1; i++)
		{
			//console.log("Square: " + squares[i]);
			var squaredata = squares[i].split(":");
			//console.log("Square: " + squaredata[0] + " Unit: " + squaredata[1]);
			document.getElementById(squaredata[0]).innerHTML = squaredata[1];
		}

		if(current_player == 0)
		{
			current_player = 1;
		}
		else
		{
			current_player = 0;
		}
		remove_highlights("all", "");
		alert("Player Has Made A Move!");
	});
	
	//TODO
	//Updates the Pop-up info tab with data from the server
	socket.on('update pop up', function(msg)
	{
		console.log("Received info tab update from server!");
		//document.getElementById("pop_up").innerHTML = msg;
		//console.log("Pushed info data: " + msg);
		
		if(typeof msg != 'undefined' && msg != '')
		{
			var split_info = msg.split(":;");
			document.getElementById("log-area").innerHTML = "";
			var game_log = split_info[0].replace(/\s+/g,' ');
			var game_log_split = game_log.split(";");
			
			for(var i = 0; i < game_log_split.length; i++)
			{
				if(game_log_split[i] != "")
				{
					$("#log-area").append(game_log_split[i].concat(";<br>"));
				}
			}
			
			var units_captured = split_info[1].split(";?");
			for(var i = 0; i < units_captured.length; i++)
			{
				var units_captured_split = units_captured[i].split(":");
				document.getElementById(units_captured_split[0]).innerHTML = units_captured_split[1];
			}
		}
	});
	
	socket.on('check validity',function(msg){
		if(msg  === "yes")
		{
			console.log("Valid user");
			if(!checkmate)
			{
				if(origin_square && destination_square)
				{
					
					
						if ($("#".concat(destination_square)).text() == "♚" || $("#".concat(destination_square)).text() == "♔")
						{
							alert("CHECKMATE!");
							checkmate = true;
						}
						
						if($("#".concat(destination_square)).text())
						{
							document.getElementById("game_message").innerHTML = "Game Message: " + $("#".concat(origin_square)).text() + " from " + origin_square + " captures " + $("#".concat(destination_square)).text() + " at " + destination_square;
						}
						else
						{
							document.getElementById("game_message").innerHTML = "Game Message: " + $("#".concat(origin_square)).text() + " from " + origin_square + " moves to "+ destination_square;
						}
						
						
						//UPDATES UNIT CAPTURED COUNTER AT THE BOTTOM
						var captured_unit = $("#".concat(destination_square)).text();
						
						switch (captured_unit)
						{
							case "♟":
								document.getElementById("black_pawn_no").innerHTML = parseInt($("#black_pawn_no").text()) + 1;
								break;
								
							case "♙":
								document.getElementById("white_pawn_no").innerHTML = parseInt($("#white_pawn_no").text()) + 1;
								break;
								
							case "♜":
								document.getElementById("black_knight_no").innerHTML = parseInt($("#black_knight_no").text()) + 1;
								break;
								
							case "♖":
								document.getElementById("white_knight_no").innerHTML = parseInt($("#white_knight_no").text()) + 1;
								break;	
								
							case "♞":
								document.getElementById("black_knight_no").innerHTML = parseInt($("#black_knight_no").text()) + 1;
								break;
								
							case "♘":
								document.getElementById("white_knight_no").innerHTML = parseInt($("#white_knight_no").text()) + 1;
								break;	
								
							case "♝":
								document.getElementById("black_bishop_no").innerHTML = parseInt($("#black_bishop_no").text()) + 1;
								break;
								
							case "♗":
								document.getElementById("white_bishop_no").innerHTML = parseInt($("#white_bishop_no").text()) + 1;
								break;		

							case "♛":
								document.getElementById("black_queen_no").innerHTML = parseInt($("#black_queen_no").text()) + 1;
								break;
								
							case "♕":
								document.getElementById("white_queen_no").innerHTML = parseInt($("#white_queen_no").text()) + 1;
								break;		

							case "♚":
								document.getElementById("black_king_no").innerHTML = parseInt($("#black_king_no").text()) + 1;
								break;
								
							case "♔":
								document.getElementById("white_king_no").innerHTML = parseInt($("#white_king_no").text()) + 1;
								break;									
							default:
								break;
						}
						
						//console.log(	((((($("#".concat(origin_square)).text()).concat(" FROM ")).concat(origin_square)).concat(" CAPTURES/MOVES TO ")).concat(($("#".concat(destination_square)).text()))).concat(" AT ").concat(destination_square)		);
						
						if(!$("#".concat(destination_square)).text())
						{
							console.log($("#".concat(origin_square)).text().concat(" FROM ").concat(origin_square).concat(" MOVES TO ").concat(destination_square));
							$("#log-area").append($("#".concat(origin_square)).text().concat(" FROM ").concat(origin_square).concat(" MOVES TO ").concat(destination_square).concat("<br>"));
						}
						else
						{
							console.log($("#".concat(origin_square)).text().concat(" FROM ").concat(origin_square).concat(" CAPTURES ").concat($("#".concat(destination_square)).text()).concat(" AT ").concat(destination_square));
							$("#log-area").append($("#".concat(origin_square)).text().concat(" FROM ").concat(origin_square).concat(" CAPTURES ").concat($("#".concat(destination_square)).text()).concat(" AT ").concat(destination_square).concat(";<br>"));
						}
						
						
						//COPIES ORIGIN UNIT OVER TO NEW SQUARE
						document.getElementById(destination_square).innerHTML = $("#".concat(origin_square)).text();
						document.getElementById(origin_square).innerHTML = "";
						remove_highlights("all", "");
						
						//CLEARS THE DISPLAY DATA SINCE THE UNIT HAS ALREADY BEEN MOVED
						document.getElementById('selected_unit').innerHTML = 'Selected Unit: ';
						document.getElementById('possible_moves').innerHTML = '';
						document.getElementById('move_to').innerHTML = 'Move To: ';
						
						unit_is_selected = false;
						
						//Clears text input if any
						document.getElementById("start-square").value= "";
						document.getElementById("destination-square").value= "";
						
						console.log("END OF CONFIRM BUTTON");
						
						if(current_player == 0)
						{
							current_player = 1;
						}
						else
						{
							current_player = 0;
						}
						
						/*************************** CODE TO STORE BOARD DATA IN A STRING ***************************/
						
						//Map to store board data
						var boardMap = new Map();

						var alph = "ABCDEFGH";
						for(var i=0; i<alph.length; i++)
						{
							for(var j = 1; j <9; j++)
							{
								var number = j.toString();
								var nextChar = alph.charAt(i);
								
								var linked = number.concat(nextChar);
								//console.log("Number: " + number + " nextChar: " + nextChar + " Linked: " + linked);
								
								var contents = decodeEntities(document.getElementById(linked).innerHTML);
								//var translated = decodeChessEntities(contents);
								
								switch (contents)
								{
									case "♔":
										contents = "&#9812";
										break;
										
									case "♕":
										contents = "&#9813";
										break;
										
									case "♖":
										contents = "&#9814";
										break;
										
									case "♗":
										contents = "&#9815";
										break;
										
									case "♘":
										contents = "&#9816";
										break;
										
									case "♙":
										contents = "&#9817";
										break;	
										
									case "♚":
										contents = "&#9818";
										break;
										
									case "♛":
										contents = "&#9819";
										break;		

									case "♜":
										contents = "&#9820";
										break;
										
									case "♝":
										contents = "&#9821";
										break;		

									case "♞":
										contents = "&#9822";
										break;
										
									case "♟":
										contents = "&#9823";
										break;									
									default:
										break;
								}
								//console.log(linked + " : " + contents);
								boardMap.set(linked, contents);
							}
						}
						
						//console.log("Printing map");
						//console.log(boardMap);
						var string_to_jsonify = "";
						
						boardMap.forEach(function(value, key) {
							//console.log("Key: " + key + " Value: " + value);
							if(string_to_jsonify == "")
							{
								//console.log("ENTERS HERE");
								string_to_jsonify = key.concat(":").concat(value).concat(":?");
							}
							else
							{
								//console.log("ENTERS HERE 2");
								string_to_jsonify = string_to_jsonify.concat(key.toString()).concat(":").concat(value.toString()).concat(":?");
							}
							//string_to_jsonify.concat(":");
							//console.log(string_to_jsonify);
						});

						/*************************** CODE TO STORE BOARD DATA IN A STRING ENDS HERE***************************/
						
						//console.log("String to jsonify: " + string_to_jsonify);
						
						var to_send = getCookie("session_details").concat(":::").concat(string_to_jsonify);
						//console.log("String to send to 'game state board': " + to_send);
						socket.emit('game state board', to_send);
						
						/*************************** CODE TO STORE INFO TAB LOG DATA IN A STRING STARTS HERE******************/

						var entities = [
							['♔', '&#9812'],
							['♕', '&#9813'],
							['♖', '&#9814'],
							['♗', '&#9815'],
							['♘', '&#9816'],
							['♙', '&#9817'],
							['♚', '&#9818'],
							['♛', '&#9819'],
							['♛', '&#9820'],
							['♝', '&#9821'],
							['♞', '&#9822'],
							['♟', '&#9823']
						];
						
						var test_state_two = document.getElementById("log-area").innerHTML;
						var to_send_two = getCookie("session_details").concat(":?").concat(test_state_two);
						to_send_two = decodeEntities(to_send_two);
						to_send_two = escapeHtmlEntities (to_send_two);
						//console.log("Converted to text: " + escapeHtmlEntities (to_send_two));
						
						
						to_send_two = to_send_two.concat(":;");
						to_send_two = to_send_two.concat("white_pawn_no:");
						to_send_two = to_send_two.concat(decodeEntities(document.getElementById("white_pawn_no").innerHTML));
						
						to_send_two = to_send_two.concat(";?white_rook_no:");
						to_send_two = to_send_two.concat(decodeEntities(document.getElementById("white_rook_no").innerHTML));
						
						to_send_two = to_send_two.concat(";?white_knight_no:");
						to_send_two = to_send_two.concat(decodeEntities(document.getElementById("white_knight_no").innerHTML));
						
						to_send_two = to_send_two.concat(";?white_bishop_no:");
						to_send_two = to_send_two.concat(decodeEntities(document.getElementById("white_bishop_no").innerHTML));
						
						to_send_two = to_send_two.concat(";?white_queen_no:");
						to_send_two = to_send_two.concat(decodeEntities(document.getElementById("white_queen_no").innerHTML));
						
						to_send_two = to_send_two.concat(";?white_king_no:");
						to_send_two = to_send_two.concat(decodeEntities(document.getElementById("white_king_no").innerHTML));
						
						
						to_send_two = to_send_two.concat(";?black_pawn_no:");
						to_send_two = to_send_two.concat(decodeEntities(document.getElementById("black_pawn_no").innerHTML));
						
						to_send_two = to_send_two.concat(";?black_rook_no:");
						to_send_two = to_send_two.concat(decodeEntities(document.getElementById("black_rook_no").innerHTML));
						
						to_send_two = to_send_two.concat(";?black_knight_no:");
						to_send_two = to_send_two.concat(decodeEntities(document.getElementById("black_knight_no").innerHTML));
						
						to_send_two = to_send_two.concat(";?black_bishop_no:");
						to_send_two = to_send_two.concat(decodeEntities(document.getElementById("black_bishop_no").innerHTML));
						
						to_send_two = to_send_two.concat(";?black_queen_no:");
						to_send_two = to_send_two.concat(decodeEntities(document.getElementById("black_queen_no").innerHTML));
						
						to_send_two = to_send_two.concat(";?black_king_no:");
						to_send_two = to_send_two.concat(decodeEntities(document.getElementById("black_king_no").innerHTML));
						
						//console.log("To send Two: " + to_send_two);
						/*************************** CODE TO STORE INFO TAB LOG DATA IN A STRING ENDS HERE********************/
						
						
						socket.emit('game state popup', to_send_two);
				}
			}
			
			else
				alert("GAME IS OVER");
		}
		else
		{
			alert("YOU ARE NOT THE CURRENT PLAYER!");
		}
	});
	
	
    $(document).on('submit', 'form', function() {

		if($(this).attr("name") == "chat-form")
		{
			//console.log("ENTERS HERE $(this).attr(name) == chat-form");
			
			var chat_message = document.getElementById("chat-input").value;
			chat_message = chat_message.concat("::;").concat(getCookie("login_cookie")).concat("::;").concat(getCookie("session_details"));
			socket.emit('private game chat', chat_message);
			
			if(user_logged_in == player_one)
			{
				var appendone = '<div class="row-one">';	
								
				var appendtwo = user_logged_in + ": " +document.getElementById("chat-input").value;
								
				var appendthree = '</div>';
				
				var to_append = appendone + appendtwo + appendthree;
				//console.log(to_append);
				$("#append-chat-here").append(to_append);
			}
			else
			{
				var appendone = '<div class="row-two">';	
								
				var appendtwo = user_logged_in + ": " +document.getElementById("chat-input").value;
								
				var appendthree = '</div>';
				
				var to_append = appendone + appendtwo + appendthree;
				//console.log(to_append);
				$("#append-chat-here").append(to_append);
			}
			
			document.getElementById("chat-input").value = "";
		}
		
		else if($(this).attr("name") == "chat-form-global")
		{
			//alert("ENTERS HERE $(this).attr(name) == chat-form-global");
			
			var chat_message = document.getElementById("chat-input-global").value;
			chat_message = chat_message.concat("::;").concat(username);
			socket.emit('global chat', chat_message);
			document.getElementById("chat-input-global").value = "";

		}
		
		return false;
     });
	
	
	$(document).on('click', '.global-tab',function(){
		$(".global-tab").css("background","#cccccc");
		$(".global-tab").css("color","#333333");

		$(".private-tab").css("background","");
		$(".private-tab").css("color","");

		$("#global").css("display","block");
		$("#private").css("display","none");
	});

	
	$(document).on('click', '.private-tab',function(){
		$(".global-tab").css("background","");
		$(".global-tab").css("color","");

		$(".private-tab").css("background","#cccccc");
		$(".private-tab").css("color","#333333");

		$("#private").css("display","block");
		$("#global").css("display","none");
	});
	 
	 
	 //STOPS THE PAGE FROM RELOADING THEN THE FORM IS SUBMITTED
	$('#chat-form').submit(function(){
		return false;
	});
	 
	$(document).on('click', ".chat-button", function(){
		 $(".private-tab").css("background","#cccccc");
		 $(".private-tab").css("color","#333333");
		
		$(".popup-chat").css("display","block");
		$(".popup-bck").css("display","block");
		
		$( ".chat-button").removeClass("flash-button" );
	});
	
	$(document).on('click', ".chat-close", function(){
		$(".popup-chat").css("display","none");
		$(".popup-bck").css("display","none");
	});
	
	
	//REDIRECTS TO THE LOBBY PAGE
	$(document).on('click', ".lobby-button", function(){
		window.location="/choose";
	});
	
	//Logout button clears session cookie when clicked + redirects to login page
	
	$(document).on('click',".logout-button",function()
	{
		//var test_state = document.body.innerHTML;
		
		//var test_state = document.getElementById('board').innerHTML;
		//var to_send = ((getCookie("login_cookie")).concat(":?")).concat(test_state);
		//console.log(to_send);
		//console.log(	(getCookie("login_cookie").split(":"))[0]	);
		//var user = (getCookie("login_cookie").split(":"))[0];
		socket.emit('logout attempt', getCookie("login_cookie"));
		//socket.emit('game state', to_send);
		//socket.emit('current player', current_player);
		
		console.log("Clearing cookies");
		document.cookie = "login_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
		window.location="/login";
	});
	
	//Adds the WHITE_PIECE/BLACK_PIECE class to squares that have chess pieces o
	$("div").each( function()
	{
		if ($(this).text() == String.fromCharCode(9812) || $(this).text() == String.fromCharCode(9813) || $(this).text() == String.fromCharCode(9814)|| $(this).text() == String.fromCharCode(9815) || $(this).text() == String.fromCharCode(9816) || $(this).text() == String.fromCharCode(9817))
		{
			$(this).addClass("WHITE_PIECE");
		}
		
		else if($(this).text() == String.fromCharCode(9818) || $(this).text() == String.fromCharCode(9819) || $(this).text() == String.fromCharCode(9820)|| $(this).text() == String.fromCharCode(9821) || $(this).text() == String.fromCharCode(9822) || $(this).text() == String.fromCharCode(9823))
			$(this).addClass("BLACK_PIECE");
	});

	
	//Highlights squares that your mouse cursor is on
	$(document).on('mouseenter',"div.black, div.white",function(){
			$( this ).addClass("highlight" );
	});
	
	$(document).on('mouseleave',"div.black, div.white",function(){
			$( this ).removeClass("highlight" );
	});

	//Helper function that decides what to do when you click on a square
	var click_square = function (x){
		
			if(!checkmate)
			{
				if(x)
				{
					console.log("HELLO FREND");
				}
				//clicked = true;
				//alert("Current player is : " + current_player);
				
				selected_unit = $(this).text();
				
				var move_squares = ($("#possible_moves").text()).split(" ");

				clicked_square = $(this).children(":first").attr('id');
				
				var clicked_possible_move = false;
				
				for(var i  = 0; i < move_squares.length; i++)
				{
					if(move_squares[i])
					{
						if(move_squares[i] == clicked_square)
						{
							console.log("HIT A MOVEBOX!");
							clicked_possible_move = true;
							destination_square = move_squares[i];
							
							//Clears previous move selection if any
							remove_highlights("replace", "");
							
							$( "#".concat(destination_square) ).addClass("green_highlight" );
							$( "#".concat(destination_square) ).removeClass("red_highlight" );
							
							document.getElementById('move_to').innerHTML = 'Move To: <b>' + move_squares[i] + "</b>";
							
							$("#confirm_button").addClass("confirm" );
							
							
							
							break;
						}
						console.log("ELSE EMPTY SQUARE: " + move_squares[i]);
					}
					
				}
				
				$("#cancel_button").addClass("cancel" );
				
				
				if(!clicked_possible_move)
				{
					console.log("ENTERS !CLICKED POSSIBLE MOVE");
					//Removes blue highlight for previously selected square
					remove_highlights("blue", move_squares);
					
					remove_highlights("green", "");
					document.getElementById('move_to').innerHTML = 'Move To: ';
					destination_square = "";
				
					//Modify the selected unit section to display the unit selected
					//If WHITE
					if (selected_unit == String.fromCharCode(9812) || selected_unit== String.fromCharCode(9813) || selected_unit == String.fromCharCode(9814)|| selected_unit == String.fromCharCode(9815) || selected_unit == String.fromCharCode(9816) || selected_unit == String.fromCharCode(9817))
					{
						if(current_player == 0)
						{
							document.getElementById('selected_unit').innerHTML = 'Selected Unit: (WHITE) <b>' + selected_unit +  "</b>";
							unit_is_selected = true;
							origin_square = clicked_square;
						}
						//If the player selects a unit of the wrong color
						else
						{
							remove_highlights("all", "");
							
							document.getElementById("game_message").innerHTML = "Game Message: CURRENT PLAYER IS THE BLACK PLAYER YOU MUST CHOOSE A BLACK UNIT TO MOVE";

							$("#game_message").addClass("blue_highlight");
							
							
							document.getElementById('selected_unit').innerHTML = 'Selected Unit: ';
							console.log("Possible Moves before clearing: " + ($("#possible_moves").text()));
							console.log("CLEARING POSSIBLE MOVES!");
							document.getElementById('possible_moves').innerHTML = '';
							console.log("Possible Moves after clearing: " + ($("#possible_moves").text()));
							unit_is_selected = false;
							selected_unit = "";

							remove_highlights("red", move_squares);		

										$(".pop_up").css("display", "block");
										$("#pieces-captured").css("display", "none");
										$("#logs").css("display", "none");
										$("#pop_up_info").css("display", "block");
										
										//Adds border + BG color to selected tab and removes border + BG color from the other tabs
										$("#info-tab").css("border-bottom", "3px solid #fff");
										$("#info-tab").css("color", "#294C72");
										$("#info-tab").css("background", "#fff");
										$("#info-tab").css("font-weight", "bold");
										
										$("#pieces-captured-tab").css("border-bottom", "");
										$("#pieces-captured-tab").css("color", "#fff");
										$("#pieces-captured-tab").css("background", "");
										$("#pieces-captured-tab").css("font-weight", "");
										
										$("#log-tab").css("background","");
										$("#log-tab").css("background","");
										$("#log-tab").css("color","#fff");
										$("#log-tab").css("font-weight","");
										$("#log-tab").css("border-bottom","none");
						}
					}
					else
					{
						//If BLACK
						if (selected_unit != "")
						{
							if(current_player == 1)
							{
								document.getElementById('selected_unit').innerHTML = 'Selected Unit: (BLACK)' + selected_unit;
								origin_square = clicked_square;
								unit_is_selected = true;
							}
							//If the player selects a unit of the wrong color
							else
							{
								remove_highlights("all", "");
								
								document.getElementById("game_message").innerHTML = "Game Message: CURRENT PLAYER IS THE WHITE PLAYER YOU MUST CHOOSE A WHITE UNIT TO MOVE";
								$("#game_message").addClass("blue_highlight");
								
								
								document.getElementById('selected_unit').innerHTML = 'Selected Unit: ';
								console.log("Possible Moves before clearing: " + ($("#possible_moves").text()));
								console.log("CLEARING POSSIBLE MOVES!");
								document.getElementById('possible_moves').innerHTML = '';
								console.log("Possible Moves after clearing: " + ($("#possible_moves").text()));
								unit_is_selected = false;
								selected_unit = "";

								remove_highlights("red", move_squares);
								
										$(".pop_up").css("display", "block");
										$("#pieces-captured").css("display", "none");
										$("#logs").css("display", "none");
										$("#pop_up_info").css("display", "block");
										
										//Adds border + BG color to selected tab and removes border + BG color from the other tabs
										$("#info-tab").css("border-bottom", "3px solid #fff");
										$("#info-tab").css("color", "#294C72");
										$("#info-tab").css("background", "#fff");
										$("#info-tab").css("font-weight", "bold");
										
										$("#pieces-captured-tab").css("border-bottom", "");
										$("#pieces-captured-tab").css("color", "#fff");
										$("#pieces-captured-tab").css("background", "");
										$("#pieces-captured-tab").css("font-weight", "");
										
										$("#log-tab").css("background","");
										$("#log-tab").css("background","");
										$("#log-tab").css("color","#fff");
										$("#log-tab").css("font-weight","");
										$("#log-tab").css("border-bottom","none");
							}
						}
						//Else clear the display if nothing is selected
						else
						{
							document.getElementById('selected_unit').innerHTML = 'Selected Unit: ';
							
							console.log("Possible Moves before clearing: " + ($("#possible_moves").text()));
							console.log("CLEARING POSSIBLE MOVES!");
							document.getElementById('possible_moves').innerHTML = '';
							console.log("Possible Moves after clearing: " + ($("#possible_moves").text()));
							
							unit_is_selected = false;
							selected_unit = "";

							remove_highlights("red", move_squares);
						}
					}
					//alert(clicked_square);
					//alert(move_squares)

					move_piece();
				}
			}
			else
				alert("GAME IS OVER");
		};

//Brings up the pop up tab and show pieces captured as the default screen
	$(document).on('click',"#info_button",function()
		{
			$("#pop_up").css("display", "block");
			$("#pieces-captured").css("display", "block");
			$("#pieces-captured-tab").css("border-bottom", "none");
			$("#pieces-captured-tab").css("background", "#cccccc");
			$("#pieces-captured-tab").css("color", "#333333");
			$("#pieces-captured-tab").css("font-weight", "bold");
			$(".popup-bck").css("display","block");
			//console.log("HELLO");
		}
	);
	
	//Changes the pop up tab to show game info
	
	$(document).on('click',"#info-tab",function()
		{
			$("#pieces-captured").css("display", "none");
			$("#pop_up_info").css("display", "block");
			$("#logs").css("display", "none");

			
			//Adds border + BG color to selected tab and removes border + BG color from the other tabs
			$("#info-tab").css("color", "#294C72");
			$("#info-tab").css("background", "#cccccc");
			$("#info-tab").css("color", "#333333");
			$("#info-tab").css("font-weight", "bold");
			
			$("#pieces-captured-tab").css("border-bottom", "none");
			$("#pieces-captured-tab").css("color", "#fff");
			$("#pieces-captured-tab").css("background", "");
			$("#pieces-captured-tab").css("font-weight", "");
			
			$("#log-tab").css("background","");
			$("#log-tab").css("background","");
			$("#log-tab").css("color","#fff");
			$("#log-tab").css("font-weight","");
			$("#log-tab").css("border-bottom","none");
		}
	);
	
	//Helper function to show the pieces captured tab
	function select_pieces_tab(){
		//Adds border + BG color to selected tab and removes border + BG color from the other tabs
		$("#pieces-captured").css("display", "block");
		$("#pieces-captured-tab").css("border-bottom", "none");
		$("#pieces-captured-tab").css("background", "#cccccc");
		$("#pieces-captured-tab").css("color", "#333333");
		$("#pieces-captured-tab").css("font-weight", "bold");

		
		$("#pop_up_info").css("display", "none");
		$("#info-tab").css("border-bottom", "");
		$("#info-tab").css("color", "#fff");
		$("#info-tab").css("background", "");
		$("#info-tab").css("font-weight", "");
		
		$("#logs").css("display", "none");
		$("#log-tab").css("border-bottom", "");
		$("#log-tab").css("color", "#fff");
		$("#log-tab").css("background", "");
		$("#log-tab").css("font-weight", "");
	};
	
	//Changes the pop up tab to show pieces captured
	
	$(document).on('click',"#pieces-captured-tab",function()
		{
			select_pieces_tab();
		}
	);
	
	//TODO
	//Changes the pop up tab to show game logs
	
	$(document).on('click',"#log-tab",function()
		{
			$("#logs").css("display","block");
			$("#pop_up_info").css("display","none");
			$("#pieces-captured").css("display","none");
			
			$("#pieces-captured-tab").css("background","");
			$("#pieces-captured-tab").css("color","#fff");
			$("#pieces-captured-tab").css("border-bottom","none");
			$("#pieces-captured-tab").css("border-bottom","none");
			$("#pieces-captured-tab").css("font-weight","");
			
			$("#info-tab").css("background","");
			$("#info-tab").css("color","#fff");
			$("#info-tab").css("border-bottom","none");
			$("#info-tab").css("border-bottom","none");
			$("#info-tab").css("font-weight","");
			
			$("#info-tab").css("background","");
			$("#log-tab").css("background","#cccccc");
			$("#log-tab").css("color","#333333");
			$("#log-tab").css("font-weight","bold");
			$("#log-tab").css("border-bottom","none");
		}
	);
	
	//Closes the info tab when clicked
	$(document).on('click',".close",function()
		{
			$(".pop_up").css("display", "none");
			$(".pop_up_two").css("display", "none");
			$(".popup-bck").css("display","none");
			
			select_pieces_tab();
		}
	);
	
	//Simulates clicking on the specified squares entered in the respective textboxes, user still needs to press confirm
	$(document).on('click',".move-button",function()
		{
			if(document.getElementById("start-square").value)
			{
				var array = (document.getElementById("start-square").value).split("");
				
				if(isNaN(array[0]))
				{
					var temp = array[0].toUpperCase();
					array[0] = array[1];
					array[1] = temp;
				}
				else
				{
					array[1]=array[1].toUpperCase();
				}
				
				//console.log(array[0]);
				//console.log(array[1]);
				
				var start_concat = array[0].toString().concat(array[1].toString()); 
				console.log(start_concat);
				click_square.call(document.getElementById(start_concat));
				
			}
			

			if(document.getElementById("destination-square").value)
			{
				var array = (document.getElementById("destination-square").value).split("");
				
				if(isNaN(array[0]))
				{
					var temp = array[0].toUpperCase();
					array[0] = array[1];
					array[1] = temp;
				}
				else
				{
					array[1]=array[1].toUpperCase();
				}
				
				//console.log(array[0]);
				//console.log(array[1]);
				
				var destination_concat = array[0].toString().concat(array[1].toString()); 
				console.log(destination_concat);
				click_square.call(document.getElementById(destination_concat));
			}
		}
	);
	
	$(document).on('click',"#cancel_button",function(){
		cancel_function.call("");	
	});	
	
	var cancel_function = function(x){
		//document.getElementById('system_message').innerHTML = "System Message: UNIT IS SELECTED " + unit_is_selected;
		
		document.getElementById('selected_unit').innerHTML = 'Selected Unit: ';
					
		document.getElementById('possible_moves').innerHTML = '';

		document.getElementById("move_to").innerHTML = "Move To: ";
		
		var to_send = getCookie("session_details").concat(":").concat(getCookie("login_cookie"));
		
		socket.emit('cancel', to_send);
		
		unit_is_selected = false;
		selected_unit = "";

		remove_highlights("all", "");
	};
	
	//REMOVES THE USER AS A SPECTATOR IF THEY LEAVE THE PAGE		
	$(window).on('beforeunload', function(){
		var to_send = getCookie("session_details").concat(":").concat(getCookie("login_cookie"));
        socket.emit('remove spectator', to_send);
     });
});

	function HELLO() {
		alert("HELLO!");
		$("#txt").html("");
		$("#txt").append('HELLO!');
	};
	
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
	
	function update_details()
	{
		var d = new Date();
		var h = d.getHours();
		var m = d.getMinutes();
		var s = d.getSeconds();
		m = checkTime(m);
		s = checkTime(s);
		var stri = h + ":" + m + ":" + s;
		//alert (stri);

		
		//Only runs this for the first loop to show the starting time
		if (first_run == 1)
		{
			start_time_datefile = new Date(d.getTime());;
			start_time = stri;
			$('#time_start').html('');
			$('#time_start').append('<div id="time_start"> Start Time: ' + start_time + '</div>');
			first_run = 0;
		}
		
		//Displays the time
		$('#time').html('');
		$("#time").append('<div id="time"> Current Time is: ' + stri + '</div>');
		
		//Displays elapsed time since you started playing
		var elapsed_date = new Date()
		var elapsed = d - start_time_datefile;
		elapsed_date.setTime(elapsed);
		var h_e = elapsed_date.getHours() - 8;
		var m_e = elapsed_date.getMinutes();
		var s_e = elapsed_date.getSeconds();
		m_e = checkTime(m_e);
		s_e = checkTime(s_e);
		var stri_e = h_e + ":" + m_e + ":" + s_e;
		$('#time_elapsed').html('');
		$('#time_elapsed').append('<div id="time_elapsed"> Elapsed Time Since You Started Playing/Loaded the page: ' + stri_e + '</div>');

		//Clears highlights if no unit is selected 
		var move_squares = ($("#possible_moves").text()).split(" ");
		var counter;
		remove_highlights("red", move_squares);
		
		
		//Resets data if no unit is selected
		if(clicked_square != "" && !unit_is_selected)
		{
			if(	$("#".concat(clicked_square)).text() == ""	)
			{
				clicked_square = "";
				destination_square = "";
				origin_square = "";
				
				selected_unit = "";
				unit_is_selected = false;
				moved_unit = false;
			}
		}

		change_player();
			
		//Recursive call	
		var t = setTimeout(update_details, 500);
	};
	
	//Helper function for update_details
	function checkTime(i)
	{
	if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
	return i;
	};
	
	
	//Helper function to change the current player display
	function change_player()
	{
		//Displays the current player

		if(current_player == 0)
		{
			document.getElementById('player').innerHTML = "Current Player: <b>White</b>";
			$("#player").css("color", "#000");
			$("#player").css("background", "#fff");
		}
		else
		{
			document.getElementById('player').innerHTML = "Current Player: <b>Black</b>";
			$("#player").css("color", "#fff");
			$("#player").css("background", "#000");
		}
	};
	
	//TODO:	Check if squares are occupied, Highlight possible moves
	//Helper function to move a chess piece	
	function move_piece()
	{
		//var split_str = clicked_square.split(",");
		
		// Row axis value(number)
		var x_axis = clicked_square[0];
		
		// Column axis value(letter)
		var y_axis = clicked_square[1];
		//alert(y_axis);
		
		var str = x_axis.concat(" ");
		
		str = str.concat(y_axis);
		
		var possible_moves = "";
		
		//String.fromCharCode('A'.charCodeAt() + 1);
		
		
		
		//************************************Pawn********************************************
		if(selected_unit == "♟" || selected_unit == "♙")
		{
			//*** CHECK FOR ENEMIES THAT CAN BE CAPTURED STARTS HERE***/
			
			//NEXT ROW
			var possible_enemy_1_x = parseInt(x_axis) - 1;
			//TO THE LEFT
			var possible_enemy_1_y = String.fromCharCode(y_axis.charCodeAt() - 1);
			var possible_enemy_1_coord = (possible_enemy_1_x.toString()).concat(possible_enemy_1_y);
			
			var color = "white";
			
			if(selected_unit == "♙")
			{
				//PREVIOUS ROW
				possible_enemy_1_x = parseInt(x_axis) + 1;
				//TO THE LEFT
				possible_enemy_1_y = String.fromCharCode(y_axis.charCodeAt() - 1);
				possible_enemy_1_coord = (possible_enemy_1_x.toString()).concat(possible_enemy_1_y);
				color = "black";
			}
			
			
			
			//If it's within bounds of the board
			if(within_board(possible_enemy_1_x, possible_enemy_1_y))
			{
				//alert(possible_enemy_1_coord);
				//alert( "#".concat(possible_enemy_1_coord)	);
				//alert($("#".concat(possible_enemy_1_coord)	).text());
				
				//CHECKS IF THERE ARE ENEMY UNITS DIAGONAL TO IT
				if (has_unit_of_color($( "#".concat(possible_enemy_1_coord)).text(),color))
				{
					possible_moves = (possible_moves.concat(possible_enemy_1_coord)).concat(" ");
				}
			}
			

			//NEXT ROW
			var possible_enemy_2_x = parseInt(x_axis) - 1;
			//TO THE RIGHT
			var possible_enemy_2_y = String.fromCharCode(y_axis.charCodeAt() + 1);
			var possible_enemy_2_coord = (possible_enemy_2_x.toString()).concat(possible_enemy_2_y);
			
			if(selected_unit == "♙")
			{
				//PREVIOUS ROW
				possible_enemy_2_x = parseInt(x_axis) + 1;
				//TO THE RIGHT
				possible_enemy_2_y = String.fromCharCode(y_axis.charCodeAt() + 1);
				possible_enemy_2_coord = (possible_enemy_2_x.toString()).concat(possible_enemy_2_y);
			}
			
			
			
			//If it's within bounds of the board
			if(within_board(possible_enemy_2_x, possible_enemy_2_y))
			{
				//alert(possible_enemy_1_coord);
				//alert( "#".concat(possible_enemy_1_coord)	);
				//alert($("#".concat(possible_enemy_1_coord)	).text());
				
				//CHECKS IF THERE ARE ENEMY UNITS DIAGONAL TO IT
				if (has_unit_of_color($( "#".concat(possible_enemy_2_coord)).text(),color))
				{
					//alert("ENTERS HERE");
					possible_moves = (possible_moves.concat(possible_enemy_2_coord)).concat(" ");
				}
			}
			
			//*** CHECK FOR ENEMIES THAT CAN BE CAPTURED ENDS HERE***/
			
			
			//BLACK PAWN
			if(selected_unit == "♟")
			{
				//If the pawn hasn't moved yet
				if (parseInt(x_axis) == 7)
				{
					//A pawn that hasn't moved can either move 1 or 2 squares forward
					var blocked = false;
					var move_1 = "6".concat(y_axis);
					var move_2 = "5".concat(y_axis);
					
					//Checks to see if it is blocked by any units
					//alert(has_unit_of_color($("#".concat(move_1)).text(),"both"));
					if (!has_unit_of_color($("#".concat(move_1)).text(),"both"))
					{
						possible_moves = (possible_moves.concat(move_1)).concat(" ");
						
						if (!has_unit_of_color($("#".concat(move_2)).text(),"both"))
						{
							possible_moves = possible_moves.concat(move_2);
							
						}
						
					}
					

				}
				//Else if it has moved, it can only move one square forward (Implementing en passant later)
				else if(parseInt(x_axis) != 7)
				{
					var blocked = false;
					var move = ((parseInt(x_axis)-1).toString()).concat(y_axis);
					if(within_board((parseInt(x_axis)-1), possible_enemy_1_y) && !has_unit_of_color($("#".concat(move)).text(),"both"))
					{
						possible_moves = possible_moves.concat(move);
					}
				}
			}
			
			//WHITE PAWN
			else
			{
				//If the pawn hasn't moved yet
				if (parseInt(x_axis) == 2)
				{
					//A pawn that hasn't moved can either move 1 or 2 squares forward
					var blocked = false;
					var move_1 = "3".concat(y_axis);
					var move_2 = "4".concat(y_axis);
					
					//Checks to see if it is blocked by any units
					//alert(has_unit_of_color($("#".concat(move_1)).text(),"both"));
					if (!has_unit_of_color($("#".concat(move_1)).text(),"both"))
					{
						possible_moves = (possible_moves.concat(move_1)).concat(" ");
						
						
						if (!has_unit_of_color($("#".concat(move_2)).text(),"both"))
						{
							possible_moves = possible_moves.concat(move_2);
							
						}
					}
					

				}
				//Else if it has moved, it can only move one square forward (Implementing en passant later)
				else if(parseInt(x_axis) != 2)
				{
					var blocked = false;
					var move = ((parseInt(x_axis) + 1).toString()).concat(y_axis);
					//console.log(move);
					if(within_board((parseInt(x_axis)+1), possible_enemy_1_y) && !has_unit_of_color($("#".concat(move)).text(),"both"))
					{
						possible_moves = possible_moves.concat(move);
					}
				}
			}	
				
			//Modifies div to display all possible moves	
			
			document.getElementById('possible_moves').innerHTML = "<b>" + possible_moves +"</b>";
		}
		//************************************Pawn********************************************

		
		
		
		
		//************************************knight********************************************
		if(selected_unit == "♜" || selected_unit == "♖")
		{
			var same_color = "black";
			var opposite_color = "white";
			
			if (selected_unit == "♖")
			{
				same_color = "white";
				opposite_color = "black";
			}
			
			//LEFT
			for(var y = String.fromCharCode(y_axis.charCodeAt() - 1); y >= 'A'; y=String.fromCharCode(y.charCodeAt() - 1))
			{
				if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),same_color))
				{
					break;
				}
				else if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),opposite_color))
				{
					//console.log(x_axis.concat(y));
					possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
					break;
				}
				//console.log(x_axis.concat(y));
				possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
			}
			//RIGHT
			for(var y = String.fromCharCode(y_axis.charCodeAt() + 1); y <= 'H'; y=String.fromCharCode(y.charCodeAt() + 1))
			{
				if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),same_color))
				{
					break;
				}
				else if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),opposite_color))
				{
					//console.log(x_axis.concat(y));
					possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
					break;
				}
				//console.log(x_axis.concat(y));
				possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
			}
			
			//BOTTOM
			for(var x = parseInt(x_axis)-1; x > 0; x--)
			{
				//console.log(	$("#".concat((x.toString()).concat(y_axis))).text()	);
				
				if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),same_color))
				{
					break;
				}
				else if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),opposite_color))
				{
					//console.log((x.toString()).concat(y_axis));
					possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
					break;
				}
				//console.log((x.toString()).concat(y_axis));
				possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
			}
			
			//TOP
			for(var x = parseInt(x_axis)+1; x < 9; x++)
			{
				//console.log(	$("#".concat((x.toString()).concat(y_axis))).text()	);
				
				if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),same_color))
				{
					break;
				}
				else if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),opposite_color))
				{
					//console.log((x.toString()).concat(y_axis));
					possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
					break;
				}
				//console.log((x.toString()).concat(y_axis));
				possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
			}
			
			
			document.getElementById('possible_moves').innerHTML = "<b>" + possible_moves +"</b>";
			
			
		}
		//************************************ knight ********************************************

		
		
		
		
		//************************************ King ********************************************
		if(selected_unit == "♚" || selected_unit == "♔")
		{
			var same_color = "black";
			
			if(selected_unit == "♔")
			{
				same_color = "white";
			}
			
			//A king can only move one square in all directions
			//TOP
			if(within_board(parseInt(x_axis) + 1, y_axis))
			{
				//Instead of && in the if above, i'm using a seperate if to make it look less messy
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 1).toString()).concat(y_axis))).text(),same_color))
				{
					//console.log(((parseInt(x_axis) + 1).toString()).concat(y_axis));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 1).toString()).concat(y_axis))).concat(" ");
				}
			}
			//BOTTOM
			if(within_board(parseInt(x_axis) - 1, y_axis))
			{

				
				//Instead of && in the if above, i'm using a seperate if to make it look less messy
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 1).toString()).concat(y_axis))).text(),same_color))
				{
					//console.log(((parseInt(x_axis) - 1).toString()).concat(y_axis));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 1).toString()).concat(y_axis))).concat(" ");
				}
			}
			//LEFT
			if(within_board(parseInt(x_axis), String.fromCharCode(y_axis.charCodeAt() - 1)))
			{

				if(! has_unit_of_color($("#".concat(((parseInt(x_axis)).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).text(),same_color))
				{
					//console.log(((parseInt(x_axis)).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis)).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).concat(" ");
				}
			}			
			//RIGHT
			if(within_board(parseInt(x_axis), String.fromCharCode(y_axis.charCodeAt() + 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis)).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).text(),same_color))
				{
					//console.log(((parseInt(x_axis)).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis)).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).concat(" ");
				}
			}				
			//TOP LEFT
			if(within_board(parseInt(x_axis) + 1, String.fromCharCode(y_axis.charCodeAt() - 1)))
			{
				
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).text(),same_color))
				{
					//console.log(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).concat(" ");
				}
			}
			//TOP RIGHT
			if(within_board(parseInt(x_axis) + 1, String.fromCharCode(y_axis.charCodeAt() + 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).text(),same_color))
				{
					//console.log(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).concat(" ");
				}
			}
			//BOTTOM LEFT
			if(within_board(parseInt(x_axis) - 1, String.fromCharCode(y_axis.charCodeAt() - 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).text(),same_color))
				{
					//console.log(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).concat(" ");
				}				
			}			
			//BOTTOM RIGHT
			if(within_board(parseInt(x_axis) - 1, String.fromCharCode(y_axis.charCodeAt() + 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).text(),same_color))
				{
					//console.log(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).concat(" ");
				}					
			}			
			
			document.getElementById('possible_moves').innerHTML = "<b>" + possible_moves +"</b>";
		}
		
		//************************************ King ********************************************
	
		


		//************************************ Knight ********************************************
		if(selected_unit == "♞" || selected_unit == "♘")
		{
			//A knight has 8 possible moves
			
			var same_color = "black";
			
			if (selected_unit == "♘")
			{
				same_color = "white";
			}
			
			//Bottom right(left)
			if(within_board(parseInt(x_axis) - 2, String.fromCharCode(y_axis.charCodeAt() + 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).text(),same_color))
				{
					//console.log(((parseInt(x_axis) - 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).concat(" ");
				}					
			}
			
			//Bottom right(right)
			if(within_board(parseInt(x_axis) - 1, String.fromCharCode(y_axis.charCodeAt() + 2)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 2)))).text(),same_color))
				{
					//console.log(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 2)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 2)))).concat(" ");
				}					
			}	

			//Bottom left(left)
			if(within_board(parseInt(x_axis) - 2, String.fromCharCode(y_axis.charCodeAt() - 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).text(),same_color))
				{
					//console.log(((parseInt(x_axis) - 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).concat(" ");
				}					
			}
			
			//Bottom left(right)
			if(within_board(parseInt(x_axis) - 1, String.fromCharCode(y_axis.charCodeAt() - 2)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 2)))).text(),same_color))
				{
					//console.log(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 2)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 2)))).concat(" ");
				}					
			}	

			//Top right(left)
			if(within_board(parseInt(x_axis) + 2, String.fromCharCode(y_axis.charCodeAt() + 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).text(),same_color))
				{
					//console.log(((parseInt(x_axis) + 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).concat(" ");
				}					
			}
			
			//Top right(right)
			if(within_board(parseInt(x_axis) + 1, String.fromCharCode(y_axis.charCodeAt() + 2)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 2)))).text(),same_color))
				{
					//console.log(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 2)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 2)))).concat(" ");
				}					
			}	
			
			//Top left(right)
			if(within_board(parseInt(x_axis) + 2, String.fromCharCode(y_axis.charCodeAt() - 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).text(),same_color))
				{
					//console.log(((parseInt(x_axis) + 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).concat(" ");
				}					
			}
			
			//Top left(left)
			if(within_board(parseInt(x_axis) + 1, String.fromCharCode(y_axis.charCodeAt() - 2)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 2)))).text(),same_color))
				{
					//console.log(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 2)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 2)))).concat(" ");
				}					
			}	

			
			document.getElementById('possible_moves').innerHTML = "<b>" + possible_moves +"</b>";			
		}
		//************************************ Knight ********************************************
			
		
		
		
		
		
		//************************************ Bishop ********************************************
		if(selected_unit == "♝" || selected_unit == "♗")
		{
			//Can only move diagonally
			
			var same_color = "black";
			var opposite_color = "white";
			
			if (selected_unit == "♗")
			{
				same_color = "white";
				opposite_color = "black";
			}
			
			//Top right
			var temp_x = parseInt(x_axis) + 1;
			var temp_y = String.fromCharCode(y_axis.charCodeAt() + 1);
			while(within_board(temp_x, temp_y))
			{
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),same_color))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),opposite_color))
				{
					//console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					//console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
				}
				
				temp_x += 1;
				temp_y = String.fromCharCode(temp_y.charCodeAt() + 1);
			}
			
			//Bottom right
			temp_x = parseInt(x_axis) - 1;
			temp_y = String.fromCharCode(y_axis.charCodeAt() - 1);
			while(within_board(temp_x, temp_y))
			{
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),same_color))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),opposite_color))
				{
					//console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					//console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
				}
				
				temp_x -= 1;
				temp_y = String.fromCharCode(temp_y.charCodeAt() - 1);
			}
			
			//Top Left
			temp_x = parseInt(x_axis) + 1;
			temp_y = String.fromCharCode(y_axis.charCodeAt() - 1);
			while(within_board(temp_x, temp_y))
			{
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),same_color))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),opposite_color))
				{
					//console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					//console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
				}
				
				temp_x += 1;
				temp_y = String.fromCharCode(temp_y.charCodeAt() - 1);
			}
			
			//Bottom Right
			temp_x = parseInt(x_axis) - 1;
			temp_y = String.fromCharCode(y_axis.charCodeAt() + 1);
			while(within_board(temp_x, temp_y))
			{
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),same_color))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),opposite_color))
				{
					//console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					//console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
				}
				
				temp_x -= 1;
				temp_y = String.fromCharCode(temp_y.charCodeAt() + 1);
			}
			
			document.getElementById('possible_moves').innerHTML = "<b>" + possible_moves +"</b>";
			
		}
		//************************************ Bishop ********************************************

		
		
		
		
		//************************************ Queen ********************************************
		if(selected_unit == "♛" || selected_unit == "♕")
		{		
	
			var same_color = "black";
			var opposite_color = "white";
			
			if (selected_unit == "♕")
			{
				same_color = "white";
				opposite_color = "black";
			}
			
			//LEFT
			var possible_enemy_1_x = parseInt(x_axis);
			var possible_enemy_1_y = String.fromCharCode(y_axis.charCodeAt() - 1);
			var possible_enemy_1_coord = (possible_enemy_1_x.toString()).concat(possible_enemy_1_y);
			var blocked_left = false;
			//RIGHT
			var possible_enemy_2_x = parseInt(x_axis);
			var possible_enemy_2_y = String.fromCharCode(y_axis.charCodeAt() + 1);
			var possible_enemy_2_coord = (possible_enemy_2_x.toString()).concat(possible_enemy_2_y);
			var blocked_right = false;
			
		
			//LEFT
			for(var y = possible_enemy_1_y; y >= 'A'; y=String.fromCharCode(y.charCodeAt() - 1))
			{
				if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),same_color))
				{
					break;
				}
				else if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),opposite_color))
				{
					//console.log(x_axis.concat(y));
					possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
					break;
				}
				//console.log(x_axis.concat(y));
				possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
			}
			//RIGHT
			for(var y = possible_enemy_2_y; y <= 'H'; y=String.fromCharCode(y.charCodeAt() + 1))
			{
				if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),same_color))
				{
					break;
				}
				else if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),opposite_color))
				{
					//console.log(x_axis.concat(y));
					possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
					break;
				}
				//console.log(x_axis.concat(y));
				possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
			}
			
			//BOTTOM
			for(var x = possible_enemy_1_x-1; x > 0; x--)
			{
				//console.log(	$("#".concat((x.toString()).concat(y_axis))).text()	);
				
				if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),same_color))
				{
					break;
				}
				else if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),opposite_color))
				{
					//console.log((x.toString()).concat(y_axis));
					possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
					break;
				}
				//console.log((x.toString()).concat(y_axis));
				possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
			}
			
			//TOP
			for(var x = possible_enemy_1_x+1; x < 9; x++)
			{
				//console.log(	$("#".concat((x.toString()).concat(y_axis))).text()	);
				
				if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),same_color))
				{
					break;
				}
				else if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),opposite_color))
				{
					//console.log((x.toString()).concat(y_axis));
					possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
					break;
				}
				//console.log((x.toString()).concat(y_axis));
				possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
			}
			
						//Top right
			var temp_x = parseInt(x_axis) + 1;
			var temp_y = String.fromCharCode(y_axis.charCodeAt() + 1);
			while(within_board(temp_x, temp_y))
			{
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),same_color))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),opposite_color))
				{
					//console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					//console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
				}
				
				temp_x += 1;
				temp_y = String.fromCharCode(temp_y.charCodeAt() + 1);
			}
			
			//Bottom right
			temp_x = parseInt(x_axis) - 1;
			temp_y = String.fromCharCode(y_axis.charCodeAt() - 1);
			while(within_board(temp_x, temp_y))
			{
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),same_color))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),opposite_color))
				{
					//console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					//console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
				}
				
				temp_x -= 1;
				temp_y = String.fromCharCode(temp_y.charCodeAt() - 1);
			}
			
			//Top Left
			temp_x = parseInt(x_axis) + 1;
			temp_y = String.fromCharCode(y_axis.charCodeAt() - 1);
			while(within_board(temp_x, temp_y))
			{
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),same_color))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),opposite_color))
				{
					//console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					//console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
				}
				
				temp_x += 1;
				temp_y = String.fromCharCode(temp_y.charCodeAt() - 1);
			}
			
			//Bottom Right
			temp_x = parseInt(x_axis) - 1;
			temp_y = String.fromCharCode(y_axis.charCodeAt() + 1);
			while(within_board(temp_x, temp_y))
			{
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),same_color))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),opposite_color))
				{
					//console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					//console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
				}
				
				temp_x -= 1;
				temp_y = String.fromCharCode(temp_y.charCodeAt() + 1);
			}
			
			
			document.getElementById('possible_moves').innerHTML = "<b>" + possible_moves +"</b>";
	
		}
		//************************************ Queen ********************************************
	
		
		
		//Highlight squares that the unit can possibly move to
		var split_moves = possible_moves.split(" ");
		var i;
		for(i = 0 ; i < split_moves.length; i++)
		{
			if ($.trim(split_moves[i]) != "")
			{
				//alert(split_moves[i]);
				$("#".concat(split_moves[i])).parent().addClass("red_highlight");
			}
		}
		
		$("#".concat(clicked_square)).addClass("blue_highlight");
		
	};
	
	//Checks if the coordinates are within the borad boundaries. X is an int and y is a letter
	function within_board(x_coord, y_coord)
	{
		var letters = /^[A-Ha-h]+$/;
		//alert("entered here");
		
		
		if(x_coord < 1 || x_coord > 8)
		{
			//alert("False number");
			return false;
		}
		
		if(!y_coord.match(letters))  
		{  
			//alert("False letter");
			return false;  
		}  
			
		return true;
	};
	
	//Helper method to check if a square_text has a unit of the specified color, entering "both" as the color just checks if the square is occupied
	function has_unit_of_color(square_text,color)
	{
		//console.log(square_text);
		if(color == "white")
		{
			if (square_text == String.fromCharCode(9812) || square_text == String.fromCharCode(9813) || square_text == String.fromCharCode(9814)|| square_text == String.fromCharCode(9815) || square_text == String.fromCharCode(9816) || square_text == String.fromCharCode(9817))
			{
				return true;
			}
		}
		else if (color == "black")
		{
			if(square_text == String.fromCharCode(9818) || square_text == String.fromCharCode(9819) || square_text == String.fromCharCode(9820)|| square_text == String.fromCharCode(9821) || square_text == String.fromCharCode(9822) || square_text == String.fromCharCode(9823))
			{
				return true;
			}
		}
		
		else if (color == "both")
		{
			if(square_text == String.fromCharCode(9812) || square_text == String.fromCharCode(9813) || square_text == String.fromCharCode(9814)|| square_text == String.fromCharCode(9815) || square_text == String.fromCharCode(9816) || square_text == String.fromCharCode(9817) || square_text == String.fromCharCode(9818) || square_text == String.fromCharCode(9819) || square_text == String.fromCharCode(9820)|| square_text == String.fromCharCode(9821) || square_text == String.fromCharCode(9822) || square_text == String.fromCharCode(9823))
			{
				return true;
			}
		}
		return false;
	}
	
		//Helper function to remove highlights from squares that aren't in the move_squares array
	function remove_highlights(color, move_squares)
	{
		if(color == "red")
		{
			$("div").each( function()
			{
				var dont_erase = false;
				for(counter = 0 ; counter < move_squares.length; counter++)
				{
					if($(this).children(":first").attr('id') == move_squares[counter] || ($(this).hasClass("cancel_button") && unit_is_selected))
					{
						//alert()
						dont_erase = true;
					}
				}
				
				if(!dont_erase)
				{
					$(this).removeClass("red_highlight");
				}
			}
			);
		}
		
		if(color == "blue")
		{
			$("div").each( function()
			{
				var dont_erase = false;
				for(counter = 0 ; counter < move_squares.length; counter++)
				{
					if($(this).children(":first").attr('id') == move_squares[counter])
					{
						//alert()
						dont_erase = true;
					}
				}
				
				if(!dont_erase)
				{
					$(this).removeClass("blue_highlight");
				}
			}
			);
		}
		
		if(color == "green")
		{
			$("div").each( function()
			{
				var dont_erase = false;
				for(counter = 0 ; counter < move_squares.length; counter++)
				{
					if($(this).children(":first").attr('id') == move_squares[counter])
					{
						//alert()
						dont_erase = true;
					}
				}
				
				if(!dont_erase)
				{
					$(this).removeClass("green_highlight");
				}
			}
			);
		}
		
		if(color == "replace")
		{
			$("div").each( function()
			{
				var dont_erase = false;
				for(counter = 0 ; counter < move_squares.length; counter++)
				{
					if($(this).children(":first").attr('id') == move_squares[counter])
					{
						//alert()
						dont_erase = true;
					}
				}
				
				if(!dont_erase)
				{
					if($(this).hasClass("green_highlight") && !$(this).hasClass("confirm_button"))
					{
						$(this).removeClass("green_highlight");
						$(this).addClass("red_highlight");
					}
					
				}
			}
			);
		}
		
		if(color == "all")
		{
			$("div").each( function()
			{
				var dont_erase = false;
				for(counter = 0 ; counter < move_squares.length; counter++)
				{
					if($(this).children(":first").attr('id') == move_squares[counter])
					{
						//alert()
						dont_erase = true;
					}
				}
				
				//Because move-button uses the confirm class, it needs to be excluded from color removal.
				if($(this).hasClass("move-button"))
				{
					dont_erase = true;
				}					
				
				if(!dont_erase)
				{
					$(this).removeClass("green_highlight");
					$(this).removeClass("blue_highlight");
					$(this).removeClass("red_highlight");
					$(this).removeClass("confirm");
					$(this).removeClass("cancel");
				}
			}
			);
		}
	}
