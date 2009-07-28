/**

msieLogger

@description 
	A means to finding bugs in internet explorer

*/

var msieLogger = function () {

	var ieConsole = createElement( 'div' );
	ieConsole.style.cssText = [
			'position:' + ( browser.ie6 ? 'absolute' : 'fixed' ),
			'overflow: auto',
			'width: 100%',
			'height: 150px',
			'background: #000',
			'bottom: 0',
			'left: 0',
			'color: #fff' 
		].join(';');

	var SOL = '<span style="' + [
			'display: block',
			'border-bottom: 1px solid #444',
			'padding: 4px 8px',
			'font: bold 10px consolas, "courier new", monospace',
			].join(';') + 
			'">',
		EOL = '</span>';
	
	addEvent( window, 'load', function () {
		insertElement( ieConsole );
	});
	
	return function () {
		if ( ieConsole.parentNode ) {
			var args = toArray( arguments );
			ieConsole.innerHTML += SOL + ( args.length < 2 ? args[0] : args.join(', ') ) + EOL;
		}
	};
	
}();

J.msieLogger = msieLogger;