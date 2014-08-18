var FuncExp = function( selector ) {
    return new Kitana( selector );
};

var Kitana = function( selector ) {
    if ( Utils.isString( selector ) ) {
        this._init( DOM.find( selector ), selector );
    }
    else if ( DOM.isNode( selector ) ) {
        this._init( [ selector ], selector.className );
    }
    else {
        this._init( [], "" );
    }
};

Kitana.fn = Kitana.prototype;

Utils.forEach( CSS, function( value, name ) {
    Kitana.fn[ name ] = function() {
        if ( this.length ) {
            return CSS[ name ]( this[ 0 ], arguments[ 0 ], arguments[ 1 ] );
        }
    };
});

Utils.forEach( DOM, function( value, name ) {
    Kitana.fn[ name ] = function() {
        if ( this.length ) {
            return DOM[ name ]( this[ 0 ], arguments[ 0 ], arguments[ 1 ] );
        }
    };
});

Utils.extend( Kitana.fn, {
    _init: function( nodes, selector ) {
        return this._props( nodes, selector );
    },

    _props: function( nodes, selector ) {
        for ( var i = 0, ilen = nodes.length; i < ilen; i++ ) {
            this[ i ] = nodes[ i ];
        }

        this.length = ilen;
        this.selector = selector;

        return this;
    },

    text: function( text ) {
        if ( !this.length ) { return this; }

        if ( arguments.length === 1 ) {
            DOM.setInnerText( this[ 0 ], text );
        }
        else {
            return DOM.getInnerText( this[ 0 ] )
        }

        return this;
    },

    each: function( callback ) {
        for ( var i = 0, ilen = this.length; i < ilen; i++ ) {
            callback.call( this[ i ], this[ i ], i );
        }

        return this;
    },

    add: function( obj ) {
        var me = this, arr = [];

        this.each( function( item ) {
            arr.push( item );
        });

        if ( obj.constructor === Kitana ) {
            obj = obj.get();
        }

        Utils.forEach( obj, function( item ) {
            arr.push( item );
        });

        return this._props.call( new Kitana(), arr, this.selector );
    },

    on: function( event_name, handler ) {
        FuncExp.Event.add( this[ 0 ], event_name, handler );

        return this;
    },

    off: function( event_name, handler ) {
        FuncExp.Event.remove( this[ 0 ], event_name, handler );

        return this;
    },

    slice: function( from, to ) {
        if ( !this.length ) { return this; }

        arguments.length === 1 ? to = this.length :
        arguments.length === 0 ? ( from = 0, to = this.length ) : null;

        var arr = [];

        for ( var i = from; i < to && i < this.length; i++ ) {
            arr.push( this[ i ] );
        }

        return this._props.call( new Kitana(), arr, this.selector );
    },

    find: function( class_list ) {
        if ( !this.length ) { return this; }

        var nodes = [];

        for ( var i = 0, ilen = this.length; i < ilen; i++ ) {
            nodes = nodes.concat( DOM.find( class_list, this[ i ] ) );
        };

        return this._props.call( new Kitana(), nodes, this.selector + " " + class_list );
    },

    tmpl: function( html ) {
        var elem = $.tmpl( html );

        return this._props.call( new Kitana(), [ elem ], elem.className );
    },

    insertBefore: function( elem ) {
        DOM.insertBefore( this[ 0 ], elem );
    },

    eq: function( index ) {
        var elem = this[ index ];

        return this._props.call( new Kitana(), [ elem ], this.selector );
    },

    get: function( index ) {
        var nodes = [];

        if ( arguments.length ) {
            return this[ index ];
        }
        else {
            this.each( function( item, i ) {
                nodes[ i ] = this;
            });
        }

        return nodes;
    },

    css: function( style ) {
        CSS.css( this[ 0 ], style );

        return this;
    },

    addClass: function( class_name ) {
        if ( !this.length ) { return this; }

        CSS.addClass( this[ 0 ], class_name );

        return this;
    },

    removeClass: function( class_name ) {
        if ( !this.length ) { return this; }

        CSS.removeClass( this[ 0 ], class_name );

        return this;
    },

    attr: function( name, value ) {
        if ( !this.length ) { return this; }

        var res = DOM.attr( this[ 0 ], name, value );

        return res || res === null ? res : this;
    },

    removeAttr: function( name ) {
        if ( !this.length ) { return this; }

        DOM.removeAttr( this[ 0 ], name );

        return this;
    }
});

Utils.extend( FuncExp, Utils );
Utils.extend( FuncExp, DOM );
Utils.extend( FuncExp, CSS );

FuncExp.Event    = Event();
env.root.$       = FuncExp;
env.root.Kitana  = FuncExp;
env.root._Kitana = Kitana;