/**

Integrate Sizzle selector engine into Jelly

*/
var addSugar = function ( collection ) {
	for ( var meth in sugarMethods ) {
		collection[meth] = sugarMethods[meth];
	}
	return collection;
};
		
// Build our sugar methods object
var sugarMethods = {};
[ 
	'addClass', 
	'removeClass', 
	'setStyle', 
	'addEvent', 
	['setAttribute', 
		function ( el, attr, value ) { return el.setAttribute( attr, value ); }],
	['removeAttribute', 
		function ( el, attr ) {	return el.removeAttribute( attr ); }],
	['remove', 
		removeElement]		
].each( function ( obj ) {
	
	var name = obj,
		method;

	if ( isArray( obj ) ) {
		name = obj[0];
		method = obj[1];
	}
	else {
		method = J[ obj ]
	}
	sugarMethods[name] = function () {
		var args = toArray( arguments ),
			n = this.length,
			i = 0;
		for ( i; i < n; i++ ) {
			method.apply( {}, [this[i]].concat( args ) );
		}  
		return this;
	} 
});

var Q = J.Q = function ( a, b ) {
	return addSugar( Sizzle( a, b ) );
};	

