<html>
<header>
<title>Haggle</title>
<script type="text/javascript" src="YmmCtrlSupport_1.1.0.70.js"></script>
<script type="text/javascript" src="ymmData.js"></script>
<script type="text/javascript"><!--

document.write(ymmUsed['2007']);

var years = new Array();
years = [2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000 ,1999, 1998, 1997, 1996, 1995, 1994, 1993, 1992, 1991, 1990, 1989, 1988, 1987];

function writeYears(){
	for(i=0;i < years.length;i++){
	 document.getElementById("year").innerHTML += '<option>' + years[i] + '</option>';
	};
};

function writeMake(){
	for(i=0;i < years.length;i++){
	 document.getElementById("year").innerHTML += '<option>' + years[i] + '</option>';
	};
};

function writeModel(){
	for(i=0;i < years.length;i++){
	 document.getElementById("year").innerHTML += '<option>' + years[i] + '</option>';
	};
};



--></script>

</header>
<body>

<div id="screen1">
<form>

<label>Year </label><select type="select" id="year" onselect="writeMake();" >
</select>
<br />
<label>Make </label><select type="select" id="make" onselect="writeMake();" >
<option>toyota</option>
</select>
<br />
<label>Model </label><select type="select" id="model" >
<option>prius</option>
</select>
</form>
<script type="text/javascript"><!--
writeYears();   
--></script>


</div>

<div id="screen2">
<form> 
<label>Mileage </label><input type="text" id="milage" />
<br />
<label>Zip </label><input type="text" id="zip" />

</form>
</div>

<div id="screen3">
<ul>
<li><a href="">Trade in Value</a></li>
<li><a href="">Private Party Value</a></li>
<li><a href="">Suggested Retail Value</a></li>
</ul>
</div>


<div id="screen4">
<h2>Select Trim</h2>
<ul>
<li><a href="">Trade in Value</a></li>
<li><a href="">Private Party Value</a></li>
<li><a href="">Suggested Retail Value</a></li>
</ul>
</div>

<div id="screen5">

<table>
<tr><th>Condition</th> <th>Value</th></tr>
<tr><td>Excelent</td><td>Price</td></tr>
<tr><td>Good</td><td>Price</td></tr>
<tr><td>Fair</td><td>Price</td></tr>

</table>
</div>









</body>
</html>