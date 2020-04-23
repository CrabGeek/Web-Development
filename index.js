// YOU CAN USE THIS FILE AS REFERENCE FOR SERVER DEVELOPMENT

// include the express module
var express = require("express");

// create an express application
var app = express();

// helps in extracting the body portion of an incoming request stream
var bodyparser = require('body-parser');

// fs module - provides an API for interacting with the file system
var fs = require("fs");

// helps in managing user sessions
var session = require('express-session');

// native js function for hashing messages with the SHA-256 algorithm
var crypto = require('crypto');

// include the mysql module
var mysql = require("mysql");

var flag = '0';

// apply the body-parser middleware to all incoming requests
app.use(bodyparser());

// use express-session
// in mremory session is sufficient for this assignment
app.use(session({
  secret: "csci4131secretkey",
  saveUninitialized: true,
  resave: false}
));

var con = mysql.createConnection({
  host: "cse-larry.cse.umn.edu",
  user: "C4131S20U139",
  password: "19351",
  database: "C4131S20U139",
  port: 3306
});

// server listens on port 9007 for incoming connections
app.listen(9865, () => console.log('Listening on port 9865!'));

app.get('/',function(req, res) {
  res.sendFile(__dirname + '/client/welcome.html');
  flag = '1';
});

app.get('/index',function(req, res) {
  //Add Details
  if(req.session.login === undefined || req.session.login === 0) {
    res.redirect("/login");
  } else {
    res.sendFile(__dirname + '/client/index.html', function(err) {
      if(err) {
          throw(err);
      }
    });
  }
});


// // GET method route for the contact page.
// It serves contact.html present in client folder
app.get('/contact',function(req, res) {
  //Add Details
  if(req.session.login === undefined || req.session.login === 0) {
    res.redirect("/login");
  } else {
    res.sendFile(__dirname + '/client/contact.html', function(err) {
      if(err) {
          throw(err);
      }
    });
  }
});

// GET method route for the addContact page.
// It serves addContact.html present in client folder
app.get('/addContact',function(req, res) {
  //Add Details
  if(req.session.login === undefined || req.session.login === 0) {
    res.redirect("/client/login.html");
  } else {
    res.sendFile(__dirname + '/client/addContact.html', function(err) {
      if(err) {
          throw(err);
      }
    });
  }
});
// //GET method for stock page
app.get('/stock', function (req, res) {
  //Add Details
  if(req.session.login === undefined || req.session.login === 0) {
    res.redirect("/login");
  } else {
    res.sendFile(__dirname + '/client/stock.html', function(err) {
      if(err) {
          throw(err);
      }
    });
  }
});

app.get('/client',function(req, res) {
  //Add Details
  if(req.session.login === undefined || req.session.login === 0) {
    res.redirect("/login");
  }
});

// GET method route for the login page.
// It serves login.html present in client folder
app.get('/login',function(req, res) {
  //Add Details
  res.sendFile(__dirname + '/client/login.html', function(err) {
    if(err) {
        throw(err);
    }
  });
});

app.get('/getFlag',function(req, res) {
  res.status(200).send(flag);
  flag = '1';
})

// GET method to return the list of contacts
// The function queries the tbl_contacts table for the list of contacts and sends the response back to client
app.get('/getListOfContacts', function(req, res) {
  //Add Details
  var sql = "SELECT * FROM tbl_contacts"
  con.query(sql, function(err, result) {
    if(err) {
      throw err;
    }
    console.log(result.length);
    if(result.length == 0) {
      console.log("Do not have any contact right now");
    }
    else {
      res.send(result);
    }
  });
});

// // POST method to insert details of a new contact to tbl_contacts table
app.post('/postContact', function(req, res) {
  //Add Details
  var contact_name = "'" + req.body.contactName + "'";
  var contact_email = "'" + req.body.email + "'";
  var contact_address = "'" + req.body.address + "'";
  var contact_phone = "'" + req.body.phoneNumber + "'";
  var contact_place = "'" + req.body.favoritePlace + "'";
  var contact_url = "'" + req.body.favoritePlaceURL + "'";
  var sql = 'INSERT INTO tbl_contacts (contact_name, contact_email, contact_address, contact_phone, ' +
  'contact_favoriteplace, contact_favoriteplaceurl) VALUES ' + '('+ contact_name +','+ contact_email + ','
  + contact_address +',' + contact_phone + ',' + contact_place + ',' + contact_url + ')';

  con.query(sql, function(err, result) {
    if(err) {
      throw err;
    }
    console.log("Insert contact information!");
    res.redirect('/contact');
  });
});

// POST method to validate user login
// upon successful login, user session is created
app.post('/sendLoginDetails', function(req, res) {
  //Add Details
  var pwd = req.body.Password;
  var theLogin = '"' + req.body.Username + '"';
  var sql = 'SELECT * FROM tbl_accounts WHERE acc_login = ' + theLogin;
  var hashPwd = crypto.createHash('sha256').update(pwd).digest('base64');
  if(con.state === 'disconnected') {
    con.connect(function(err) {
      if (err) {
          throw err;
      }
      console.log("Connect!");
    });
  }
  con.query(sql, function(err, result) {
    if(err) {
      throw err;
    }
    if(result.length == 0) {
        console.log ("Can not find User");
        flag = '0'
        req.session.login = 0;
        res.redirect("/login");
    } else {
      if(result[0].acc_password === hashPwd) {
        console.log("Valid!");
        flag = '1';
        req.session.login = 1;
        res.redirect("/contact");
      } else {
        console.log ("Invalid password");
        flag = '0';
        req.session.login = 0;
        res.redirect("/login");
      }
    }
  });
});


// log out of the application
// destroy user session
app.get('/logout', function(req, res) {
  //Add Details
  req.session.destroy();
  flag = '1';
  res.redirect("/login")
});

// // middle ware to serve static files
app.use('/client', express.static(__dirname + '/client'));


// // function to return the 404 message and error to client
app.get('*', function(req, res) {
  // add details
  res.status(404);
  res.send();
});
