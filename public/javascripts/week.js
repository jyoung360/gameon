$().ready(function(){
	$('#weekForm input').bind('change',function(event){
		$('#dailyTotal').html('Score: '+calculateTotalPoints());
	});
	$('#dailyTotal').html('Score: '+calculateTotalPoints());
});

function calculateTotalPoints() {
	var totalPoints = 0;
	$('#weekForm input[type=radio]:checked').each(function(index,element){
		var points = parseInt($(this).attr('data-points'),10);
		var target = $(this).attr('data-target');
		var val = isNaN(parseInt($(this).val(),10))?1:parseInt($(this).val(),10);
		points *= val;

		if(isNaN(points)) {
			points = 0;
		}
		var pointLabel = points >= 0?'+'+points:points;
		$('#'+target).html(pointLabel);
		if(points < 0) {
			$('#'+target).addClass('negative');
		}
		else {
			$('#'+target).removeClass('negative');
		}
		totalPoints += points;
	});
	$('#weekForm input[type=text]').each(function(index,element){
		var points = parseInt($(this).attr('data-points'),10);
		if(isNaN(points)) points = 0;

		var target = $(this).attr('data-target');
		var val = isNaN(parseInt($(this).val(),10))?1:parseInt($(this).val(),10);
		points *= val;

		if(isNaN(points)) {
			points = 0;
		}
		var pointLabel = points >= 0?'+'+points:points;
		$('#'+target).html(pointLabel);
		if(points < 0) {
			$('#'+target).addClass('negative');
		}
		else {
			$('#'+target).removeClass('negative');
		}

		totalPoints += points;
	});
	var drinks = parseInt($('#weekForm input[name=alcoholBonus]').val(),10);
	var alcoholBonus = 0;
	if(isNaN(drinks) || drinks == 0) {
		alcoholBonus = 25;
	}
	else if(!isNaN(drinks) && drinks > 5) {
		alcoholBonus = -25*(drinks-5);
	}
	var pointLabel = alcoholBonus >= 0?'+'+alcoholBonus:alcoholBonus;
	$('#alcoholChange').html(pointLabel);
	if(alcoholBonus < 0) {
		$('#alcoholChange').addClass('negative');
	}
	else {
		$('#alcoholChange').removeClass('negative');
	}

	if($('#weekForm input[name=startingWeight]').length){
		var startingWeight = parseFloat($('#weekForm input[name=startingWeight]').val());
		var endingWeight = parseFloat($('#weekForm input[name=endingWeight]').val());
		var weightChange = (((startingWeight-endingWeight)/startingWeight)*100).toFixed(2);
		if(!isNaN(weightChange)) { 
			$('#weightGoal').html(weightChange+'%');
			if(weightChange < 1) {
				$('#weightGoal').addClass('negative');
			}
			else {
				$('#weightGoal').removeClass('negative');
			}
		}
	}

	return totalPoints;
}
