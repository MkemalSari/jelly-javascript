/**

An 'onhashchange' event handler 
	
@dependencies   
Poll

@api
** handle **  HashChange.subscribe( <fn> handler )
** void **  HashChange.unsubscribe( handle )
	
@example
var handle = HashChange.subscribe( function () { ... } );
HashChange.unsubscribe( handle );

*/
(function () {

var self = J.HashChange = {

		subscribe: function ( fn ) {
			if ( !_nativeSupport ) {
				_handlers[ ++_uid ] = fn;
				_start();
				return _uid;
			}
			else {
				return addEvent( win, 'hashchange', fn );
			}
		},
		
		unSubscribe: function ( handle ) {
			var self = this;
			if ( !_nativeSupport ) { 
				delete _handlers[ handle ];
				if ( empty( _handlers ) ) {
					_stop();
				}
			}
			else {
				removeEvent( handle );
			}
		}	
	},
	
	_nativeSupport = 'onhashchange' in win,
	_uid = 0,
	_handlers = {},
	_hash = '',
	_poller = null,
	
	_cycle = function () {
		var hash = location.hash;
		if ( hash !== _hash ) { 
			for ( var id in _handlers ) {
				try {
					_handlers[ id ]();
				} catch ( ex ) {
					logError( ex );
				}
			}
			_hash = hash;
		}
	},
	
	_start = function () {
		if ( !_poller ) {
			_hash = location.hash;
			_poller = Poll.subscribe( 'fast', _cycle );
		}
	},
	
	_stop = function () {
		if ( _poller ) {
			Poll.unsubscribe( 'fast', _poller );
			_poller = null;
		}
	};
	
})();