var env = {
    root: window,
    doc:  window.document
};

var to_string = Object.prototype.toString,
    slice     = Array.prototype.slice;

var Utils = {
    isString: function( obj ) {
        return to_string.call( obj ) === "[object String]";
    },

    isFunction: function( obj ) {
        return to_string.call( obj ) === "[object Function]";
    },

    isArray: function( obj ) {
        return to_string.call( obj ) === "[object Array]";
    },

    isObject: function( obj ) {
        return to_string.call( obj ) === "[object Object]";
    },

    toArray: function( array ) {
        return slice.call( array, 0 );
    },

    objToArray: function( obj ) {
        var arr = [], i = 0;

        Utils.forEach( obj, function( value, name ) {
            arr[ i++ ] = value;
        });

        return arr;
    },

    forEach: function( obj, callback, ctx ) {
        var name, i = 0, length = obj.length;

        if ( Utils.isObject( obj ) ) {
            for ( name in obj ) {
                if ( !name || obj[ name ] === undefined || !obj.hasOwnProperty( name ) ) {
                    continue;
                }

                if ( callback.call( ctx || obj[ name ], obj[ name ], name ) === false ) { break; }
            }
        }
        else if ( Utils.isArray( obj ) ) {
            for ( ; i < length; i++ ) {
                if ( callback.call( ctx || obj[ i ], obj[ i ], i ) === false ) { break; }
            }
        }

        return obj;
    },

    extend: function( obj, props ) {
        var target = arguments[ 0 ] || {}, i = 1, length = arguments.length, options;

        for ( ; i < length; i++ ) {
            if ( ( options = arguments[ i ] ) !== null ) {
                for ( var name in options ) {
                    if ( !options.hasOwnProperty( name ) ) {
                        continue;
                    }

                    var copy = options[ name ];

                    if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }

        return target;
    }
};