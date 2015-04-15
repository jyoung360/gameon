var async = require('async');
var moment = require('moment');
var games = require('../lib/games.js');
var redis = require('redis'),
client = redis.createClient();
client.on("error", function (err) {
    console.log("Error " + err);
});

exports.index = function(req, res) {
	games.getGames(function(err,gameData) {
		var renderObj = {
			user: req.session.user,
			games: gameData
		};
		res.render('adminIndex', renderObj);
	});
}

exports.editGame = function(req, res) {
	games.getGame(req.params.gameName,function(err,gameData,teamData,userData) {
		var renderObj = {
			user: req.session.user,
			game: gameData,
			teams: teamData,
			users: userData
		};
		console.log(renderObj);
		res.render('gameEdit', renderObj);
	});
}

exports.addGame = function(req, res) {
	if(!req.body.gameName || !req.body.startDate || !req.body.endDate) {
		return res.send(400,'Game requires gameName, startDate, endDate');
	}
	client.hmget("games", req.body.gameName, function(err,data) {
		if(err) { return res.send(400,err); }
		if(data[0] != null) {
			return res.send(200,'Team already exists');
		}
		client.hmset("games", req.body.gameName, JSON.stringify({ "startDate": req.body.startDate, "endDate" : req.body.endDate }), function (err, replies) {
			if(err) { return res.send(400,err); }
			return res.send(200,replies);
		});
	});
}

exports.addUser = function(req, res){
	client.hmget("users", req.body.email, function(err,data) {
		if(err) { return callback(err); }
		if(data[0] != null) {
			return res.send(200,'User already exists');
		}
		if(!req.body.password || !req.body.firstName || !req.body.lastName || !req.body.email) {
			return res.send(400,'User requires email, firstName, lastName, password');
		}
		async.parallel([
			function(callback){
				client.hmset("users", req.body.email, JSON.stringify({"password" : req.body.password, "firstName" : req.body.firstName, "lastName" : req.body.lastName}), function (err, replies) {
					if(err) { return callback(err); }
					return callback(null, replies);
				});
			},
			function(callback){
				var startDate = moment('2015-01-06');
				var obj = {
					"weeks":[]
				};
				for(var i = 0; i < 7; i++) {
					console.log(i,startDate.add(1,'days').format('MM-DD-YYYY'));
				}
				client.hmset("data", req.body.email, JSON.stringify({"password" : req.body.password, "firstName" : req.body.firstName, "lastName" : req.body.lastName}), function (err, replies) {
					if(err) { return callback(err); }
					return callback(null, replies);
				});
			}
		],
		function(err, results){
			if(err) { return res.send(400,err); }
			else {
				res.send(200,results);
			}
		});
	});
};

exports.deleteUser = function(req, res){
	client.hdel("users", req.body.email, function(err,data) {
		if(err) { return res.send(400,err); }
		if(data > 0) {
			return res.send(200,'User Deleted');
		}
		return res.send(200,'User does not exist');
	});
};

exports.addTeam = function(req, res){
	if(!req.body.teamName) {
		return res.send(400,'Team requires teamName');
	}
	client.hmget("teams", req.body.teamName, function(err,data) {
		if(err) { return res.send(400,err); }
		if(data[0] != null) {
			return res.send(200,'Team already exists');
		}
		client.hmset("teams", req.body.teamName, JSON.stringify({ "members": [] }), function (err, replies) {
			if(err) { return res.send(400,err); }
			return res.send(200,replies);
		});
	});
};

exports.addTeamMember = function(req, res){
	if(!req.body.teamName || !req.body.userEmail) {
		return res.send(400,'Team requires teamName and userEmail');
	}
	client.hmget("teams", req.body.teamName, function(err,data) {
		if(err) { return res.send(400,err); }
		if(!data) {
			return res.send(200,'Team does not exist');
		}
		var team = JSON.parse(data[0]);
		client.hmget("users", req.body.userEmail, function(err,data) {
			if(err) { return res.send(400,err); }
			var user = data[0];
			if(!user) {
				return res.send(200,'User '+req.body.userEmail+' does not exist');
			}

			if(team.members.indexOf(req.body.userEmail) >= 0) {
				return res.send(200,'User is already a member of that team.');
			}
			team.members.push(req.body.userEmail);
			client.hmset("teams", req.body.teamName, JSON.stringify(team), function (err, replies) {
				if(err) { return res.send(400,err); }
				return res.send(200,replies);
			});
		});
	});
};

exports.deleteTeam = function(req, res){
	client.hdel("teams", req.body.teamName, function(err,data) {
		if(err) { return res.send(400,err); }
		if(data > 0) {
			return res.send(200,'Team Deleted');
		}
		return res.send(200,'Team does not exist');
	});
};

var getGame = function(gameName, callback) {
	client.hmget("games", gameName, function(err,data) {
		if(err) { return callback(err); }
		return callback(null,data[0]);
	});
}

var getTeam = function(teamName, callback) {
	client.hmget("teams", teamName, function(err,data) {
		if(err) { return callback(err); }
		return callback(null,data[0]);
	});
}

var obj = {
   "weeks":[
      {
      	 "submissionTime":false,
      	 "challengeMet":false,
      	 "postingBonus":false,
      	 "alcoholBonus":false,
      	 "startingWeight":0,
      	 "endingWeight":0,
      	 "fitnessSuccess":false,
         "days":[
            {
               "label":"Monday",
               "weight":0,
               "meals":[
                  {
                     "status":false
                  },
                  {
                     "status":false
                  },
                  {
                     "status":false
                  },
                  {
                     "status":false
                  },
                  {
                     "status":false
                  }
               ],
               "exercise":{
                  "status":false
               },
               "sleep":{
                  "status":false
               },
               "water":{
                  "status":false
               },
               "goodHabit":{
                  "status":false
               },
               "badHabit":{
                  "status":false
               },
               "communication":{
                  "status":false
               },
               "penalties":{
                  "scale":{
                     "count":0
                  },
                  "alcohol":{
                     "count":0
                  },
                  "collusion":{
                     "count":0
                  },
                  "snacks":{
                     "count":0
                  },
                  "changeHabit":{
                     "status":false
                  }

               }
            }
        ]
      }
   ]
}