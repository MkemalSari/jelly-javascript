# Quick start #

Jelly uses the single namespace 'JELLY' as a base for all utilities. So if you want to use any method or class simply prefix with the namespace.

```

var myFoo = JELLY.createElement( '#foobar' );

// myFoo -> <div id="foobar"></div>

```

Often it is more convenient to wrap your statements in a self excecuting closure. This way you can create shortcuts within the closure for library utilities or other variables you want to frequently use, without creating global variables.

```
(function () { // Start closure

var J = JELLY,
    Q = J.Q;

Q( '#content strong.highlight' ).setStyle( 'color', 'red' );

})(); // End closure
```

Taking things one step further, you can use the `unpack` utility which returns a string of all the library members shortcuted to local variable names. Running `eval` on this returned string will import the whole library namespace into a closure.

```
(function () { // Start closure

// import library
eval( JELLY() );

var navPageTop = createBranch( 
    'li.pager', 
        'a href: "#top", text: "Go to top"' 
    ).root;

Q( '.column-1 ul > li:last-of-type' ).each( function ( el ) {
    insertAfter( el, navPageTop.cloneNode( true ) );
});

})(); // End closure
```

This is certainly the most convenient way to use Jelly, however there is a small overhead for using the `eval`/`unpack` combination (or for any use of `eval` as it is usually quite slow in gecko browsers), so don't use in a loop or inside any repeated function calls unless you really can't avoid it. Though using it sparingly to import namespaces will do no harm.