/**

Page load tasks

*/
// fix background image flicker on ie6
if ( browser.ie6 ) { 
	try { 
		doc.execCommand( 'BackgroundImageCache', false, true );
	} catch (ex) {}; 
}

removeClass( docRoot, 'no-js' );

// adding informational css classes to the root element for convenience
var classname = ['unknown'], key;
for ( key in browser ) {
	if ( browser[key] ) {
		if ( classname[0] === 'unknown' ) { 
			classname = [key]; 
		} 
		else {
			classname.push( key );
		}
	}
}
classname.push( 'js' );
addClass( docRoot, classname.join(' ') );