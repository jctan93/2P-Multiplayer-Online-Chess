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
		}
		
		$('#username').val('');
		$('#password').val('');
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
	  
	  socket.on("login confirmation", function(msg){
		if(msg == "yes")
		{
			console.log("LOGIN ACCEPTED");
			document.getElementById("system-message").innerHTML = "LOGIN ACCEPTED"
			$("#system-message").css("display", "inline-block");
			$("#system-message").css("display", "inline-block");
			$("#system-message").css("background", "#7cd600");
			
			//Refers to the main page
			window.location.replace("/choose_game.html");
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
 
