
var clicked = false;

var turn = 0;

// Player 0 is white, 1 is black
var current_player = 0;

var clicked_square = "";
var destination_square = "";

var selected_unit = "";
var unit_is_selected = false;
var moved_unit = false;

var start_time = "";
var first_run = 1;
var start_time_datefile;




$(document).ready(function(){
	update_details();
	
	//Adds the WHITE_PIECE/BLACK_PIECE class to squares that have chess pieces o
	$("div").each( function()
	{
		if ($(this).text() == String.fromCharCode(9812) || $(this).text() == String.fromCharCode(9813) || $(this).text() == String.fromCharCode(9814)|| $(this).text() == String.fromCharCode(9815) || $(this).text() == String.fromCharCode(9816) || $(this).text() == String.fromCharCode(9817))
		{
			$(this).addClass("WHITE_PIECE");
		}
		
		else if($(this).text() == String.fromCharCode(9818) || $(this).text() == String.fromCharCode(9819) || $(this).text() == String.fromCharCode(9820)|| $(this).text() == String.fromCharCode(9821) || $(this).text() == String.fromCharCode(9822) || $(this).text() == String.fromCharCode(9823))
			$(this).addClass("BLACK_PIECE");
	}

	);

	//Highlights squares that your mouse cursor is on
	$("div.black, div.white").hover(function(){
			$( this ).addClass("highlight" );
		},
		function(){
			$(this).removeClass("highlight");
		}
	);
	
	
	//Confirm button can only be highlighted if a unit is selected
	$(".confirm_button").hover(
	
			function(){
				if(unit_is_selected)
				{
					$( this ).addClass("green_highlight" );
				}
			},
			function(){
				if(unit_is_selected)
				{
					$( this ).removeClass("green_highlight" );
				}
			}

	);

	//Function that defines the actions that happen after clicking on a square
	$(".black, .white").click(function(){
			//clicked = true;
			//alert("Current player is : " + current_player);
			
			selected_unit = $(this).text();
			//alert(selected_unit);
			
			//$('#selected_unit').append('<div id="selected_unit"> Selected Unit: ' + selected_unit + '</div>');
			
			
			//Modify the selected unit section to display the unit selected
			//If WITE
			if (selected_unit == String.fromCharCode(9812) || selected_unit== String.fromCharCode(9813) || selected_unit == String.fromCharCode(9814)|| selected_unit == String.fromCharCode(9815) || selected_unit == String.fromCharCode(9816) || selected_unit == String.fromCharCode(9817))
			{
				$('#selected_unit').html('');
				$('#selected_unit').append('<div id="selected_unit"> Selected Unit: (WHITE)' + selected_unit + '</div>');
				unit_is_selected = true;
			}
			else
			{
				//If BLACK
				if (selected_unit != "")
				{
					$('#selected_unit').html('');
					$('#selected_unit').append('<div id="selected_unit"> Selected Unit: (BLACK)' + selected_unit + '</div>');
					unit_is_selected = true;
				}
				//Else clear the display if nothing is selected
				else
				{
					$('#selected_unit').html('');
					$('#selected_unit').append('<div id="selected_unit"> Selected Unit: </div>');
					$('#possible_moves').html('');
					$('#possible_moves').append('<div id="possible_moves"></div>');
					unit_is_selected = false;
					//TODO: remove red highlights
					var move_squares = ($("#possible_moves").text()).split(" ");
					remove_highlights("red", move_squares);
				}
			}
			
			clicked_square = $(this).attr('id');
			//alert(clicked_square);
			
			move_piece();
			
			if(current_player == 0)
			{
				current_player = 1;
			}
			else
				current_player = 0;
		}
	);
	
	
	
	$.ajax({ url: "index.html", success: function(data) { alert(data); } });
});

	function HELLO() {
		alert("HELLO!");
		$("#txt").html("");
		$("#txt").append('HELLO!');
	};
	
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
		if(clicked_square != "")
		{
			if(	$("#".concat(clicked_square)).text() == ""	)
			{
				clicked_square = "";
				destination_square = "";
				
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
		$('#player').html('');
		if(current_player == 0)
		{
			$("#player").append('<div id="player"> Current Player: ' + 'White' + '</div>');
		}
		else
		$("#player").append('<div id="player"> Current Player: ' + 'Black' + '</div>');
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
		
		
		
		//************************************Black Pawn********************************************
		if(selected_unit == "♟")
		{
			//*** CHECK FOR ENEMIES THAT CAN BE CAPTURED STARTS HERE***/
			
			//NEXT ROW
			var possible_enemy_1_x = parseInt(x_axis) - 1;
			//TO THE LEFT
			var possible_enemy_1_y = String.fromCharCode(y_axis.charCodeAt() - 1);
			var possible_enemy_1_coord = (possible_enemy_1_x.toString()).concat(possible_enemy_1_y);
			
			
			
			//If it's within bounds of the board
			if(within_board(possible_enemy_1_x, possible_enemy_1_y))
			{
				//alert(possible_enemy_1_coord);
				//alert( "#".concat(possible_enemy_1_coord)	);
				//alert($("#".concat(possible_enemy_1_coord)	).text());
				
				//CHECKS IF THERE ARE ENEMY UNITS DIAGONAL TO IT
				if (has_unit_of_color($( "#".concat(possible_enemy_1_coord)).text(),"white"))
				{
					possible_moves = (possible_moves.concat(possible_enemy_1_coord)).concat(" ");
				}
			}
			
			
			
			
			
			//NEXT ROW
			var possible_enemy_2_x = parseInt(x_axis) - 1;
			//TO THE RIGHT
			var possible_enemy_2_y = String.fromCharCode(y_axis.charCodeAt() + 1);
			var possible_enemy_2_coord = (possible_enemy_2_x.toString()).concat(possible_enemy_2_y);
			
			
			
			//If it's within bounds of the board
			if(within_board(possible_enemy_2_x, possible_enemy_2_y))
			{
				//alert(possible_enemy_1_coord);
				//alert( "#".concat(possible_enemy_1_coord)	);
				//alert($("#".concat(possible_enemy_1_coord)	).text());
				
				//CHECKS IF THERE ARE ENEMY UNITS DIAGONAL TO IT
				if (has_unit_of_color($( "#".concat(possible_enemy_2_coord)).text(),"white"))
				{
					//alert("ENTERS HERE");
					possible_moves = (possible_moves.concat(possible_enemy_2_coord)).concat(" ");
				}
			}
			
			//*** CHECK FOR ENEMIES THAT CAN BE CAPTURED ENDS HERE***/
			
			
			
			
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
				
				
			//Modifies div to display all possible moves	
			$('#possible_moves').html('');
			$('#possible_moves').append('<div id="possible_moves">'+ possible_moves + '</div>');
		}
		//************************************Black Pawn********************************************
		
		
		//TODO: Modify from black to white
		//************************************White Pawn********************************************
		if(selected_unit == "♙")
		{
			//*** CHECK FOR ENEMIES THAT CAN BE CAPTURED STARTS HERE***/
			
			//PREVIOUS ROW
			var possible_enemy_1_x = parseInt(x_axis) + 1;
			//TO THE LEFT
			var possible_enemy_1_y = String.fromCharCode(y_axis.charCodeAt() - 1);
			var possible_enemy_1_coord = (possible_enemy_1_x.toString()).concat(possible_enemy_1_y);
			
			
			
			//If it's within bounds of the board
			if(within_board(possible_enemy_1_x, possible_enemy_1_y))
			{
				//alert(possible_enemy_1_coord);
				//alert( "#".concat(possible_enemy_1_coord)	);
				//alert($("#".concat(possible_enemy_1_coord)	).text());
				
				//CHECKS IF THERE ARE ENEMY UNITS DIAGONAL TO IT
				if (has_unit_of_color($( "#".concat(possible_enemy_1_coord)).text(),"black"))
				{
					possible_moves = (possible_moves.concat(possible_enemy_1_coord)).concat(" ");
				}
			}
			
			
			
			
			
			//PREVIOUS ROW
			var possible_enemy_2_x = parseInt(x_axis) + 1;
			//TO THE RIGHT
			var possible_enemy_2_y = String.fromCharCode(y_axis.charCodeAt() + 1);
			var possible_enemy_2_coord = (possible_enemy_2_x.toString()).concat(possible_enemy_2_y);
			
			
			
			//If it's within bounds of the board
			if(within_board(possible_enemy_2_x, possible_enemy_2_y))
			{
				//alert(possible_enemy_1_coord);
				//alert( "#".concat(possible_enemy_1_coord)	);
				//alert($("#".concat(possible_enemy_1_coord)	).text());
				
				//CHECKS IF THERE ARE ENEMY UNITS DIAGONAL TO IT
				if (has_unit_of_color($( "#".concat(possible_enemy_2_coord)).text(),"black"))
				{
					//alert("ENTERS HERE");
					possible_moves = (possible_moves.concat(possible_enemy_2_coord)).concat(" ");
				}
			}
			
			//*** CHECK FOR ENEMIES THAT CAN BE CAPTURED ENDS HERE***/
			
			
			
			
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
				console.log(move);
				if(within_board((parseInt(x_axis)+1), possible_enemy_1_y) && !has_unit_of_color($("#".concat(move)).text(),"both"))
				{
					possible_moves = possible_moves.concat(move);
				}
			}
			
			
			//Modifies div to display all possible moves	
			$('#possible_moves').html('');
			$('#possible_moves').append('<div id="possible_moves">'+ possible_moves + '</div>');
		}
		//************************************White Pawn********************************************
		
		
		
		
		
		//************************************Black Rook********************************************
		if(selected_unit == "♜")
		{
			//Checks horizontal axis
			//If the sides are blocked, then it cannot move
			
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
			
			/*
			//If it's within bounds of the board
			if(within_board(possible_enemy_1_x, possible_enemy_1_y))
			{
				if (has_unit_of_color($( "#".concat(possible_enemy_1_coord)).text(),"black"))
				{
					blocked_left = true;
					console.log("LEFT BLOCKED: ".concat(blocked_left));
				}
			}
			
			
			if(within_board(possible_enemy_2_x, possible_enemy_2_y))
			{
				if (has_unit_of_color($( "#".concat(possible_enemy_2_coord)).text(),"black"))
				{
					blocked_right = true;
					console.log("RIGHT BLOCKED: ".concat(blocked_right));
				}
			}
			*/
		
			//LEFT
			for(var y = possible_enemy_1_y; y >= 'A'; y=String.fromCharCode(y.charCodeAt() - 1))
			{
				if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),"black"))
				{
					break;
				}
				else if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),"white"))
				{
					console.log(x_axis.concat(y));
					possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
					break;
				}
				console.log(x_axis.concat(y));
				possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
			}
			//RIGHT
			for(var y = possible_enemy_2_y; y <= 'H'; y=String.fromCharCode(y.charCodeAt() + 1))
			{
				if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),"black"))
				{
					break;
				}
				else if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),"white"))
				{
					console.log(x_axis.concat(y));
					possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
					break;
				}
				console.log(x_axis.concat(y));
				possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
			}
			
			//BOTTOM
			for(var x = possible_enemy_1_x-1; x > 0; x--)
			{
				//console.log(	$("#".concat((x.toString()).concat(y_axis))).text()	);
				
				if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),"black"))
				{
					break;
				}
				else if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),"white"))
				{
					console.log((x.toString()).concat(y_axis));
					possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
					break;
				}
				console.log((x.toString()).concat(y_axis));
				possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
			}
			
			//TOP
			for(var x = possible_enemy_1_x+1; x < 9; x++)
			{
				//console.log(	$("#".concat((x.toString()).concat(y_axis))).text()	);
				
				if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),"black"))
				{
					break;
				}
				else if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),"white"))
				{
					console.log((x.toString()).concat(y_axis));
					possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
					break;
				}
				console.log((x.toString()).concat(y_axis));
				possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
			}
			
			
			$('#possible_moves').html('');
			$('#possible_moves').append('<div id="possible_moves">'+ possible_moves + '</div>');
			
			
		}
		//************************************Black Rook********************************************
		
		
		
		
		//************************************WHITE ROOK********************************************
		if(selected_unit == "♖")
		{
			//Checks horizontal axis
			//If the sides are blocked, then it cannot move
			
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
			
			/*
			//If it's within bounds of the board
			if(within_board(possible_enemy_1_x, possible_enemy_1_y))
			{
				if (has_unit_of_color($( "#".concat(possible_enemy_1_coord)).text(),"black"))
				{
					blocked_left = true;
					console.log("LEFT BLOCKED: ".concat(blocked_left));
				}
			}
			
			
			if(within_board(possible_enemy_2_x, possible_enemy_2_y))
			{
				if (has_unit_of_color($( "#".concat(possible_enemy_2_coord)).text(),"black"))
				{
					blocked_right = true;
					console.log("RIGHT BLOCKED: ".concat(blocked_right));
				}
			}
			*/
		
			//LEFT
			for(var y = possible_enemy_1_y; y >= 'A'; y=String.fromCharCode(y.charCodeAt() - 1))
			{
				if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),"white"))
				{
					break;
				}
				else if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),"black"))
				{
					console.log(x_axis.concat(y));
					possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
					break;
				}
				console.log(x_axis.concat(y));
				possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
			}
			//RIGHT
			for(var y = possible_enemy_2_y; y <= 'H'; y=String.fromCharCode(y.charCodeAt() + 1))
			{
				if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),"white"))
				{
					break;
				}
				else if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),"black"))
				{
					console.log(x_axis.concat(y));
					possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
					break;
				}
				console.log(x_axis.concat(y));
				possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
			}
			
			//BOTTOM
			for(var x = possible_enemy_1_x-1; x > 0; x--)
			{
				//console.log(	$("#".concat((x.toString()).concat(y_axis))).text()	);
				
				if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),"white"))
				{
					break;
				}
				else if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),"black"))
				{
					console.log((x.toString()).concat(y_axis));
					possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
					break;
				}
				console.log((x.toString()).concat(y_axis));
				possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
			}
			
			//TOP
			for(var x = possible_enemy_1_x+1; x < 9; x++)
			{
				//console.log(	$("#".concat((x.toString()).concat(y_axis))).text()	);
				
				if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),"white"))
				{
					break;
				}
				else if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),"black"))
				{
					console.log((x.toString()).concat(y_axis));
					possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
					break;
				}
				console.log((x.toString()).concat(y_axis));
				possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
			}
			
			
			$('#possible_moves').html('');
			$('#possible_moves').append('<div id="possible_moves">'+ possible_moves + '</div>');
			
			
		}
		//************************************WHITE ROOK********************************************
		
		
		
		
		
		//************************************BLACK KING********************************************
		if(selected_unit == "♚")
		{
			//A king can only move one square in all directions
			//TOP
			if(within_board(parseInt(x_axis) + 1, y_axis))
			{
				//Instead of && in the if above, i'm using a seperate if to make it look less messy
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 1).toString()).concat(y_axis))).text(),"black"))
				{
					console.log(((parseInt(x_axis) + 1).toString()).concat(y_axis));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 1).toString()).concat(y_axis))).concat(" ");
				}
			}
			//BOTTOM
			if(within_board(parseInt(x_axis) - 1, y_axis))
			{

				
				//Instead of && in the if above, i'm using a seperate if to make it look less messy
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 1).toString()).concat(y_axis))).text(),"black"))
				{
					console.log(((parseInt(x_axis) - 1).toString()).concat(y_axis));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 1).toString()).concat(y_axis))).concat(" ");
				}
			}
			//LEFT
			if(within_board(parseInt(x_axis), String.fromCharCode(y_axis.charCodeAt() - 1)))
			{

				if(! has_unit_of_color($("#".concat(((parseInt(x_axis)).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).text(),"black"))
				{
					console.log(((parseInt(x_axis)).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis)).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).concat(" ");
				}
			}			
			//RIGHT
			if(within_board(parseInt(x_axis), String.fromCharCode(y_axis.charCodeAt() + 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis)).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).text(),"black"))
				{
					console.log(((parseInt(x_axis)).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis)).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).concat(" ");
				}
			}				
			//TOP LEFT
			if(within_board(parseInt(x_axis) + 1, String.fromCharCode(y_axis.charCodeAt() - 1)))
			{
				
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).text(),"black"))
				{
					console.log(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).concat(" ");
				}
			}
			//TOP RIGHT
			if(within_board(parseInt(x_axis) + 1, String.fromCharCode(y_axis.charCodeAt() + 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).text(),"black"))
				{
					console.log(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).concat(" ");
				}
			}
			//BOTTOM LEFT
			if(within_board(parseInt(x_axis) - 1, String.fromCharCode(y_axis.charCodeAt() - 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).text(),"black"))
				{
					console.log(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).concat(" ");
				}				
			}			
			//BOTTOM RIGHT
			if(within_board(parseInt(x_axis) - 1, String.fromCharCode(y_axis.charCodeAt() + 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).text(),"black"))
				{
					console.log(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).concat(" ");
				}					
			}			
			
			$('#possible_moves').html('');
			$('#possible_moves').append('<div id="possible_moves">'+ possible_moves + '</div>');
		}
		
		//************************************BLACK KING********************************************
		


		
		//************************************WHITE KING********************************************
		if(selected_unit == "♔")
		{
			//A king can only move one square in all directions
			//TOP
			if(within_board(parseInt(x_axis) + 1, y_axis))
			{
				//Instead of && in the if above, i'm using a seperate if to make it look less messy
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 1).toString()).concat(y_axis))).text(),"white"))
				{
					console.log(((parseInt(x_axis) + 1).toString()).concat(y_axis));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 1).toString()).concat(y_axis))).concat(" ");
				}
			}
			//BOTTOM
			if(within_board(parseInt(x_axis) - 1, y_axis))
			{

				
				//Instead of && in the if above, i'm using a seperate if to make it look less messy
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 1).toString()).concat(y_axis))).text(),"white"))
				{
					console.log(((parseInt(x_axis) - 1).toString()).concat(y_axis));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 1).toString()).concat(y_axis))).concat(" ");
				}
			}
			//LEFT
			if(within_board(parseInt(x_axis), String.fromCharCode(y_axis.charCodeAt() - 1)))
			{

				if(! has_unit_of_color($("#".concat(((parseInt(x_axis)).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).text(),"white"))
				{
					console.log(((parseInt(x_axis)).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis)).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).concat(" ");
				}
			}			
			//RIGHT
			if(within_board(parseInt(x_axis), String.fromCharCode(y_axis.charCodeAt() + 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis)).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).text(),"white"))
				{
					console.log(((parseInt(x_axis)).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis)).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).concat(" ");
				}
			}				
			//TOP LEFT
			if(within_board(parseInt(x_axis) + 1, String.fromCharCode(y_axis.charCodeAt() - 1)))
			{
				
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).text(),"white"))
				{
					console.log(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).concat(" ");
				}
			}
			//TOP RIGHT
			if(within_board(parseInt(x_axis) + 1, String.fromCharCode(y_axis.charCodeAt() + 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).text(),"white"))
				{
					console.log(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).concat(" ");
				}
			}
			//BOTTOM LEFT
			if(within_board(parseInt(x_axis) - 1, String.fromCharCode(y_axis.charCodeAt() - 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).text(),"white"))
				{
					console.log(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).concat(" ");
				}				
			}			
			//BOTTOM RIGHT
			if(within_board(parseInt(x_axis) - 1, String.fromCharCode(y_axis.charCodeAt() + 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).text(),"white"))
				{
					console.log(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).concat(" ");
				}					
			}			
			
			$('#possible_moves').html('');
			$('#possible_moves').append('<div id="possible_moves">'+ possible_moves + '</div>');
		}
		//************************************WHITE KING********************************************
		


		
		//************************************BLACK KNIGHT********************************************
		if(selected_unit == "♞")
		{
			//A knight has 8 possible moves
			
			//Bottom right(left)
			if(within_board(parseInt(x_axis) - 2, String.fromCharCode(y_axis.charCodeAt() + 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).text(),"black"))
				{
					console.log(((parseInt(x_axis) - 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).concat(" ");
				}					
			}
			
			//Bottom right(right)
			if(within_board(parseInt(x_axis) - 1, String.fromCharCode(y_axis.charCodeAt() + 2)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 2)))).text(),"black"))
				{
					console.log(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 2)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 2)))).concat(" ");
				}					
			}	

			//Bottom left(left)
			if(within_board(parseInt(x_axis) - 2, String.fromCharCode(y_axis.charCodeAt() - 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).text(),"black"))
				{
					console.log(((parseInt(x_axis) - 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).concat(" ");
				}					
			}
			
			//Bottom left(right)
			if(within_board(parseInt(x_axis) - 1, String.fromCharCode(y_axis.charCodeAt() - 2)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 2)))).text(),"black"))
				{
					console.log(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 2)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 2)))).concat(" ");
				}					
			}	

			//Top right(left)
			if(within_board(parseInt(x_axis) + 2, String.fromCharCode(y_axis.charCodeAt() + 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).text(),"black"))
				{
					console.log(((parseInt(x_axis) + 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).concat(" ");
				}					
			}
			
			//Top right(right)
			if(within_board(parseInt(x_axis) + 1, String.fromCharCode(y_axis.charCodeAt() + 2)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 2)))).text(),"black"))
				{
					console.log(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 2)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 2)))).concat(" ");
				}					
			}	
			
			//Top left(right)
			if(within_board(parseInt(x_axis) + 2, String.fromCharCode(y_axis.charCodeAt() - 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).text(),"black"))
				{
					console.log(((parseInt(x_axis) + 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).concat(" ");
				}					
			}
			
			//Top left(left)
			if(within_board(parseInt(x_axis) + 1, String.fromCharCode(y_axis.charCodeAt() - 2)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 2)))).text(),"black"))
				{
					console.log(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 2)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 2)))).concat(" ");
				}					
			}	

			
			$('#possible_moves').html('');
			$('#possible_moves').append('<div id="possible_moves">'+ possible_moves + '</div>');			
		}
		//************************************BLACK KNIGHT********************************************
		
		
		
		
		
		//************************************WHITE KNIGHT********************************************
		if(selected_unit == "♘")
		{
			//A knight has 8 possible moves
			
			//Bottom right(left)
			if(within_board(parseInt(x_axis) - 2, String.fromCharCode(y_axis.charCodeAt() + 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).text(),"white"))
				{
					console.log(((parseInt(x_axis) - 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).concat(" ");
				}					
			}
			
			//Bottom right(right)
			if(within_board(parseInt(x_axis) - 1, String.fromCharCode(y_axis.charCodeAt() + 2)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 2)))).text(),"white"))
				{
					console.log(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 2)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 2)))).concat(" ");
				}					
			}	

			//Bottom left(left)
			if(within_board(parseInt(x_axis) - 2, String.fromCharCode(y_axis.charCodeAt() - 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).text(),"white"))
				{
					console.log(((parseInt(x_axis) - 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).concat(" ");
				}					
			}
			
			//Bottom left(right)
			if(within_board(parseInt(x_axis) - 1, String.fromCharCode(y_axis.charCodeAt() - 2)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 2)))).text(),"white"))
				{
					console.log(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 2)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) - 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 2)))).concat(" ");
				}					
			}	

			//Top right(left)
			if(within_board(parseInt(x_axis) + 2, String.fromCharCode(y_axis.charCodeAt() + 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).text(),"white"))
				{
					console.log(((parseInt(x_axis) + 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 1)))).concat(" ");
				}					
			}
			
			//Top right(right)
			if(within_board(parseInt(x_axis) + 1, String.fromCharCode(y_axis.charCodeAt() + 2)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 2)))).text(),"white"))
				{
					console.log(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 2)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() + 2)))).concat(" ");
				}					
			}	
			
			//Top left(right)
			if(within_board(parseInt(x_axis) + 2, String.fromCharCode(y_axis.charCodeAt() - 1)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).text(),"white"))
				{
					console.log(((parseInt(x_axis) + 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 2).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 1)))).concat(" ");
				}					
			}
			
			//Top left(left)
			if(within_board(parseInt(x_axis) + 1, String.fromCharCode(y_axis.charCodeAt() - 2)))
			{
				if(! has_unit_of_color($("#".concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 2)))).text(),"white"))
				{
					console.log(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 2)));
					possible_moves = (possible_moves.concat(((parseInt(x_axis) + 1).toString()).concat(String.fromCharCode(y_axis.charCodeAt() - 2)))).concat(" ");
				}					
			}	

			
			$('#possible_moves').html('');
			$('#possible_moves').append('<div id="possible_moves">'+ possible_moves + '</div>');
		}
		
		//************************************WHITE KNIGHT********************************************		
		
		
		
		
		
		//************************************BLACK BISHOP********************************************
		if(selected_unit == "♝")
		{
			//Can only move diagonally
			
			//Top right
			var temp_x = parseInt(x_axis) + 1;
			var temp_y = String.fromCharCode(y_axis.charCodeAt() + 1);
			while(within_board(temp_x, temp_y))
			{
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"black"))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"white"))
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					console.log((temp_x.toString()).concat(temp_y));
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
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"black"))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"white"))
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					console.log((temp_x.toString()).concat(temp_y));
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
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"black"))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"white"))
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					console.log((temp_x.toString()).concat(temp_y));
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
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"black"))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"white"))
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
				}
				
				temp_x -= 1;
				temp_y = String.fromCharCode(temp_y.charCodeAt() + 1);
			}
			
			$('#possible_moves').html('');
			$('#possible_moves').append('<div id="possible_moves">'+ possible_moves + '</div>');
			
		}
		//************************************BLACK BISHOP********************************************
		
		
		
		
		
		//************************************WHITE BISHOP********************************************
		if(selected_unit == "♗")
		{
			//Can only move diagonally
			
			//Top right
			var temp_x = parseInt(x_axis) + 1;
			var temp_y = String.fromCharCode(y_axis.charCodeAt() + 1);
			while(within_board(temp_x, temp_y))
			{
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"white"))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"black"))
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					console.log((temp_x.toString()).concat(temp_y));
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
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"white"))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"black"))
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					console.log((temp_x.toString()).concat(temp_y));
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
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"white"))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"black"))
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					console.log((temp_x.toString()).concat(temp_y));
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
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"white"))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"black"))
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
				}
				
				temp_x -= 1;
				temp_y = String.fromCharCode(temp_y.charCodeAt() + 1);
			}
			
			$('#possible_moves').html('');
			$('#possible_moves').append('<div id="possible_moves">'+ possible_moves + '</div>');
			
		}
		//************************************WHITE BISHOP********************************************

		
		
		
		
		//************************************BLACK QUEEN********************************************
		if(selected_unit == "♛")
		{		
			
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
				if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),"black"))
				{
					break;
				}
				else if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),"white"))
				{
					console.log(x_axis.concat(y));
					possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
					break;
				}
				console.log(x_axis.concat(y));
				possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
			}
			//RIGHT
			for(var y = possible_enemy_2_y; y <= 'H'; y=String.fromCharCode(y.charCodeAt() + 1))
			{
				if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),"black"))
				{
					break;
				}
				else if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),"white"))
				{
					console.log(x_axis.concat(y));
					possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
					break;
				}
				console.log(x_axis.concat(y));
				possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
			}
			
			//BOTTOM
			for(var x = possible_enemy_1_x-1; x > 0; x--)
			{
				//console.log(	$("#".concat((x.toString()).concat(y_axis))).text()	);
				
				if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),"black"))
				{
					break;
				}
				else if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),"white"))
				{
					console.log((x.toString()).concat(y_axis));
					possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
					break;
				}
				console.log((x.toString()).concat(y_axis));
				possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
			}
			
			//TOP
			for(var x = possible_enemy_1_x+1; x < 9; x++)
			{
				//console.log(	$("#".concat((x.toString()).concat(y_axis))).text()	);
				
				if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),"black"))
				{
					break;
				}
				else if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),"white"))
				{
					console.log((x.toString()).concat(y_axis));
					possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
					break;
				}
				console.log((x.toString()).concat(y_axis));
				possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
			}
			
						//Top right
			var temp_x = parseInt(x_axis) + 1;
			var temp_y = String.fromCharCode(y_axis.charCodeAt() + 1);
			while(within_board(temp_x, temp_y))
			{
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"black"))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"white"))
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					console.log((temp_x.toString()).concat(temp_y));
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
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"black"))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"white"))
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					console.log((temp_x.toString()).concat(temp_y));
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
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"black"))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"white"))
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					console.log((temp_x.toString()).concat(temp_y));
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
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"black"))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"white"))
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
				}
				
				temp_x -= 1;
				temp_y = String.fromCharCode(temp_y.charCodeAt() + 1);
			}
			
			
			$('#possible_moves').html('');
			$('#possible_moves').append('<div id="possible_moves">'+ possible_moves + '</div>');
	
		}
		//************************************BLACK QUEEN********************************************
		
		
		
		
		
		//************************************WHITE QUEEN********************************************
		if(selected_unit == "♕")
		{	
			//LEFT
			var possible_enemy_1_x = parseInt(x_axis);
			var possible_enemy_1_y = String.fromCharCode(y_axis.charCodeAt() - 1);

			//RIGHT
			var possible_enemy_2_x = parseInt(x_axis);
			var possible_enemy_2_y = String.fromCharCode(y_axis.charCodeAt() + 1);

			
		
			//LEFT
			for(var y = possible_enemy_1_y; y >= 'A'; y=String.fromCharCode(y.charCodeAt() - 1))
			{
				if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),"white"))
				{
					break;
				}
				else if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),"black"))
				{
					console.log(x_axis.concat(y));
					possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
					break;
				}
				console.log(x_axis.concat(y));
				possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
			}
			//RIGHT
			for(var y = possible_enemy_2_y; y <= 'H'; y=String.fromCharCode(y.charCodeAt() + 1))
			{
				if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),"white"))
				{
					break;
				}
				else if(has_unit_of_color($( "#".concat(x_axis.concat(y))).text(),"black"))
				{
					console.log(x_axis.concat(y));
					possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
					break;
				}
				console.log(x_axis.concat(y));
				possible_moves = (possible_moves.concat(x_axis.concat(y))).concat(" ");
			}
			
			//BOTTOM
			for(var x = possible_enemy_1_x-1; x > 0; x--)
			{
				//console.log(	$("#".concat((x.toString()).concat(y_axis))).text()	);
				
				if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),"white"))
				{
					break;
				}
				else if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),"black"))
				{
					console.log((x.toString()).concat(y_axis));
					possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
					break;
				}
				console.log((x.toString()).concat(y_axis));
				possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
			}
			
			//TOP
			for(var x = possible_enemy_1_x+1; x < 9; x++)
			{
				//console.log(	$("#".concat((x.toString()).concat(y_axis))).text()	);
				
				if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),"white"))
				{
					break;
				}
				else if(has_unit_of_color($("#".concat((x.toString()).concat(y_axis))).text(),"black"))
				{
					console.log((x.toString()).concat(y_axis));
					possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
					break;
				}
				console.log((x.toString()).concat(y_axis));
				possible_moves = (possible_moves.concat((x.toString()).concat(y_axis))).concat(" ");
			}
			
			//Top right
			var temp_x = parseInt(x_axis) + 1;
			var temp_y = String.fromCharCode(y_axis.charCodeAt() + 1);
			while(within_board(temp_x, temp_y))
			{
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"white"))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"black"))
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					console.log((temp_x.toString()).concat(temp_y));
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
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"white"))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"black"))
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					console.log((temp_x.toString()).concat(temp_y));
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
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"white"))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"black"))
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					console.log((temp_x.toString()).concat(temp_y));
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
				if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"white"))
				{
					break;
				}	
				else if(has_unit_of_color($("#".concat((temp_x.toString()).concat(temp_y))).text(),"black"))
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
					break;
				}
				else
				{
					console.log((temp_x.toString()).concat(temp_y));
					possible_moves = (possible_moves.concat((temp_x.toString()).concat(temp_y))).concat(" ");
				}
				
				temp_x -= 1;
				temp_y = String.fromCharCode(temp_y.charCodeAt() + 1);
			}
			
			$('#possible_moves').html('');
			$('#possible_moves').append('<div id="possible_moves">'+ possible_moves + '</div>');
	
		}
		//************************************WHITE QUEEN********************************************
		
		
		
		
		//Highlight squares that the unit can possibly move to
		var split_moves = possible_moves.split(" ");
		var i;
		for(i = 0 ; i < split_moves.length; i++)
		{
			if ($.trim(split_moves[i]) != "")
			{
				//alert(split_moves[i]);
				$("#".concat(split_moves[i])).addClass("red_highlight");
			}
		}
		
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
					if($(this).attr('id') == move_squares[counter])
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
	}
	
	
	
		
