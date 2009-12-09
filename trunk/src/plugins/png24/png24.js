/////////////////////////////////////////////////////////////////////////
//  Png24 fix for users of IE 6 
/////////////////////////////////////////////////////////////////////////

(function () {

// Quick exit if this isn't IE 6 
if ( !/MSIE 6/i.test( navigator.userAgent ) ) { return; }

// Import library 
eval( JELLY.unpack() );

// Selection criteria
var elements = 'img.img-main[src$=png], img.png24',

	fixPng24 = function () {
		
		var pngs = Q( elements ),
			propertyIsSet = function ( img, prop ) {
				return img.currentStyle[ prop ] || img.currentStyle[ prop ] == '0';
			};
		
		pngs.each( function ( img ) {
		
			// Create custom element so not to inherit any other styles
			var replacement = createElement( 'pngfix' ),
			
				currentStyle = img.currentStyle;
			
			// Copy over all style info
			for ( var prop in currentStyle ) {
				try {
					var value = currentStyle[ prop ];
					if ( value != '' ) { 
						replacement.style[ prop ] = currentStyle[ prop ];
					}
				}
				catch (x) {}
			}
			
			// Copy over width and height if set in CSS, else use image header info to set width and height
			setStyle( replacement, {
				'height': 
					propertyIsSet( img, 'height' ) && ( currentStyle.height != 'auto' ) ? 
						currentStyle.height : img.height + 'px',
				'width': 
					propertyIsSet( img, 'width' ) && ( currentStyle.width != 'auto' ) ? 
						currentStyle.width : img.width + 'px',
				'display': 
					propertyIsSet( img, 'display' ) && ( currentStyle.display != 'inline' ) ? 
						currentStyle.display : 'inline-block',
				'filter': 
					"progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + img.src + "', sizingMethod='crop')"
			});
			
			// Restore alt text
			if ( !empty( img.alt ) ) {
				replacement.innerHTML = '<img alt="' + img.alt + '" style="position:absolute;left:-999em" />';
			}
			replaceElement( img, replacement );
		});
	};

window.attachEvent( 'onload', fixPng24 );

})(); // End closure