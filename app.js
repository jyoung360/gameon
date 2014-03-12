
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var dust = require('dustjs-linkedin')
, cons = require('consolidate');
var users = require('/opt/node/gameon/users/all.js');

// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.use(express.favicon());
app.engine('dust', cons.dust);
app.set('template_engine', 'dust');
app.set('view engine', 'dust');
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(express.multipart());
app.use(express.cookieParser('shhhh, very secret'));
app.use(express.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/');
  }
}

var routes = require('./routes');
app.get('/', routes.index);
app.get('/restricted', restrict, routes.restricted);
app.get('/denied', routes.denied);
app.get('/week/:week/day/:day', restrict, routes.getWeek);
app.post('/week/:week/day/:day', restrict, routes.postWeek);
app.post('/login', function(req, res) { 
    var email = req.body.email.toLowerCase();
    var password = req.body.password;

    if(users[email] && users[email].password == password){
        req.session.regenerate(function(){
        req.session.user = users[email];
        res.redirect('/restricted');
        });
    }
    else {
       res.redirect('/denied');
    }    
});

app.get('/logout', function(request, response){
    request.session.destroy(function(){
        response.redirect('/');
    });
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err.stack);
});