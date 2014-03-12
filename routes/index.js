var fs = require('fs');
/*
 * GET home page.
 */
exports.index = function(req, res){
	res.render('index', { title: 'Express' });
};

exports.denied = function(req, res){
	res.render('denied', { user: req.session.user });
};

exports.restricted = function(req, res){
	res.render('restricted', {  user: req.session.user });
};

exports.getWeek = function(req,res) {
	//var userData = require('/opt/node/gameon/users/'+req.session.user.dataFile);
	fs.readFile('/opt/node/gameon/users/'+req.session.user.dataFile,{encoding:'utf8'}, function (err, data) {
		if (err) {
			console.log(err);
		}
		var userData = JSON.parse(data);
		res.render('week', { 
			user: req.session.user,
			week: req.params.week, 
			weekLabel: parseInt(req.params.week,10)+1,
			day: req.params.day,
			data : userData.weeks[req.params.week].days[req.params.day]
		});
	});
}

exports.postWeek = function(req,res) {
	var week = req.params.week;
	var day = req.params.day;
	fs.readFile('/opt/node/gameon/users/'+req.session.user.dataFile,{encoding:'utf8'}, function (err, data) {
		if (err) {
			console.log(err);
		}
		var userData = JSON.parse(data);
		for(var i in req.body) {
			switch(i) {
				case 'meals':
					for(var j in req.body[i]) {
						userData.weeks[week].days[day].meals[j].status = req.body[i][j]=='true'?true:false;
					}
					break;
				case 'exercise':
					userData.weeks[week].days[day].exercise.status = req.body[i]=='true'?true:false;
					break;
				case 'water':
					userData.weeks[week].days[day].water.status = req.body[i]=='true'?true:false;
					break;
				case 'sleep':
					userData.weeks[week].days[day].sleep.status = req.body[i]=='true'?true:false;
					break;
				case 'goodHabit':
					userData.weeks[week].days[day].goodHabit.status = req.body[i]=='true'?true:false;
					break;
				case 'badHabit':
					userData.weeks[week].days[day].badHabit.status = req.body[i]=='true'?true:false;
					break;
				case 'penalties.scale':
					userData.weeks[week].days[day].penalties.scale.count = req.body[i];
					break;
				case 'penalties.snacks':
					userData.weeks[week].days[day].penalties.snacks.count = req.body[i];
					break;
				case 'penalties.alcohol':
					userData.weeks[week].days[day].penalties.alcohol.count = req.body[i];
					break;
				case 'penalties.collusion':
				userData.weeks[week].days[day].penalties.collusion.count = req.body[i];
					break;
			}

		}
		fs.writeFile('/opt/node/gameon/users/'+req.session.user.dataFile,JSON.stringify(userData),function(err,data) {
			if (err) {
				console.log(err);
			}
			res.redirect('/week/'+week+'/day/'+day);
		});
	});
}