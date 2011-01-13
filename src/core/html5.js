/**
 Detection and patching of HTML5 features
 
 @class JELLY.HTML5
 @static
 @reference http://diveintohtml5.org/everything.html
 */
var HTML5 = J.HTML5 = function () {
	
	/**
	 @prop {object} input Test support for HTML5 input attributes
	 */
	var _html5 = { input: {} },
		testElement = createElement( 'input' );
	
	// Test HTML5 input types
	'search,tel,url,email,datetime,date,month,week,time,datetime-local,number,range,color'.
		split( ',' ).
	    each( function ( it ) {
	        testElement.setAttribute( 'type', it );
	        _html5.input[ it ] = testElement.type !== 'text';
	    });   

	// Test HTML5 input attributes
	'autocomplete,autofocus,list,placeholder,max,min,multiple,pattern,required,step'.
		split( ',' ).
	    each( function ( it ) {
	        _html5.input[ it ] = it in testElement;
	    });
	
	// // HTML5 video and audio
	// [ 'audio', 'video' ].each( function ( elName ) {
	// 	var test = createElement( elName );
	// 	_html5.[ elName ] = !!test.canPlayType ? { _test: test } : false;
	// });
	// 
	// // HTML5 video formats
	// if ( _html5.video ) {
	// 	var testEl = _html5.video._test;
	// 	extend( _html5.video, {
	// 		webm: !!testEl.canPlayType( 'video/webm; codecs="vp8, vorbis"' ).replace( /no/, '' ),
	// 		mp4:  !!testEl.canPlayType( 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"' ).replace( /no/, '' ),
	// 		ogg:  !!testEl.canPlayType( 'video/ogg; codecs="theora"' ).replace( /no/, '' )
	// 	});
	// }
	// 
	// // HTML5 localStorage and sessionStorage
	// [ 'localStorage', 'sessionStorage' ].each( function ( it ) {
	// 	_html5[ it ] = false;
	// 	try {
	// 		_html5[ it ] = it in win && win[ it ] !== null;
	// 	} catch (ex) {}
	// });
	
	_html5.canvas = !!createElement( 'canvas' ).getContext;
	
	if ( !_html5.canvas ) {
		// If there is no canvas support, assume this is needed so HTML5 elements can be styled
	'abbr,article,aside,audio,canvas,details,figcaption,figure,footer,header,hgroup,mark,meter,nav,output,progress,section,summary,time,video'.
		split(',').
		each( function ( it ) { 
			createElement( it ); 
		});
	}
	
	// HTML5 patch methods
	extend( _html5, {
		/**
		  Apply placeholders to text inputs for browsers that don't support them.
		  Adds a classname 'placeholder' to elements that are in placeholder state.
		
		  @example
		  	if ( !HTML5.input.placeholder ) {
			      // fallback
			      HTML5.applyPlaceholders();
			}
		 */
		applyPlaceholders: function () {
			if ( !_html5.input.placeholder ) {
				var placeholderCSS = 'placeholder',
					blur = function () {
						var text = this.getAttribute( 'placeholder' );
						if ( /^\s*$/.test( this.value ) || this.value == text ) {
							addClass( this, placeholderCSS );
							this.value = text;
						} 
						else {
							removeClass( this, placeholderCSS );
						}
					},
					focus = function () {
						var text = this.getAttribute( 'placeholder' );
						if ( this.value == text ) {
							removeClass( this, placeholderCSS );
							this.value = '';
						} 
					};
				Q( 'input[placeholder]' ).each(function ( input ) {
					blur.call( input );
					addEvent( input, 'blur', blur );
					addEvent( input, 'focus', focus );
				});
			}
		}
	});	
	
	return _html5;
}();
