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

	return totalPoints;
}
