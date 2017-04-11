$(document).ready(function(){
	
	 if(getCookie("login_cookie"))
	 {
		 console.log("Cookie exists? ".concat(getCookie("login_cookie")));
		 window.location="/choose";
	 }
	 else
	 {
		 console.log("Cookie doesn't exist");
	 }

	//console.log("READY!");
	var socket = io();
	var temp;
	var one = 1;
	  
	$("#username").click(function()
		{
			$("#system-message").css("display","none");
		}
	);
	 
	$('button[type=submit]').click(function (e) {
		var button = $(this);
		console.log(button);
		buttonForm = button.closest('form');
		buttonForm.data('submittedBy', button);
	});	 
	
	
	$(document).on('click', '#login-global-chat-button', function(){
		$('#login-global-chat-button').addClass("selected-tab");
		$( "#login-register-button").removeClass("selected-tab");
		
		$(".login-form").css('display', 'none')
		$("#chat-tab").css('display', 'inline-block')
		
	});
	
	$(document).on('click', '#login-register-button', function(){
		$('#login-register-button').addClass("selected-tab");
		$( "#login-global-chat-button").removeClass("selected-tab");
		
		$("#chat-tab").css('display', 'none')
		$(".login-form").css('display', 'inline-block')
	});
	
	
	$(document).on('click', '#login-chat-input', function(){
		if(document.getElementById("login-name-input").value != '')
		{
			if(!$(".login-chat-send-button").hasClass("chat-send-button"))
			{
				$(".login-chat-send-button").addClass("chat-send-button");
			}
		}
		else
		{
			$(".login-chat-send-button").removeClass("chat-send-button");
		}
	});
	
	
   $(document).on('submit', 'form', function() {

		if($(this).attr("name") == "login-form")
		{
			var form = $(this);
			var submittedBy = form.data('submittedBy') || form.find('button[type=submit]:first');
			if(submittedBy.val() == 1)
			{
				if ($('#username').val() && $('#password').val()) 
				{
					var message_to_send = "login:username:".concat($('#username').val().concat(":password:").concat($('#password').val()));
					console.log(message_to_send);
					
					temp = $('#username').val();
					socket.emit('join', {ID: temp});
					
					socket.emit('login attempt', message_to_send);
					$('#username').val('');
					$('#password').val('');
					return false;
				}
				else
					alert("PLEASE FILL IN ALL THE REQUIRED FIELDS");				
			}
			else if(submittedBy.val() == 2)
			{
				if ($('#username').val() && $('#password').val()) 
				{
					var message_to_send = "register:username:".concat($('#username').val().concat(":password:").concat($('#password').val()));
					console.log(message_to_send);
					
					temp = $('#username').val();
					socket.emit('join', {ID: temp});
					
					socket.emit('register attempt', message_to_send);
					$('#username').val('');
					$('#password').val('');
					return false;
				}
				else
					alert("PLEASE FILL IN ALL THE REQUIRED FIELDS");
			}
			
			$('#username').val('');
			$('#password').val('');
		}
		
		else if($(this).attr("name") == "chat-form")
		{
			if(document.getElementById("login-name-input").value != '')
			{
				var temp = document.getElementById("login-name-input").value;
				socket.emit('join', {ID: temp});
				
				var chat_message = document.getElementById("login-chat-input").value;
				chat_message = chat_message.concat("::;").concat(temp);
				socket.emit('global chat', chat_message);
			}
			
			$('#login-chat-input').val('');
		}
		return false;
     });
 
 /*
	  $('#login-button').click(function(){
		if ($('#username').val() && $('#password').val()) 
		{
			var message_to_send = "login:username:".concat($('#username').val().concat(":password:").concat($('#password').val()));
			console.log(message_to_send);
			
			temp = $('#username').val();
			socket.emit('join', {ID: temp});
			
			socket.emit('login attempt', message_to_send);
			$('#username').val('');
			$('#password').val('');
			return false;
		}
		else
			console.log("PLEASE FILL IN ALL THE REQUIRED FIELDS");
	  });
	  
	  $('#register-button').click(function(){
		if ($('#username').val() && $('#password').val()) 
		{
			var message_to_send = "register:username:".concat($('#username').val().concat(":password:").concat($('#password').val()));
			console.log(message_to_send);
			
			temp = $('#username').val();
			socket.emit('join', {ID: temp});
			
			socket.emit('register attempt', message_to_send);
			$('#username').val('');
			$('#password').val('');
			return false;
		}
		else
			console.log("PLEASE FILL IN ALL THE REQUIRED FIELDS");
	  });
*/	  
	socket.on("chat message", function(msg){
		console.log("Message: " + msg);
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

	socket.on("login confirmation", function(msg){
	if(msg == "yes")
	{
		console.log("LOGIN ACCEPTED");
		document.getElementById("system-message").innerHTML = "LOGIN ACCEPTED"
		$("#system-message").css("display", "inline-block");
		$("#system-message").css("display", "inline-block");
		$("#system-message").css("background", "#7cd600");
		
		//Refers to the main page
		window.location.replace("/choose");
		//window.location="/game_page.html";
	}
	else
	{
		$("#system-message").css("background", "#ff3019");
		document.getElementById("system-message").innerHTML = "INCORRECT DETAILS"
		$("#system-message").css("display", "inline-block");
	}

	});

	socket.on("register confirmation", function(msg){
		if(msg == "yes")
		{
			console.log("SUCCESSFULLY REGISTERED");
			document.getElementById("system-message").innerHTML = "SUCCESSFULLY REGISTERED"
			$("#system-message").css("display", "inline-block");
			$("#system-message").css("display", "inline-block");
			$("#system-message").css("background", "#7cd600");
		}
		else
		{
			$("#system-message").css("background", "#ff3019");
			document.getElementById("system-message").innerHTML = "USER EXISTS"
			$("#system-message").css("display", "inline-block");
		}
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
 
