/* http://www.kryogenix.org/code/browser/searchhi/ */
/* Modified 20021006 to fix query string parsing and add case insensitivity */
/* Modified 20070316 to stop highlighting inside nosearchhi nodes */
/* Modified 20090104 by Bruce Lawson to use html5 mark element rather than span 
 http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-mark-element */
/* Modified 20090105 by Pete Boere to clean-up namespace */

/* This script is by Stuart Langridge licensed under MIT license http://www.kryogenix.org/code/browser/licence.html */

(function () {

// Shortcuts
var win = window,
	doc = document,
	referrer = doc.referrer || win.location.href,
	searchEngines = {
	
	},
	
	highlightWord = function ( node, word ) {
		// Iterate into this nodes childNodes
		if ( node.hasChildNodes ) {
			for ( var i = 0, cn = node.childNodes; i < cn.length; i++ ) {
				highlightWord( cn[ i ], word );
			}
		}
		
		// Exit if this node isn't text
		if ( node.nodeType != 3 ) { return; }
		
		var tempNodeVal = node.nodeValue.toLowerCase(),
			tempWordVal = word.toLowerCase();
		
		// Exit if this node doesn't contain the search term
		if ( tempNodeVal.indexOf( tempWordVal ) == -1 ) { return; }
			
		var	pn = node.parentNode,
			checkn = pn;
			
		// Check if we're inside a "nosearchhi" zone
		while ( checkn.nodeType != 9 && 
			checkn.nodeName.toLowerCase() != 'body' ) { // 9 = top of doc
			if ( checkn.className.match( /\bnosearchhi\b/ ) ) { return; }
			checkn = checkn.parentNode;
		}
		
		// Process if node has not already been highlighted!
		if ( pn.className != 'searchword' ) { 
			var nv = node.nodeValue,
				ni = tempNodeVal.indexOf( tempWordVal ),
				// Create a load of replacement nodes
				before = doc.createTextNode( nv.substr( 0, ni ) ),
				docWordVal = nv.substr( ni,word.length ),
				after = doc.createTextNode( nv.substr( ni + word.length ) ),
				hiwordtext = doc.createTextNode( docWordVal ),
				hiword = doc.createElement( 'mark' );
			hiword.className = 'searchword';
			hiword.appendChild( hiwordtext );
			pn.insertBefore( before, node );
			pn.insertBefore( hiword, node );
			pn.insertBefore( after, node );
			pn.removeChild( node );
		}
	},
	
	searchTermHighlight = function () {
	
		var testLink = doc.createElement( 'a' );
		testLink.href = referrer;
		alert( testLink.hostname )
		
	
		var qsa = referrer.substr( referrer.indexOf( '?' ) + 1 ).split( '&' ), 
			qsip,
			i = 0; 
		
			
		for ( i; i < qsa.length; i++ ) {
			qsip = qsa[i].split( '=' );
			if ( qsip.length === 1 ) {
				continue;
			}
			if ( qsip[0] === 'q' || qsip[0] === 'p' ) { // q= for Google or Bing, p= for Yahoo
				var words = unescape( qsip[1].replace( /\+/g,' ' ) ).split( /\s+/ ),
					docBody = doc.getElementsByTagName( 'body' )[0],
					w = 0;
				for ( w; w < words.length; w++ ) {
					highlightWord( docBody, words[w] );
				}
			}
		}
	};
alert(12)

if ( !referrer || referrer.indexOf( '?' ) === -1 ) {
	return;
}
else if ( 'jQuery' in win ) {
	jQuery( doc ).ready( searchTermHighlight ); 
}
else if ( 'addEventListener' in win ) {
	win.addEventListener( 'load', searchTermHighlight, false );
}
else if ( 'attachEvent' in win ) {
	win.attachEvent( 'onload', searchTermHighlight );
}
else {
	win.onload = searchTermHighlight();
}

})();