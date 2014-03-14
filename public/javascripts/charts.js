
  // Load the Visualization API and the piechart package.
  

  // Set a callback to run when the Google Visualization API is loaded.

  function drawChart(rows) {
    console.log(rows);

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
                  'backgroundColor':'#eee'};

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);
  }
