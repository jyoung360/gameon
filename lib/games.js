var async = require('async'),
redis = require('redis'),
client = redis.createClient();
client.on("error", function (err) {
    console.log("Error " + err);
});

exports.getGames = function(callback) {
	var games = [];
	client.hgetall("games", function(err,data) {
		if(err) { return callback(err); }
		for(var i in data) {
			var obj = JSON.parse(data[i]);
			obj.gameName = i;
			games.push(obj);
		}
		return callback(null,games);
	});
}

exports.getGame = function(gameName, callback) {
	async.waterfall([
	    function(done){
	    	client.hmget("games", gameName, function(err,data) {
				if(err) { return done(err); }
				return done(null, JSON.parse(data[0]));
			});
	    },
	    function(gameData, done){
	    	client.hmget("teams", gameData.teams, function(err,data) {
				if(err) { return done(err); }
				var teams = [];
				for(var i in data) {
					if(data[i]) {
						var obj = JSON.parse(data[i]);
						obj.teamName = i;
						teams.push(obj)
					}
				}
				return done(null, gameData, teams);
			});
	    },
	    function(gameData, teamData, done){
	    	client.hmget("users", teamData.users, function(err,data) {
				if(err) { return done(err); }
				var users = [];
				for(var i in data) {
					if(data[i]) {
						var obj = JSON.parse(data[i]);
						obj.email = i;
						users.push(obj)
					}
				}
				return done(null, gameData, teamData, users);
			});
	    }
	], callback);	
}

exports.getTeams = function(gameName, callback) {

}