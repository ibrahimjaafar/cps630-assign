window.onload = function () {
    var url = document.location.href,
        params = url.split('?')[1].split('&'),
        data = {}, tmp;
    for (var i = 0, l = params.length; i < l; i++) {
         tmp = params[i].split('=');
         data[tmp[0]] = tmp[1];
    }
	$.getJSON("mapping.json", function(res) {
  for (i = 0; i<res.Records.length; i++){
	
	 if (res.Records[i].Name.toLowerCase().includes(data.company.toLowerCase().split("+", 1))){
			
			document.getElementById('cname').innerHTML = res.Records[i].Name ;
			document.getElementById('logo').src = "https://logo.clearbit.com/"+data.company.toLowerCase().split("+", 1)+".com";
		return getData(res.Records[i].Ticker);
	 }
		else if (res.Records[i].Ticker.toLowerCase().includes(data.company.toLowerCase())) {
			document.getElementById('cname').innerHTML = res.Records[i].Name ;
		return getData(res.Records[i].Ticker);
		}
  }
});
}
function getData(company){
	var api = "https://www.quandl.com/api/v3/datasets/WIKI/"+company+".json?rows=7&api_key=dBzpDKhzBgcGovsMFx-f";
	var xmlhttp = new XMLHttpRequest();
	var xmlhttp2 = new XMLHttpRequest();
	var resp;
	
	//alert(company);
	xmlhttp.onreadystatechange = function(){
		if (xmlhttp.readyState == XMLHttpRequest.DONE && xmlhttp.status == 200){

			
			resp = JSON.parse(xmlhttp.responseText);
		//["Date","Open","High","Low","Close","Volume","Ex-Dividend","Split Ratio","Adj. Open","Adj. High","Adj. Low","Adj. Close","Adj. Volume"]
      	
	
		//7 day high/low
		var canvas = document.getElementById('highlow');
			var data = {
			labels: [resp.dataset.data[0][0], resp.dataset.data[1][0], resp.dataset.data[2][0],resp.dataset.data[3][0],resp.dataset.data[4][0],resp.dataset.data[5][0],resp.dataset.data[6][0]],
			datasets: [
        {
            label: "High",
            backgroundColor: "rgba(38,36,39,0.8)",
            borderColor: "rgba(38,36,36,1)",
            borderWidth: 2,
            hoverBackgroundColor: "rgba(38,36,32,0.7)",
            hoverBorderColor: "rgba(38,36,32,1)",
            data: [resp.dataset.data[0][2], resp.dataset.data[1][2], resp.dataset.data[2][2],resp.dataset.data[3][2],resp.dataset.data[4][2],resp.dataset.data[5][2],resp.dataset.data[6][2]],
        },
		 {
            label: "Low",
            backgroundColor: "rgba(38,36,39,0.2)",
            borderColor: "rgba(38,36,36,1)",
            borderWidth: 2,
            hoverBackgroundColor: "rgba(38,36,32,0.4)",
            hoverBorderColor: "rgba(38,36,32,1)",
            data: [resp.dataset.data[0][3], resp.dataset.data[1][3], resp.dataset.data[2][3],resp.dataset.data[3][3],resp.dataset.data[4][3],resp.dataset.data[5][3],resp.dataset.data[6][3]],
				}
			]
		};
			var option = {
				responsive: true,
				animation: {
				duration:2000
			}

		};


		var highlowgraph = Chart.Bar(canvas,{
			
			data:data,
			options:option
			});
		
		//7 day volume
		var canvas2 = document.getElementById('volume');
		var data2 = {
			labels: [resp.dataset.data[0][0], resp.dataset.data[1][0], resp.dataset.data[2][0],resp.dataset.data[3][0],resp.dataset.data[4][0],resp.dataset.data[5][0],resp.dataset.data[6][0]],
			datasets: [
        {
            label: "Volume",
            backgroundColor: "rgba(38,36,39,0.8)",
            borderColor: "rgba(38,36,36,1)",
            borderWidth: 2,
            hoverBackgroundColor: "rgba(38,36,32,0.7)",
            hoverBorderColor: "rgba(38,36,32,1)",
            data: [resp.dataset.data[0][12], resp.dataset.data[1][12], resp.dataset.data[2][12],resp.dataset.data[3][12],resp.dataset.data[4][12],resp.dataset.data[5][12],resp.dataset.data[6][12]],
        }
	
			]
					};
			option = {
				responsive: true,
				animation: {
				duration:2000
			}

	};
		var linegraph = Chart.Line(canvas2,{
			data:data2,
			options:option
		});
		//
		var lastdaygraph = document.getElementById("lastday").getContext("2d");
		var data3 = {
			labels: [resp.dataset.column_names[1],resp.dataset.column_names[2],resp.dataset.column_names[3],resp.dataset.column_names[4]],
			datasets: [{
			label: "in USD",
			data: [resp.dataset.data[0][1], resp.dataset.data[0][2], resp.dataset.data[0][3], resp.dataset.data[0][4]],
			backgroundColor: ["#111111", "#111111","#111111","#111111"],
			hoverBackgroundColor: ["#333333","#333333","#333333","#333333"]
			}]
		};

		var lastdaychart = new Chart(lastdaygraph, {
			type: 'horizontalBar',
			data: data3,
			options: {
			scales: {
            xAxes: [{
                ticks: {					
                }
            }],
            yAxes: [{
            	stacked: true
            }]
			}
		}
	});
	}}
	
	xmlhttp.open("GET", api, true);
	xmlhttp.send();


}
//getData();

