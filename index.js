var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var mysql = require("mysql");

var con = mysql.createConnection({
  host: "sql6.freesqldatabase.com",
  user: "sql6148563",
  password: "5rtawrCfRd",
  database : 'sql6148563'
});

con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

update_details();

//Test login credentials, should draw from database
var test_gamestate;
var test_currentplayer;

app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/login.html');
});

app.get('/login', function(req, res){
  res.sendFile(__dirname + '/login.html');
});

app.get('/choose', function(req, res){
  res.sendFile(__dirname + '/choose_game.html');
});

app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/index.htm');
});

app.get('/game', function(req, res){
  res.sendFile(__dirname + '/game_page.html');
});

app.get('/spectate', function(req, res){
  res.sendFile(__dirname + '/spectate_game_page.html');
});

'use strict';
var crypto = require('crypto');

/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};

function saltHashPassword(userpassword) {
    var salt = genRandomString(16); /** Gives us salt of length 16 */
    var passwordData = sha512(userpassword, salt);
	var to_return = [];
	
	to_return[0] = salt;
	
   // console.log('UserPassword = '+userpassword);
   // console.log('Passwordhash = '+passwordData.passwordHash);
	to_return[1] = passwordData.passwordHash;
	
   // console.log('nSalt = '+passwordData.salt);
	
	return to_return;
}

function saltHashPasswordWithSalt(userpassword, usersalt) {
    var salt = usersalt;
    var passwordData = sha512(userpassword, salt);
	var to_return = [];
	
	to_return[0] = salt;
	
   // console.log('UserPassword = '+userpassword);
   // console.log('Passwordhash = '+passwordData.passwordHash);
	to_return[1] = passwordData.passwordHash;
	
   // console.log('nSalt = '+passwordData.salt);
	
	return to_return;
}

