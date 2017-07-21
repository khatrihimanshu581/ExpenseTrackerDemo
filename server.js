/* 
@@@------Server.js to launch expense calulator------------@@@
@@@------developed by Himanshu Khatri---------------------@@@

*/

// Server Setup
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/'));

// START THE SERVER
var port = process.env.PORT || 1111;
app.listen(port);
console.log('Open this URl on browser : locahost:' + port);