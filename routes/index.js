var fs = require('fs');
var async = require('async');
var allUsers = require('/opt/node/gameon/users/all.js');
/*
 * GET home page.
 */
exports.index = function(req, res){
	var dataToRender = {
		"users" : []
	}
	var array = [];
	for(var i in allUsers) {
		array.push(allUsers[i]);
	}
	async.each(array, function(user,callback) {
		//console.log(user.dataFile);
		fs.readFile('/opt/node/gameon/users/'+user.dataFile,{encoding:'utf8'}, function (err, data) {
			if(!data) { return callback(null); }
			var score = calculateScoreFromData(data);
			//var userData = JSON.parse(data);
			var obj = {};
			obj.name = user.firstName;
			obj.scores = score;
			dataToRender.users.push(obj);
			return callback(null);
		});
	}, function(err){
		if(err) {
			console.log(err);
			return res.render('error',{"err":err});
		}
		var renderObj = {
			user: req.session.user,
			data: dataToRender
		}
		res.render('index', renderObj);
	    // if any of the saves produced an error, err would equal that error
	});

	
};

exports.denied = function(req, res){
	res.render('denied', { user: req.session.user });
};

function calculateScoreFromData(data) {
	var userData = JSON.parse(data);
	var scoreData = {
		"weeks" : []
	}
	for(var i in userData.weeks) {
		var week = userData.weeks[i];
		var weekNumber = parseInt(i,10)+1;
		var weekScore = 0;
		var weekData = [];
		for(var j in week.days) {
			var day = week.days[j];
			var obj = { 
				'day': day.label,
				'score' : (day.score === undefined)?0:day.score,
				'weight' : (day.weight === undefined)?0:day.weight
			}
			weekData.push(obj);
			weekScore += (day.score === undefined)?0:parseInt(day.score,10);
		}
		var challengeBonus = userData.weeks[i].challengeMet?weekScore*.2:0;
		var alcoholBonus = 0;
		if(userData.weeks[i].alcoholBonus == 0) {
			alcoholBonus = 25;
		}
		else if(userData.weeks[i].alcoholBonus > 5) {
			alcoholBonus = -25*(userData.weeks[i].alcoholBonus-5);
		}
		var postingBonus = userData.weeks[i].postingBonus?5:0;
		weekScore += challengeBonus;
		weekScore += alcoholBonus;
		weekScore += postingBonus;
		weekScore += 10;
		scoreData.weeks.push({ "days":weekData, "score":weekScore, "alcoholBonus":alcoholBonus, "challengeBonus":challengeBonus, "timeBonus":10, "postingBonus":postingBonus });
	}
	return scoreData;
}

exports.dashboard = function(req, res){
	fs.readFile('/opt/node/gameon/users/'+req.session.user.dataFile,{encoding:'utf8'}, function (err, data) {
		if (err) {
			console.log(err);
			return res.render('error',{"err":err});
		}

		//var userData = JSON.parse(data);
		var scoreData = calculateScoreFromData(data);
		res.render('dashboard', { 
			scores: scoreData,
			user: req.session.user
		});
		return
		
	});
};

exports.getWeek = function(req,res) {
	//var userData = require('/opt/node/gameon/users/'+req.session.user.dataFile);
	fs.readFile('/opt/node/gameon/users/'+req.session.user.dataFile,{encoding:'utf8'}, function (err, data) {
		if (err) {
			console.log(err);
			return res.render('error',{"err":err});
		}
		var userData = JSON.parse(data);
		res.render('week', { 
			user: req.session.user,
			week: req.params.week, 
			weekLabel: parseInt(req.params.week,10)+1,
			day: req.params.day,
			data : userData.weeks[req.params.week].days[req.params.day],
			fitnessSuccess : userData.weeks[req.params.week].fitnessSuccess,
			alcoholBonus : userData.weeks[req.params.week].alcoholBonus,
			postingBonus : userData.weeks[req.params.week].postingBonus,
			startingWeight : userData.weeks[req.params.week].startingWeight,
			endingWeight : userData.weeks[req.params.week].endingWeight
		});
	});
}