io.on('connection', function(socket){
	console.log('a user connected');	
	
	socket.on('join', function (data) {
		socket.join(data.ID); // We are using room of socket io
		console.log("Joined room " + data.ID);
	});
	
	socket.on('disconnect', function(){
		console.log('user disconnected');
	 });
  
	socket.on('chat message', function(msg){
		console.log('message: ' + msg);
		 io.emit('chat message', msg);
	});
	
	socket.on('global chat', function(msg){
		console.log('global chat message: ' + msg);
		 io.emit('global chat message', msg);
	});
	
	socket.on('update clicked square', function(msg){
		
		//[0] IS THE GAME ID/HASH, [1] IS THE PLAYER ID/HASH, [2] IS THE SQUARE CLICKED
		var split_string = msg.split(":");
		console.log("Transmitting current player's " + split_string[1] + " click " + split_string[2] +" to the other player and spectators of game " + split_string[0]);
		

		
		con.query("SELECT * FROM Sessions WHERE Hash = ?" ,[split_string[0]],function(err, rows){
			if(err)
			{
				throw err;
			}
			else if (rows.length != 0)
			{
				var current_player = rows[0].CurrentPlayer;
				var player_one = rows[0].PlayerOne;
				var player_two = rows[0].PlayerTwo;
				var specs = (rows[0].Spectators).split(":");
					con.query("SELECT * FROM LoginCookies WHERE Hash = ?" ,[split_string[1]],function(err, rows){
						if(err)
						{
							throw err;
						}
						else if (rows.length != 0)
						{
							var is_player_one = player_one === rows[0].Username;
							var is_player_two = player_two === rows[0].Username;
							console.log("User clicking is player one: " + (is_player_one).toString());
							console.log("User clicking is player two: " + (is_player_two).toString());
							
							// IF PLAYER ONE, TRANSMIT TO P2
							if(is_player_one)
							{
								con.query("SELECT * FROM LoginCookies WHERE Username = ?",[player_two], function(err, rows){
									if(err)
									{
										throw err;
									}
									else if(rows.length != 0)
									{
										io.sockets.in(rows[0].Hash).emit('transmit move', split_string[2]);
									}
								});
							} 
							// ELSE IT IS P2, SO TRANSMIT TO P1
							else if(is_player_two)
							{
								con.query("SELECT * FROM LoginCookies WHERE Username = ?",[player_one], function(err, rows){
									if(err)
									{
										throw err;
									}
									else if(rows.length != 0)
									{
										io.sockets.in(rows[0].Hash).emit('transmit move', split_string[2]);
									}
								});
							}
							//AND ALL SPECTATORS
							for(var i = 0; i < specs.length; i++)
							{
								io.sockets.in(specs[i]).emit('transmit move', split_string[2]);
							}
						}
					});
			}
		});
		
	});
	
	//HANDLES THE REMOVE SPECTATOR EVENT. THIS EVENT IS FIRED FROM THE CLIENT WHEN THE USER LEAVES THE CURRENT PAGE
	socket.on('remove spectator', function(msg){
		//console.log('remove spectator: ' + msg);
		
		//[0] IS THE GAME ID, [1] IS THE SPECTATOR ID
		var split_string = msg.split(":");
		console.log('remove spectator: ' + split_string[1] + " from game " + split_string[0]);
		
		con.query("SELECT * FROM Sessions WHERE Hash = ?",[split_string[0]], function(err, rows){
			if(err)
			{
				console.log("Failed to select (Spectator)");
				throw(err);
			}
			else if(rows.length != 0)
			{
				var specs = rows[0].Spectators;
				
				var to_replace = split_string[1];
				var to_replace2 = split_string[1].concat(":");
				var to_replace3 = ":".concat(split_string[1]);
				
				specs = specs.replace(new RegExp(to_replace2, 'g'), '');
				specs = specs.replace(new RegExp(to_replace3, 'g'), '');
				specs = specs.replace(new RegExp(to_replace, 'g'), '');
				
				specs = specs.replace(new RegExp("::+", 'g'), '');
				console.log("ALL SPECTATORS VIEWING THIS GAME NOW " + specs);
				
				con.query('UPDATE Sessions SET Spectators = ? WHERE Hash = ?', [specs, split_string[0]], function(err,res){
					if(err)
					{
						throw(err);
					}
					else
					{
						console.log("Updated spectators successfully!");
					}
				});
			}
		});
	});
	
	socket.on('private game chat', function(msg){
		console.log('Private Chat message: ');
		 //io.emit('chat message', msg);
		var split_string = msg.split("::;");
		var chat_message = split_string[0];
		console.log(chat_message);
		var user_submitting_chat = split_string[1];
		console.log("User sending message: " + user_submitting_chat);
		var session = split_string[2];
		console.log("Game session: " + session);
		
		con.query("SELECT * FROM Sessions WHERE Hash = ?",[session],function(err,rows){
			if(err)
			{
				throw err;
			}
			else if(rows.length != 0)
			{
				var outer_rows = rows[0];
				
				//CHECKS IF USER SUBMITTING THE TEXT MESSAGE EXISTS
				con.query("SELECT * FROM LoginCookies WHERE Hash = ?",[user_submitting_chat],function(err,rows){
					if(err)
					{
						throw err;
					}
					else if(rows.length != 0)
					{
						var player_submitting = rows[0].Username;
						console.log("player submitting: " + player_submitting);
						console.log(outer_rows.PlayerOne);
						console.log(outer_rows.PlayerTwo);
						var player_one;
						var player_two;
						var notaplayer = true;
						
						//IF THE USER EXISTS, THEN THE SERVER SENDS A QUERY TO THE DATABASE TO GET THE INFO OF THE OTHER PLAYER IN THE GAME SESSION
						if(player_submitting != outer_rows.PlayerOne)
						{
							con.query("SELECT * FROM `LoginCookies` WHERE Username = ?",[outer_rows.PlayerOne],function(err,rows){
								if(err)
								{
									throw err;
								}
								else if(rows.length != 0)
								{
									console.log("Other player is: " + rows[0].Username + " With Hash: " + rows[0].Hash);
									var to_send = player_submitting.concat(": ").concat(chat_message);
									console.log("To send: " + to_send);
									io.sockets.in(rows[0].Hash).emit('private game chat', to_send);
									player_one = rows[0].Hash;
									notaplayer = false;
								}
							});
						}
						else if(player_submitting != outer_rows.PlayerTwo)
						{
							con.query("SELECT * FROM LoginCookies WHERE Username = ?",[outer_rows.PlayerTwo],function(err,rows){
								if(err)
								{
									throw err;
								}
								else if(rows.length != 0)
								{
									
									console.log("Other player is: " + rows[0].Username + " With Hash: " + rows[0].Hash);
									var to_send = player_submitting.concat(": ").concat(chat_message);
									console.log("To send: " + to_send);
									io.sockets.in(rows[0].Hash).emit('private game chat', to_send);
									player_two = rows[0].Hash;
									notaplayer = false;
								}
							});
						}
						
						if(notaplayer)
						{
							var to_send = player_submitting.concat(": ").concat(chat_message);
							io.sockets.in(player_one).emit('private game chat', to_send);
							io.sockets.in(player_two).emit('private game chat', to_send);
						}
					}
				});
				
			}
		});
	});
	
	socket.on('get login cookie', function(msg){
		console.log('Get cookie request: ' + msg);
		
		con.query("SELECT * FROM `LoginCookies` WHERE `Hash` = " + msg,function(err,rows){
		  if(err)
		  {
			console.log("Cookie doesn't Exist");
			throw err;
		  }
		  else
		  {
			console.log('Sending cookie info to: ' + msg);
			io.sockets.in(msg).emit('get login cookie', rows);
		  }
		});
	});
  
	//Fetches info from the database to check if the login details exist, allows login if details exist + match
	socket.on('login attempt', function(msg){
		console.log('login attempt: ' + msg);
		var split_string = msg.split(":");
		//console.log(split_string[2]);
		//console.log(split_string[4]);
		
		
		con.query("SELECT * FROM `Users` WHERE `Username` = '" + split_string[2] + "'",function(err,rows){
		  if(err)
		  {
			console.log("ACCESS DENIED");
			//io.emit("login confirmation", "no");
			io.sockets.in(split_string[2]).emit("login confirmation", "no");
			//throw err;
		  }

		  else if(rows.length != 0)
		  {
			var verify = saltHashPasswordWithSalt(split_string[4], rows[0].Salt);
			//console.log('Data received from Db:\n');
			if(split_string[2] == rows[0].Username && verify[1] == rows[0].Password)
			{
				console.log("ACCESS ACCEPTED");
				
				var uid = (Date.now() + Math.random()).toString();
				uid = rows[0].Username + ":" + uid;
				var user_name = rows[0].Username;
				console.log("cookie = " + uid);
				var cookiehash = uid.hashCode();
				console.log("cookie hash: " + cookiehash);
				
				con.query("SELECT * FROM LoginCookies WHERE Username = ?",[user_name],function(err, rows){
					if(err)
					{
						throw err;
					}
					//Login cookie doesn't exist
					else if(rows.length == 0)
					{
						con.query('INSERT INTO LoginCookies SET ?', {Hash: cookiehash, Cookie: uid, Username: user_name}, function(err,res){
							if(err) {
								console.log("Cookie failed");
								throw err;
							}
							else
							{
								console.log('Cookied successfully');
								io.sockets.in(user_name).emit("session cookie", cookiehash);
								io.sockets.in(user_name).emit("login confirmation", "yes");							
							}
						});
					}
					//login cookie exists
					else
					{
						con.query('DELETE FROM LoginCookies WHERE Username = ?',[user_name], function(err,res){
							if(err) {
								console.log("Old Cookie is still ONLINE");
								throw err;
							}
							else
							{
								console.log("Old Cookie is DELETED");
								con.query('INSERT INTO LoginCookies SET ?', {Hash: cookiehash, Cookie: uid, Username: rows[0].Username}, function(err,res){
									if(err) {
										console.log("New Cookie failed");
										throw err;
									}
									else
									{
										console.log('New Cookied successfully');
										io.sockets.in(user_name).emit("session cookie", cookiehash);
										io.sockets.in(user_name).emit("login confirmation", "yes");										
									}
								});
							}
						});
					}
				});
				
				/*
				con.query('INSERT INTO LoginCookies SET ?', {Hash: cookiehash, Cookie: uid, Username: rows[0].Username}, function(err,res){
					if(err) {
						console.log("Cookie failed");
						throw err;
					}
					else
					{
						console.log('Cookied successfully');
					}
				});
				*/
				
				//io.sockets.in(rows[0].Username).emit("session cookie", cookiehash);
				//io.sockets.in(rows[0].Username).emit("login confirmation", "yes");
				
				//io.emit("session cookie", uid);
				//io.emit("login confirmation", "yes");
				
				con.query('UPDATE UsersOnline SET Status = ? WHERE Username = ?', [1, rows[0].Username], function(err,res){
					if(err) {
						console.log("User " + rows[0].Username + " is STILL OFFLINE");
						//throw err;
					}
					else
					{
							console.log("User " + rows[0].Username + " is NOW ONLINE");
					}
				  
				});
			}
			else
			{
				console.log("ACCESS DENIED");
				//io.emit("login confirmation", "no");
				io.sockets.in(split_string[2]).emit("login confirmation", "no");
			}
		  }
		  
		  else
		  {
				console.log("ACCESS DENIED");
				//io.emit("login confirmation", "no");
				io.sockets.in(split_string[2]).emit("login confirmation", "no");
		  }
		});
	});
	
	socket.on('logout attempt', function(msg){
		console.log('logout attempt from: ' + msg);
		
		var user_name;	
		con.query('SELECT Cookie FROM LoginCookies WHERE Hash = ' + msg + ";", function(err,rows){
			if(err) {
				//console.log("Cookie is still ONLINE");
			}
			else if(rows.length != 0)
			{
					user_name = (rows[0].Cookie).split(":")[0];
					console.log(	user_name	);
					
					con.query('DELETE FROM LoginCookies WHERE Hash = ' + msg + ";", function(err,res){
						if(err) {
							console.log("Cookie is still ONLINE");
						}
						else
						{
								console.log("Cookie is DELETED");
						}
					});
					

					con.query('UPDATE UsersOnline SET Status = ? WHERE Username = ?', [0, user_name], function(err,res){
						if(err) {
							console.log("User " + user_name + " is STILL ONLINE");
							//throw err;
						}
						else
						{
								console.log("User " + user_name + " is NOW OFFLINE");
						}
					});
			}
		});
	});
	
	//Checks with the database to see if the user has already been registered
	socket.on('register attempt', function(msg){
		console.log('register attempt: ' + msg);
		var split_string = msg.split(":");
		
		var hash_and_salt = saltHashPassword(split_string[4]);
		console.log("Salt & Hashed password: " + hash_and_salt);
		
		var user = { Username: split_string[2] , Password: hash_and_salt[1], Salt: hash_and_salt[0] };
		con.query('INSERT INTO Users SET ?', user, function(err,res){
			if(err) {
				console.log("User exists");
				//io.emit("register confirmation", "no");
				io.sockets.in(split_string[2]).emit("register confirmation", "no");
			}
			else
			{
				console.log('Registered successfully');
				//io.emit("register confirmation", "yes");
				io.sockets.in(split_string[2]).emit("register confirmation", "yes");
			}
		});
		
		var user = { Username: split_string[2] , Status: false };
		con.query('INSERT INTO UsersOnline SET ?', user, function(err,res){
			if(err) {
				console.log("User exists in UsersOnline");
			}
			else
			{
				console.log('Successfully registered in UsersOnline');
			}
		});
	});
	
	//TODO
	//Only updates the database if the player requesting to join isn't the session owner (to prevent P1 and P2 from being the same person)
	socket.on('join attempt', function(msg){
		console.log("Join attempt: " + msg);
		var split_string = msg.split(":");
		console.log("Join attempt by user " + split_string[0]);
		console.log("Attempting to join lobby by " + split_string[1] + " With SessionID " + split_string[3]+":"+split_string[4]);

		con.query("SELECT * FROM `Sessions` WHERE `PlayerOne` = ? AND `PlayerTwo` = ? AND `SessionID` = ?",[split_string[1],split_string[2],split_string[3]+":"+split_string[4]],function(err,rows){
		  if(err)
		  {
			console.log("Session DOESN'T EXIST");
			throw err;
		  }
		  else
		  {
			if(rows.length != 0)
			{	  
				console.log(rows.length);
				console.log("Session EXISTS, Hash is: " + rows[0].Hash);
				
				//If the user is trying to rejoin his/her own lobby
				if(split_string[0] == split_string[1])
				{
					io.sockets.in(split_string[5]).emit('join confirmation', "Own Lobby:" + rows[0].Hash);
					console.log("Owner "+ split_string[4] +" rejoining lobby");
				}
				else
				{
					//If the user is trying to rejoin the P2 spot
					if(split_string[2] == split_string[0])
					{
						io.sockets.in(split_string[5]).emit('join confirmation', "Rejoining lobby:" + rows[0].Hash);
						console.log("P2 rejoining lobby");
					}
					//Only allows user to join if P2 slot isn't occupied
					else if(split_string[2] != "Waiting for P2")
					{
						io.sockets.in(split_string[5]).emit('join confirmation', "Lobby full:" + rows[0].Hash);
						console.log("Cannot join full lobby");
					}
					else
					{
						var session_id = split_string[3]+ ":" +split_string[4];
						con.query('UPDATE Sessions SET PlayerTwo = ? WHERE PlayerOne = ? AND SessionID = ?', [split_string[0],split_string[1], session_id], function(err,res){
							if(err) {
								throw err;
							}
							else
							{
								console.log(res);
								console.log('Successfully updated session');
								io.sockets.in(split_string[5]).emit('join confirmation', "Join successful:" + rows[0].Hash);
								
								con.query('SELECT * FROM LoginCookies WHERE Username = ?',[split_string[1]], function(err, rows){
									if(err)
									{
										throw err;
									}
									else
									{
										if(rows.length != 0)
										{
											console.log("P1 details: " + rows[0]);
											console.log("Pushed update to Player One: " + rows[0].Hash);
											io.sockets.in(rows[0].Hash).emit('P2 Joined',split_string[0] );
										}
									}
								});
							}
						});
					}
				}
			}
			else
			{
				console.log("Session DOESN'T EXIST");
				io.sockets.in(split_string[5]).emit('join confirmation', "default:" + "Session DOESN'T EXIST");
			}
		  }
		});
	});
	
	//HANDLES THE SPECTATE EVENT
	socket.on('spectate attempt', function(msg){
		console.log("Spectate attempt: " + msg);
		var split_string = msg.split(":");
		console.log("Spectate attempt by user " + split_string[5]);
		console.log("Attempting to spectate lobby by " + split_string[1] + " With SessionID " + split_string[3]+":"+split_string[4]);
		
		con.query("SELECT * FROM `Sessions` WHERE `PlayerOne` = ? AND `PlayerTwo` = ? AND `SessionID` = ?",[split_string[1],split_string[2],split_string[3]+":"+split_string[4]],function(err,rows){
		  if(err)
		  {
			console.log("Session DOESN'T EXIST");
			io.sockets.in(split_string[5]).emit('spectate confirmation', "failed:" + "Session DOESN'T EXIST");
			throw err;
		  }
		  else
		  {
			if(rows.length != 0)
			{	  
				//console.log(rows.length);
				var hash_temp = rows[0].Hash;
				//console.log("Session EXISTS, Hash is: " + rows[0].Hash);
				//io.sockets.in(split_string[5]).emit('spectate confirmation', "allowed:" + rows[0].Hash);
				
				var spectators = rows[0].Spectators;
				console.log("Spectator list: " + spectators);
							
				if(!spectators.includes(split_string[5]))
				{
					console.log("USER ISN'T CURRENTLY SPECTATING");
					
						if(spectators.length > 0)
						{
							spectators = spectators.concat(":").concat(split_string[5]);
						}
						else
						{
							spectators = split_string[5];
						}
				}
				else
				{
					console.log("USER IS CURRENTLY SPECTATING");
				}
				
				con.query('UPDATE `Sessions` SET Spectators = ? WHERE Hash = ?', [spectators, rows[0].Hash], function(err,res){
					if(err) {
						console.log("Failed to update spectators");
						//throw err;
					}
					else
					{
						console.log("Session EXISTS, Hash is: " + hash_temp);
						io.sockets.in(split_string[5]).emit('spectate confirmation', "allowed:" + hash_temp);
					}
				  
				});
			}
			else
			{
				console.log("Session DOESN'T EXIST");
				io.sockets.in(split_string[5]).emit('spectate confirmation', "failed:" + "Session DOESN'T EXIST");
			}
		  }
		});
	});
	
	
	socket.on('get game_session details', function(msg){
		console.log('get game_session details' + msg);
		var user = msg.split(":")[0];
		var game_session = msg.split(":")[1];
		
		con.query("SELECT * FROM `Sessions` WHERE `Hash` = ? ",[game_session],function(err,rows){
			if(err)
			{
				throw err;
			}
			else
			{
				//console.log(rows[0]);
				var to_return  = rows[0].PlayerOne + ":::" + rows[0].PlayerTwo + ":::" + rows[0].Board + ":::" + rows[0].Info + ":::" + rows[0].CurrentPlayer;
				//console.log("To return " + to_return);
				io.sockets.in(user).emit('get game_session details', to_return);
			}
		});
	});
	
	//CHECKS WHETHER THE USER CURRENTLY ATTEMPTING A MOVE IS THE CURRENT PLAYER
	socket.on('check validity', function(msg){
		console.log("Check validity: " + msg);
		var player_cookie = msg.split(":")[0];
		var game_cookie = msg.split(":")[1];
		
		con.query("SELECT * FROM LoginCookies WHERE Hash = ?",[player_cookie],function(err, rows){
			if(err)
			{
				throw err;
			}
			else if(rows.length != 0)
			{
				var current_user = rows[0].Username;
				console.log("Current user attempting to move is: " + current_user);
				
				con.query("SELECT * FROM Sessions WHERE Hash = ?", [game_cookie],function(err, rows){
					if(err)
					{
						throw err;
					}
					else
					{
						//console.log("Current Player: " + rows[0].CurrentPlayer);
						
						//console.log("Player One: " + rows[0].PlayerOne);
						//console.log("Player Two: " + rows[0].PlayerTwo);
						
						var update_player = false;
						
						if(rows[0].CurrentPlayer == "PlayerOne")
						{
							console.log("Player One matches : " );
							console.log(rows[0].PlayerOne === current_user);
							if(rows[0].PlayerOne === current_user)
							{
								
								//io.sockets.in(user).emit('get game_session details', to_return);
								io.sockets.in(player_cookie).emit('check validity', "yes");
								update_player = true;
								
								console.log("Updating current player!");
							
								con.query('UPDATE Sessions SET CurrentPlayer = ? WHERE Hash = ?', ["PlayerTwo", game_cookie], function(err,res){
									if(err) {
											console.log("Failed to change Player1 to Player2");
									}
									else
									{
											console.log("Player1 Changed to Player2");
									}
								  
								});

							}
							else
							{
								io.sockets.in(player_cookie).emit('check validity', "no");
							}
							//console.log("*"+rows[0].PlayerOne+"*");
							//console.log("*"+current_user+"*");
						}
						else if (rows[0].CurrentPlayer == "PlayerTwo")
						{
							console.log("Player Two matches : " );
							console.log(rows[0].PlayerTwo === current_user);
							
							if(rows[0].PlayerTwo === current_user)
							{
								io.sockets.in(player_cookie).emit('check validity', "yes");
								update_player = true;
								

								con.query('UPDATE Sessions SET CurrentPlayer = ? WHERE Hash = ?', ["PlayerOne", game_cookie], function(err,res){
									if(err) {
											console.log("Failed to change Player2 to Player1");
									}
									else
									{
											console.log("Player2 Changed to Player1");
									}
								  
								});
							}
							else
							{
								io.sockets.in(player_cookie).emit('check validity', "no");
							}
						}
						
						if(update_player)
						{
							
						}
					}
				});
			}
		});
	});
	
	//Saves state of board in the database and pushes the update to the other player
	socket.on('game state board', function(msg){
		//console.log(msg);
		var to_split = msg.split(":::");
		console.log("Session: " + to_split[0]);
		console.log("Game state: "+ to_split[1]);
		//test_gamestate = to_split[1];
		
		con.query('UPDATE Sessions SET Board = ? WHERE Hash = ?', [to_split[1], to_split[0]], function(err,res){
			if(err) {
				console.log("Update Board Failed");
				console.log(err);
				//throw err;
			}
			else
			{
				console.log("Update Board worked");
				
				//Gets info about the game session from the database and pushes the updated data to the correct player
				con.query('SELECT * FROM Sessions WHERE Hash = ?',[to_split[0]], function(err,rows){
					if(err)
					{
						console.log("FAILED TO SELECT SESSION[IN GAME socket.on('game state board')]");
					}
					//If the session was successfully selected
					else if(rows.length != 0)
					{
						console.log("Player to push updates to is: " + rows[0].CurrentPlayer) ;
						if(rows[0].CurrentPlayer === "PlayerTwo")
						{
							
							var user_to_push = rows[0].PlayerTwo;
							
							//Gets info from the DB about which socket room to push the update to
							con.query("SELECT * FROM LoginCookies WHERE Username = ?",[user_to_push],function(err,rows){
								if(err)
								{
									console.log("FAILED TO SELECT FROM LOGIN COOKIES[IN 'game state board']");
								}
								else if(rows.length != 0)
								{
									var user_to_push_cookie = rows[0].Hash;
									
									console.log("Pushing Board Update to PlayerTwo: " + user_to_push + " WITH COOKIE VALUE: " + user_to_push_cookie);
									
									io.sockets.in(user_to_push_cookie).emit('update board', to_split[1]);
								}
							})
						}
						else if(rows[0].CurrentPlayer === "PlayerOne")
						{
							var user_to_push = rows[0].PlayerOne;
							
							//Gets info from the DB about which socket room to push the update to
							con.query("SELECT * FROM LoginCookies WHERE Username = ?",[user_to_push],function(err,rows){
								if(err)
								{
									console.log("FAILED TO SELECT FROM LOGIN COOKIES[IN 'game state board']");
								}
								else if(rows.length != 0)
								{
									var user_to_push_cookie = rows[0].Hash;
									
									console.log("Pushing Board Update to PlayerOne: " + user_to_push + " WITH COOKIE VALUE: " + user_to_push_cookie);
									
									io.sockets.in(user_to_push_cookie).emit('update board', to_split[1]);
								}
							})
						}
						
						//PUSHES DATA TO THE SPECTATORS
						var specs = rows[0].Spectators;
						var split_string = specs.split(":");
						
						for(var i = 0; i < split_string.length; i++)
						{
							io.sockets.in(split_string[i]).emit('update board', to_split[1]);
						}
						
					}
				})
				
				
				
			}
		});
		
		console.log("Game state board end");
	});
	
	//Updates info tab info in the database and pushes the data to the other player
	socket.on('game state popup', function(msg){
		//console.log(msg);
		var to_split = msg.split(":?");
		//console.log("Popup: " + to_split[0]);
		console.log("Game state: "+ to_split[1]);
		//test_gamestate = to_split[1];
		
		con.query('UPDATE Sessions SET Info = ? WHERE Hash = ?', [to_split[1], to_split[0]], function(err,res){
			if(err) {
				console.log("Update Info Failed");
				console.log(err);
				//throw err;
			}
			else
			{
				console.log("Update Info worked");
				//Gets info about the game session from the database and pushes the updated data to the correct player
				con.query('SELECT * FROM Sessions WHERE Hash = ?',[to_split[0]], function(err,rows){
					if(err)
					{
						console.log("FAILED TO SELECT SESSION[IN GAME socket.on('game state board')]");
					}
					//If the session was successfully selected
					else if(rows.length != 0)
					{
						console.log("Player to push updates to is: " + rows[0].CurrentPlayer) ;
						if(rows[0].CurrentPlayer === "PlayerTwo")
						{
							
							var user_to_push = rows[0].PlayerTwo;
							
							//Gets info from the DB about which socket room to push the update to
							con.query("SELECT * FROM LoginCookies WHERE Username = ?",[user_to_push],function(err,rows){
								if(err)
								{
									console.log("FAILED TO SELECT FROM LOGIN COOKIES[IN 'game state board']");
								}
								else if(rows.length != 0)
								{
									var user_to_push_cookie = rows[0].Hash;
									
									console.log("Pushing Info Tab Update to PlayerTwo: " + user_to_push + " WITH COOKIE VALUE: " + user_to_push_cookie);
									
									io.sockets.in(user_to_push_cookie).emit('update pop up', to_split[1]);
								}
							})
						}
						else if(rows[0].CurrentPlayer === "PlayerOne")
						{
							var user_to_push = rows[0].PlayerOne;
							
							//Gets info from the DB about which socket room to push the update to
							con.query("SELECT * FROM LoginCookies WHERE Username = ?",[user_to_push],function(err,rows){
								if(err)
								{
									console.log("FAILED TO SELECT FROM LOGIN COOKIES[IN 'game state board']");
								}
								else if(rows.length != 0)
								{
									var user_to_push_cookie = rows[0].Hash;
									
									console.log("Pushing Info Tab Update to PlayerOne: " + user_to_push + " WITH COOKIE VALUE: " + user_to_push_cookie);
									
									io.sockets.in(user_to_push_cookie).emit('update pop up', to_split[1]);
								}
							})
						}
						
						//PUSHES DATA TO THE SPECTATORS
						var specs = rows[0].Spectators;
						var split_string = specs.split(":");
						
						for(var i = 0; i < split_string.length; i++)
						{
							io.sockets.in(split_string[i]).emit('update pop up', to_split[1]);
						}
					}
				})
			}
		});
		
		console.log("Game state Info end");
	});
	
	//SHOULD BE SAVING THIS IN A DATABASE BUT USING TEMP VARIABLES FOR NOW
	socket.on('current player', function(msg){
		test_currentplayer = msg;
		console.log("Received and saved current player");
	});
	
	socket.on("resume game", function(msg)
	{
		console.log("Client requesting data to resume game");
		if(test_gamestate)
		{
			console.log("Available");
			//io.emit("game state", test_gamestate);
			//io.emit("current player", test_currentplayer);
			
			io.sockets.in(msg).emit("game state", test_gamestate);
			io.sockets.in(msg).emit("current player", test_currentplayer);
			
		}
		else
		{
			console.log("Not Available");
			
			io.sockets.in(msg).emit("game state", "NO");
			//io.emit("game state", "NO");
		}
		
	});
	
	//Event where user tries to create a new lobby
	socket.on('create game', function(msg)
	{
		console.log("User attempting to create lobby: " + msg);
		
		//var split_string = msg.split(":");
		
		//console.log(split_string[0]);
		//console.log(split_string[1]);
		//console.log(split_string[2]);
		
		con.query("SELECT * FROM `LoginCookies` WHERE `Hash` = " + msg,function(err,rows){
		  if(err)
		  {
			console.log("Login Cookie doesn't Exist");
			throw err;
		  }
		  else
		  {
			  var Player_One = (rows[0].Cookie).split(":")[0];
			  var Player_Two = "Waiting for P2";
			  var Session_ID = rows[0].Cookie;
			  var Data = "";
			  var joined_string = Player_One + ":" + Player_Two + ":" + Session_ID;
			  console.log("String to hash is : " + joined_string);
			  var hashed_lobby_string = joined_string.hashCode();
			  console.log("Hashed string is : " + hashed_lobby_string)
			  
			  
			con.query('INSERT INTO Sessions SET ?', { PlayerOne: Player_One , PlayerTwo: Player_Two, SessionID: rows[0].Cookie, Board:"", Info:"", Hash: hashed_lobby_string}, function(err,res){
				if(err) {
					console.log("Failed to create session");
					console.log(err);
					io.sockets.in(msg).emit('create-lobby', "no");
					//io.sockets.in(split_string[2]).emit("register confirmation", "no");
				}
				else
				{
					console.log('Created session successfully');
					io.sockets.in(msg).emit('create-lobby',hashed_lobby_string);
					//io.sockets.in(split_string[2]).emit("register confirmation", "yes");
				}
		  
			});
			//io.sockets.in(msg).emit('get login cookie', rows);
		  }
		});
		
		/*
		con.query('INSERT INTO Sessions SET ?', { PlayerOne: split_string[0] , PlayerTwo: split_string[1], SessionID: split_string[2] + ":" + split_string[3], Data:""}, function(err,res){
			if(err) {
				console.log("Failed to create session");
				io.sockets.in(split_string[0]).emit('create-lobby', "no");
				//io.sockets.in(split_string[2]).emit("register confirmation", "no");
			}
			else
			{
				console.log('Created session successfully');
				io.sockets.in(split_string[0]).emit('create-lobby', split_string[0] + ":" + split_string[1] + ":" + split_string[2] + ":" + split_string[3]);
				//io.sockets.in(split_string[2]).emit("register confirmation", "yes");
			}
		  
		});
		*/

	});
	
	//Request from client for all the available lobbies
	socket.on('get lobbies', function(msg)
	{
		console.log("Get lobbies request from " + msg);
		con.query("SELECT * FROM `Sessions`",function(err,rows){
		  if(err)
		  {
			console.log("ACCESS DENIED");
			//io.sockets.in(split_string[2]).emit("login confirmation", "no");
			throw err;
		  }

		  else
		  {
			io.sockets.in(msg).emit("lobbies", rows);
		  }
		});
	});
	
	//Request from client for all users that are online
	socket.on('get users online', function(msg)
	{
		con.query("SELECT `Username` FROM `UsersOnline` WHERE `Status` = 1",function(err,rows){
		  if(err)
		  {
			console.log("ACCESS DENIED");
			//io.sockets.in(split_string[2]).emit("login confirmation", "no");
			throw err;
		  }

		  else
		  {
			io.sockets.in(msg).emit('users online', rows);
		  }
		});
	});
});

con.on('close', function(err) {
  if (err) {
    // Oops! Unexpected closing of connection, lets reconnect.
    con = mysql.createConnection(con.config);
  } else {
    console.log('Connection closed normally.');
  }
});

http.listen( process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});

//REFRESHES CONNECTION TO THE DATABASE EVERY MINUTE SO IT DOESN'T DISCONNECT AFTER A PERIOD OF INACTIVITY
function update_details()
{
	con.query("SELECT 1",function(err,rows){
	  if(err)
	  {
	  }
	  else
	  {
		  console.log("REFRESHING DB CONNECTION");
	  }
	});
		
	//Recursive call	
	var t = setTimeout(update_details, 60000);
};

//HELPER FUNCTION TO GENERATE HASHES
String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};