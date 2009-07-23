<!DOCTYPE html>
<html>
<head>
<?php

echo '<script src="/tools/compiler.php?collate"></script>';
//echo '<script src="/build/jelly.js"></script>';

?>
<style type="text/css">

* {margin:0;padding:0;}
h4 { 
	left:0;
	top:0;
	position:absolute;
	background-position:10px 120px;
	color:#ddd; 
	background:#fff;
	}
body {height:2000px;font-size:12px;}

</style>
</head>
<body>

<h4 id="id1" style="">test1</h4>
<h4 id="id2" style="position:absolute;background-position:10px 120px;color:#ddd;">test2</h4>
<h4 id="id3" style="position:absolute;background-position:10px 120px;color:#ddd;">test3</h4>
<h4 id="id4" style="position:absolute;background-position:10px 120px;color:#ddd;">test4</h4>
<h4 id="id5" style="position:absolute;background-position:10px 120px;color:#ddd;">test5</h4>
<h4 id="id6" style="position:absolute;background-position:10px 120px;color:#ddd;">test6</h4>

<script>

eval( JELLY.unpack() );


onload = function () {
    //return;
	
	var console2 = createElement('div style:"border:1px solid #ccc;position:absolute;top:0;right:0;height:200px;overflow:auto;padding:10px;"');
	var monitor = function ( msg ) {
		if (monitor.enable) { 
			console2.innerHTML += msg + '<br />';
		}
	};			
	monitor.enable = !false;
	
	
	
	
	insertElement( console2 );

	var tween1 = new Tween('id1', {duration:1000});
	var tween2 = new Tween('id2', {duration:1000});
	var tween3 = new Tween('id3', {duration:1000});
	var tween4 = new Tween('id4', {duration:1000});
	var tween5 = new Tween('id5', {duration:1000});
	var tween6 = new Tween('id6', {duration:1000});
	
	//trace( getStyle( getElement('id1'), 'color' ) );
	
	
//	tween1.start( 'left', 100 );
	

	tween1.sequence({ 
			'left': 100, 
			'background-color': ['#fff', '#ccc'],
			'background-position': [100, 200],
			'color': '#777',
			'duration': 3100,
			'margin-left': 200,
			'margin-top': 200
		});
		

	tween2.sequence({ 
			'left': 200, 
			'background-color': ['#fff', '#ff0'],
			'background-position': [100, 200],
			'color': '#777',
			'margin-left': 200,
			'margin-top': 200
		},{
			'easing': 'bounceOut',
			'left': 300, 
			'background-color': '#000',
			'color': '#fff',
            'font-size': 24,
			'margin-left': 100,
			'padding': [0, 20],
			'margin-top': 100
		});
        
    tween3.sequence({ 
			'easing': 'bounceOut',
			'left': 300, 
			'background-color': ['#fff', '#777'],
			'background-position': [100, 200],
			'color': '#777',
			'margin-left': 200,
			'margin-top': 200
		},{
			'left': 200, 
			'background-color': '#000',
			'color': '#fff',
			'margin-left': 100,
			'padding': [0, 20],
			'margin-top': 100
		});

    tween4.sequence({ 
			'left': 600, 
			'background-color': ['#fff', '#ccc'],
			'background-position': [100, 200],
			'color': '#777',
			'margin-left': 200,
			'margin-top': 200
		},{
			'left': 200, 
			'background-color': '#000',
			'color': '#fff',
			'margin-left': 100,
			'padding': [0, 20],
			'margin-top': 100
		});
		
	tween5.sequence({ 
			'left': 500, 
			'background-color': ['#fff', '#ff0'],
			'background-position': [100, 200],
			'color': '#777',
			'margin-left': 200,
			'margin-top': 200
		},{
			'left': 200, 
			'background-color': '#000',
			'color': '#fff',
			'margin-left': 100,
			'padding': [0, 20],
			'margin-top': 100
		});
        
	tween6.sequence({ 
			'left': 400, 
			'background-color': ['#fff', '#777'],
			'background-position': [100, 200],
			'color': '#777',
			'margin-left': 200,
			'margin-top': 200
		},{
			'left': 200, 
			'background-color': '#000',
			'color': '#fff',
			'margin-left': 100,
			'padding': [0, 20],
			'margin-top': 100
		});

}


</script>

</body>
</html>