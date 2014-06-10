
  // Load the Visualization API and the piechart package.
  

  // Set a callback to run when the Google Visualization API is loaded.

  function drawChart(rows) {
    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Day');
    data.addColumn('number', 'Lbs');
    data.addColumn('number', 'Points');

    data.addRows(rows);

    // Set chart options
    var options = {'title':'Weight and score by day',
                   'width': 1000,
                   'height':300,
                   'pointSize' :5,
                  'backgroundColor':'#eee'};

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);
  }

  function drawTeamChart(cols,rows) {
    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Day');
    for(var i in rows) {
      data.addColumn('number', rows[i].name);
    }

    var row = [];
    for(var i = 0;i<21;i++) {
      var cells = [];
      cells.push(rows[0].scores[i].day);
      for(var j in rows) {
        //console.log(rows[j].scores[i]);
        cells.push(rows[j].scores[i].score);
      }
      data.addRow(cells);
    }
    
    // Set chart options
    var options = {'title':'Score by day',
                   'width': 1000,
                   'height':300,
                   'pointSize' :5,
                  'backgroundColor':'#eee'};

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.LineChart(document.getElementById('individual_chart_div'));
    chart.draw(data, options);
  }
