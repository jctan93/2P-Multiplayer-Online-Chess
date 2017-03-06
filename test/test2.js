var mysql = require("mysql");

// First you need to create a connection to the db
var con = mysql.createConnection({
  host: "db4free.net",
  user: "jctan93",
  password: "mysqltest",
  database : 'jctdb'
});

con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

con.query("SELECT * FROM `Users` WHERE `Username` = 'admin'",function(err,rows){
  if(err) throw err;
  console.log('Data received from Db:\n');
	for (var i = 0; i < rows.length; i++) 
	{
	  console.log(rows[i].Username);
	  console.log(rows[i].Password);
	};
});

con.query('CREATE TABLE `Sessions`()',function(err,rows){
  if(err) throw err;
  console.log('Data received from Db:\n');
	for (var i = 0; i < rows.length; i++) 
	{
	  console.log(rows[i].Username);
	  console.log(rows[i].Password);
	};
});

con.end(function(err) {
  // The connection is terminated gracefully
  // Ensures all previously enqueued queries are still
  // before sending a COM_QUIT packet to the MySQL server.
});