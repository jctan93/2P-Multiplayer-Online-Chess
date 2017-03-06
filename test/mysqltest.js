var mysql = require("mysql");

// First you need to create a connection to the db
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

con.query('SELECT * FROM `Users`',function(err,rows){
  if(err) throw err;
  console.log('Data received from Db:\n');
	for (var i = 0; i < rows.length; i++) 
	{
	  console.log(rows[i].Username);
	  console.log(rows[i].Password);
	};
});

var user = { Username: 'testuser', Password: 'testpassword' };
con.query('INSERT INTO Users SET ?', user, function(err,res){
	if(err) {
		console.log("User exists");
	}
	else
	{
		console.log('Last insert ID:', res.insertId);
	}
  
});


con.end(function(err) {
  // The connection is terminated gracefully
  // Ensures all previously enqueued queries are still
  // before sending a COM_QUIT packet to the MySQL server.
});