exports.postWeek = function(req,res) {
	var week = req.params.week;
	var day = req.params.day;
	fs.readFile('/opt/node/gameon/users/'+req.session.user.dataFile,{encoding:'utf8'}, function (err, data) {
		if (err) {
			console.log(err);
			return res.render('error',{"err":err});
		}
		var userData = JSON.parse(data);
		var dailyScore = 0;
		for(var i in req.body) {
			switch(i) {
				case 'meals':
					for(var j in req.body[i]) {
						userData.weeks[week].days[day].meals[j].status = req.body[i][j]=='true'?true:false;
						dailyScore += req.body[i][j]=='true'?6:0;
					}
					break;
				case 'exercise':
					userData.weeks[week].days[day].exercise.status = req.body[i]=='true'?true:false;
					dailyScore += req.body[i]=='true'?20:0;
					break;
				case 'water':
					userData.weeks[week].days[day].water.status = req.body[i]=='true'?true:false;
					dailyScore += req.body[i]=='true'?10:0;
					break;
				case 'sleep':
					userData.weeks[week].days[day].sleep.status = req.body[i]=='true'?true:false;
					dailyScore += req.body[i]=='true'?15:0;
					break;
				case 'goodHabit':
					userData.weeks[week].days[day].goodHabit.status = req.body[i]=='true'?true:false;
					dailyScore += req.body[i]=='true'?10:0;
					break;
				case 'badHabit':
					userData.weeks[week].days[day].badHabit.status = req.body[i]=='true'?true:false;
					dailyScore += req.body[i]=='true'?10:0;
					break;
				case 'communication':
					userData.weeks[week].days[day].communication.status = req.body[i]=='true'?true:false;
					dailyScore += req.body[i]=='true'?5:0;
					break;
				case 'penalties.scale':
					userData.weeks[week].days[day].penalties.scale.count = isNaN(parseInt(req.body[i],10))?0:parseInt(req.body[i],10);
					dailyScore -= isNaN(parseInt(req.body[i],10))?0:parseInt(req.body[i],10)*1;
					break;
				case 'penalties.snacks':
					userData.weeks[week].days[day].penalties.snacks.count = isNaN(parseInt(req.body[i],10))?0:parseInt(req.body[i],10);
					dailyScore -= isNaN(parseInt(req.body[i],10))?0:parseInt(req.body[i],10)*10;
					break;
				case 'penalties.alcohol':
					userData.weeks[week].days[day].penalties.alcohol.count = isNaN(parseInt(req.body[i],10))?0:parseInt(req.body[i],10);
					dailyScore -= isNaN(parseInt(req.body[i],10))?0:parseInt(req.body[i],10)*25;
					break;
				case 'penalties.collusion':
					userData.weeks[week].days[day].penalties.collusion.count = isNaN(parseInt(req.body[i],10))?0:parseInt(req.body[i],10);
					dailyScore -= isNaN(parseInt(req.body[i],10))?0:parseInt(req.body[i],10)*20;
					break;
				case 'penalties.changeHabit':
					userData.weeks[week].days[day].penalties.changeHabit.status = req.body[i]=='true'?true:false;
					dailyScore -= req.body[i]=='true'?50:0;
					break;
				case 'weight':
					userData.weeks[week].days[day].weight = isNaN(parseInt(req.body[i],10))?0:parseInt(req.body[i],10);
					break;
				case 'fitnessSuccess':
					userData.weeks[week].fitnessSuccess = req.body[i]=='true'?true:false;
					userData.weeks[week].challengeMet = req.body[i]=='true'?true:false;
					break;
				case 'alcoholBonus':
					userData.weeks[week].alcoholBonus = isNaN(parseInt(req.body[i],10))?0:parseInt(req.body[i],10);
					break;
				case 'postingBonus':
					userData.weeks[week].postingBonus = req.body[i]=='true'?true:false;
					break;
				case 'startingWeight':
					userData.weeks[week].startingWeight = isNaN(parseInt(req.body[i],10))?0:parseInt(req.body[i],10);
					break;
				case 'endingWeight':
					userData.weeks[week].endingWeight = isNaN(parseInt(req.body[i],10))?0:parseInt(req.body[i],10);
					break;
			}

		}
		if(!userData.weeks[week].challengeMet) {
			var startingWeight = parseInt(req.body.startingWeight,10);
			var endingWeight = parseInt(req.body.endingWeight,10);
			if(!isNaN(startingWeight) && !isNaN(endingWeight) && ((startingWeight-endingWeight)/startingWeight >= .01)) {
				userData.weeks[week].challengeMet = true;
			}
		}
		userData.weeks[week].days[day].score = dailyScore;
		fs.writeFile('/opt/node/gameon/users/'+req.session.user.dataFile,JSON.stringify(userData),function(err,data) {
			if (err) {
				console.log(err);
				return res.render('error',{"err":err});
			}
			res.redirect('/week/'+week+'/day/'+day);
		});
	});
}