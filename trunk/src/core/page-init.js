/**

Page init

@location core
@description  

*/

if ( browser.ie6 ) { 
	try { 
		doc.execCommand( 'BackgroundImageCache', false, true );
	} catch(ex) {}; 
}
J.addEvent(win, 'unload', J.purgeEventLog);

var classname = ['unknown'], key;
for ( key in browser ) {
	if ( browser[key] ) {
		if ( classname[0] === 'unknown' ) { 
			classname = [key]; 
		} 
		else {
			classname.push(key);
		}
	}
}
addClass( docRoot, 'js ' + classname.join(' ') );