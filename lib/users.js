var redis = require('redis'),
client = redis.createClient();
client.on("error", function (err) {
    console.log("Error " + err);
});

var users = [
	'test'
];

exports.getUser = function() {
	return users;
}

exports.validateUser = function(email, password, callback) {
	client.hmget("users", email, function(err,data) {
		if(err) { return callback(err); }
		var user = JSON.parse(data[0]);
		if(!user || user.password != password) {
			return callback("Invalid User");
		}
		return callback(null,user);
	});
}