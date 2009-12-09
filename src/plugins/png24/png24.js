(function () {

/////////////////////////////////////////////////////////////////////////
//  Png24 fix for users of IE 6 
/////////////////////////////////////////////////////////////////////////

// Quick exit if this isn't IE 6 
if ( !/MSIE 6/i.test( navigator.userAgent ) ) { return; }

// Import library 
eval( JELLY.unpack() );

// Selection criteria
var elements = 'img.img-main[src$=png], img.png24',

// Default style settings
	reset = {
		'paddingTop': 0,
		'paddingRight': 0,
		'paddingBottom': 0,
		'paddingLeft': 0,
		'marginTop': 0,
		'marginRight': 0,
		'marginBottom': 0,
		'marginLeft': 0,
		'styleFloat': 'none',
		'top': 'auto',
		'right': 'auto',
		'bottom': 'auto',
		'left': 'auto',
		'position': 'static'
	},

	fixPng24 = function () {
		
		var pngs = Q( elements ),
			propertyIsSet = function ( img, prop ) {
				return img.currentStyle[ prop ] || img.currentStyle[ prop ] == '0';
			};
		pngs.each( function ( img ) {
			var replacement = createElement( 'span' );
			
			// Copy over width and height if set in CSS, else use image header info to set width and height
			setStyle( replacement, {
				'height': 
					propertyIsSet( img, 'height' ) && ( img.currentStyle.height != 'auto' ) ? 
						img.currentStyle.height : img.height + 'px',
				'width': 
					propertyIsSet( img, 'width' ) && ( img.currentStyle.width != 'auto' ) ? 
						img.currentStyle.width : img.width + 'px',
				'display': 
					propertyIsSet( img, 'display' ) && ( img.currentStyle.display != 'inline' ) ? 
						img.currentStyle.display : 'inline-block',
				'filter': 
					"progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + img.src + "', sizingMethod='crop')",
				'zoom': 1
			})
			
			// Copy over any style properties or reset
			for ( var prop in reset ) {
				if ( propertyIsSet( img, prop ) ) {
					replacement.style[ prop ] = img.currentStyle[ prop ];
				}
				else {
					replacement.style[ prop ] = reset[ prop ];
				}
			}
			
			// Restore alt text
			if ( !empty( img.alt ) ) {
				replacement.innerHTML = '<img alt="' + img.alt + '" style="position:absolute;left:-999em" />';
			}
			replaceElement( img, replacement );
		});
	};

window.attachEvent( 'onload', fixPng24 );

})(); // End closure