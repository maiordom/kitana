(function( global )
{
var env =
{
    root: global,
    doc:  global.document
};

var to_string = Object.prototype.toString,
    slice     = Array.prototype.slice;

var Utils =
{
    isString: function( obj )
    {
        return to_string.call( obj ) === "[object String]";
    },

    isFunction: function( obj )
    {
        return to_string.call( obj ) === "[object Function]";
    },

    isArray: function( obj )
    {
        return to_string.call( obj ) === "[object Array]";
    },

    isObject: function( obj )
    {
        return to_string.call( obj ) === "[object Object]";
    },

    toArray: function( array )
    {
        return slice.call( array, 0 );
    },

    objToArray: function( obj )
    {
        var arr = [], i = 0;

        Utils.forEach( obj, function( value, name )
        {
            arr[ i++ ] = value;
        });

        return arr;
    },

    forEach: function( obj, callback, ctx )
    {
        var name, i = 0, length = obj.length;

        if ( Utils.isObject( obj ) )
        {
            for ( name in obj )
            {
                if ( !name || obj[ name ] === undefined || !obj.hasOwnProperty( name ) )
                {
                    continue;
                }

                if ( callback.call( ctx || obj[ name ], obj[ name ], name ) === false ) { break; }
            }
        }
        else if ( Utils.isArray( obj ) )
        {
            for ( ; i < length; i++ )
            {
                if ( callback.call( ctx || obj[ i ], obj[ i ], i ) === false ) { break; }
            }
        }

        return obj;
    },

    extend: function( obj, props )
    {
        var target = arguments[ 0 ] || {}, i = 1, length = arguments.length, options;

        for ( ; i < length; i++ )
        {
            if ( ( options = arguments[ i ] ) !== null )
            {
                for ( var name in options )
                {
                    if ( !options.hasOwnProperty( name ) )
                    {
                        continue;
                    }

                    var copy = options[ name ];

                    if ( copy !== undefined )
                    {
                        target[ name ] = copy;
                    }
                }
            }
        }

        return target;
    }
};

var Event = function()
{
    var guid = 0;

    var me =
    {
        fixEvent: function( e )
        {
            e = e || global.event;

            if ( e.isFixed ) { return e; }

            e.isFixed = true;

            e.preventDefault  = e.preventDefault || function() { this.returnValue = false; }
            e.stopPropagation = e.stopPropagaton || function() { this.cancelBubble = true; }

            if ( e.pageX === null && e.clientX !== null )
            {
                var html = document.documentElement, body = document.body;
                e.pageX = e.clientX + ( html && html.scrollLeft || body && body.scrollLeft || 0 ) - ( html.clientLeft || 0 );
                e.pageY = e.clientY + ( html && html.scrollTop  || body && body.scrollTop  || 0 ) - ( html.clientTop  || 0 );
            }

            if ( !e.target ) { e.target = e.srcElement; }

            return e;
        },

        commonHandle: function( e )
        {
            e = me.fixEvent( e )

            var handlers = this.events[ e.type ]

            for ( var i in handlers )
            {
                if ( handlers[ i ].call( this, e ) === false )
                {
                    e.preventDefault()
                    e.stopPropagation()
                }
            }
        },

        setHelpers: function( elem, event_type, handler )
        {
            if ( elem.setInterval && ( elem != global && !elem.frameElement ) )
            {
                elem = global;
            }

            if ( !handler.guid ) { handler.guid = ++guid; }

            if ( !elem.events )
            {
                elem.events = {};

                elem.handle = function( event )
                {
                    if ( typeof Event !== "undefined" )
                    {
                        return me.commonHandle.call( elem, event );
                    }
                }
            }

            if ( !elem.events[ event_type ] )
            {
                elem.events[ event_type ] = {};

                me.addEvent( elem, event_type );
            }
        },

        addEvent: function( elem, event_type )
        {
            if ( elem.addEventListener )
            {
                elem.addEventListener( event_type, elem.handle, false );
            }
            else if ( elem.attachEvent )
            {
                elem.attachEvent( "on" + event_type, elem.handle );
            }
        },

        removeHandler: function( elem, event_type, handler )
        {
            var handlers = elem.events && elem.events[ event_type ]

            if ( !handlers ) { return false; }

            if ( !handler )
            {
                Utils.forEach( handlers, function( val, name )
                {
                    delete handlers[ name ];
                });

                return true;
            }

            delete handlers[ handler.guid ];

            for ( var any in handlers ) { return false; }

            return true;
        },

        removeEvent: function( elem, event_type )
        {
            if ( elem.removeEventListener )
            {
                elem.removeEventListener( event_type, elem.handle, false);
            }
            else if ( elem.detachEvent )
            {
                elem.detachEvent( "on" + event_type, elem.handle );
            }
        },

        removeHelpers: function( elem, event_type )
        {
            delete elem.events[ event_type ];

            for ( var any in elem.events ) { return false; }

            try
            {
                delete elem.handle;
                delete elem.events;
            }
            catch( e ) /* IE */
            {
                elem.removeAttribute( "handle" );
                elem.removeAttribute( "events" );
            }
        },

        mouseenter: function( handler )
        {
            return function( e )
            {
                e = e || event; /* IE */
                var to_element = e.relatedTarget || e.srcElement; /* IE */

                while ( to_element && to_element !== this )
                {
                    to_element = to_element.parentNode;
                }

                if ( to_element === this ) { return; }

                return handler.call( this, e );
            };
        },

        mouseleave: function( handler )
        {
            return function( e )
            {
                e = e || event; /* IE */
                var to_element = e.relatedTarget || e.toElement; /* IE */

                while ( to_element && to_element !== this )
                {
                    to_element = to_element.parentNode;
                }

                if ( to_element === this ) { return; }

                return handler.call( this, e );
            };
        }
    };

    return {

        add: function( elem, event_type, handler )
        {
            switch( event_type )
            {
                case "mouseleave": { handler = me.mouseleave( handler ); event_type = "mouseout";  } break;
                case "mouseenter": { handler = me.mouseenter( handler ); event_type = "mouseover"; } break;
            }

            me.setHelpers( elem, event_type, handler );

            elem.events[ event_type ][ handler.guid ] = handler;

            return handler;
        },

        remove: function( elem, event_type, handler )
        {
            if ( !me.removeHandler( elem, event_type, handler ) ) { return false; }

            me.removeEvent( elem, event_type );
            me.removeHelpers( elem, event_type );
        }
    }
};

var CSS =
{
    elemRect: function( elem, ignore_scroll )
    {
        var rect = elem.getBoundingClientRect(), result = {};

        result =
        {
            top:    rect.top | 0,
            left:   rect.left | 0,
            right:  rect.right | 0,
            bottom: rect.bottom | 0,
            width:  ( rect.right - rect.left ) | 0,
            height: ( rect.bottom - rect.top ) | 0
        };

        if ( ignore_scroll ) { return result; }

        result.top += env.root.pageYOffset || env.doc.body.scrollTop;
        result.top += env.root.pageXOffset || env.doc.body.scrollLeft;

        return result;
    },

    offset: function( elem )
    {
        var left = 0, top = 0;

        while ( elem )
        {
            left += ( elem.offsetLeft - elem.scrollLeft + elem.clientLeft );
            top  += ( elem.offsetTop  - elem.scrollTop  + elem.clientTop );
            elem = elem.offsetParent;
        }

        return { left: left, top: top };
    },

    outerWidth: function( elem )
    {
        return elem.offsetWidth;
    },

    outerHeight: function( elem )
    {
        return elem.offsetHeight;
    },

    css: function( elem, style )
    {
        for ( var i in style )
        {
            elem.style[ i ] = style[ i ];
        }
    },

    hasClass: function( elem, class_name )
    {
        return elem.className.match( new RegExp( "(\\s|^)" + class_name + "(\\s|$)" ) );
    },

    addClass: function( elem, class_name )
    {
        if ( this.hasClass( elem, class_name ) ) { return false; }

        var re = new RegExp( "(^|\\s)" + class_name + "(\\s|$)", "g" );

        if ( re.test( elem.className ) ) { return false; };

        elem.className = ( elem.className + " " + class_name ).replace( /\s+/g, " " ).replace( /(^ | $)/g, "" );
    },

    removeClass: function ( elem, class_name )
    {
        if ( !this.hasClass( elem, class_name ) ) { return false; }

        var re = new RegExp( "(^|\\s)" + class_name + "(\\s|$)", "g" );

        elem.className = elem.className.replace( re, "$1" ).replace( /\s+/g, " " ).replace( /(^ | $)/g, "" );
    }
};

var DOM =
{
    isNode: function( node )
    {
        return typeof node === "object" && "nodeType" in node && node.nodeType === 1;
    },

    focus: function( elem )
    {
        setTimeout( function()
        {
            elem.focus();
        }, 10 );
    },

    blur: function( elem )
    {
        elem.blur();
    },

    removeAttr: function( elem, name )
    {
        if ( elem.hasAttribute( name ) )
        {
            elem.removeAttribute( name );
        }
    },

    attr: function( elem, name, value )
    {
        if ( value === undefined )
        {
            return elem.getAttribute( name );
        }
        else
        {
            if ( elem.hasAttribute( name ) )
            {
                elem.removeAttribute( name );
            }

            elem.setAttribute( name, value );
        }
    },

    getInnerText: function( elem )
    {
        return typeof elem.textContent === "string" ? elem.textContent : elem.innerText;
    },

    setInnerText: function( elem, text )
    {
        typeof elem.textContent === "string" ? elem.textContent = text : elem.innerText = text;
    },

    html: function( elem, html )
    {
        return html !== undefined ? elem.innerHTML = html : elem.innerHTML;
    },

    val: function( elem, html )
    {
        return html !== undefined ? elem.value = html : elem.value;
    },

    childrens: function( elem )
    {
        return elem.children;
    },

    tmpl: function( tmpl )
    {
        var div = document.createElement( "div" );

        div.innerHTML = tmpl;

        return div.firstChild;
    },

    insertBefore: function( new_node, ref_node )
    {
        ref_node.parentNode.insertBefore( new_node, ref_node );
    },

    find: function( class_list, elem )
    {
        if ( class_list.charAt( 0 ) === "." )
        {
            return this.getElementsByClassName( class_list.substr( 1 ), elem );
        }
    },

    getElementsByClassName: function( class_list, elem )
    {
        if ( document.getElementsByClassName )
        {
            var res = [], nodes = ( elem || document ).getElementsByClassName( class_list );

            for ( var i = 0, ilen = nodes.length; i < ilen; i++ )
            {
                 res[ i ] = nodes[ i ];
            }
        }
        else
        {
            var node = elem || document,
                list = node.getElementsByTagName( "*" ),
                arr  = class_list.split( /\s+/ ),
                res  = [];

            for ( var i = 0, ilen = list.length; i < ilen; i++ )
            for ( var j = 0, jlen = arr.length;  j < jlen; j++ )
            {
                if ( list[ i ].className.search( "\\b" + arr[ j ] + "\\b") != -1 )
                {
                    res.push( list[ i ] )
                    break;
                }
            }
        }

        return res;
    },

    append: function( elem, node )
    {
        elem.appendChild( node );
    },

    remove: function( elem )
    {
        if ( elem && elem.parentNode )
        {
            elem.parentNode.removeChild( elem );
        }
    }
};

var FuncExp = function( selector )
{
    return new Kitana( selector );
};

var Kitana = function( selector )
{
    if ( Utils.isString( selector ) )
    {
        this._init( DOM.find( selector ), selector );
    }
    else if ( DOM.isNode( selector ) )
    {
        this._init( [ selector ], selector.className );
    }
    else
    {
        this._init( [], "" );
    }
};

Kitana.fn = Kitana.prototype;

Utils.forEach( CSS, function( value, name )
{
    Kitana.fn[ name ] = function()
    {
        if ( this.length )
        {
            return CSS[ name ]( this[ 0 ], arguments[ 0 ], arguments[ 1 ] );
        }
    };
});

Utils.forEach( DOM, function( value, name )
{
    Kitana.fn[ name ] = function()
    {
        if ( this.length )
        {
            return DOM[ name ]( this[ 0 ], arguments[ 0 ], arguments[ 1 ] );
        }
    };
});

Utils.extend( Kitana.fn,
{
    _init: function( nodes, selector )
    {
        return this._props( nodes, selector );
    },

    _props: function( nodes, selector )
    {
        for ( var i = 0, ilen = nodes.length; i < ilen; i++ )
        {
            this[ i ] = nodes[ i ];
        }

        this.length = ilen;
        this.selector = selector;

        return this;
    },

    text: function( text )
    {
        if ( !this.length ) { return this; }

        if ( arguments.length === 1 )
        {
            DOM.setInnerText( this[ 0 ], text );
        }
        else
        {
            return DOM.getInnerText( this[ 0 ] )
        }

        return this;
    },

    each: function( callback )
    {
        for ( var i = 0, ilen = this.length; i < ilen; i++ )
        {
            callback.call( this[ i ], this[ i ], i );
        }

        return this;
    },

    add: function( obj )
    {
        var me = this, arr = [];

        this.each( function( item )
        {
            arr.push( item );
        });

        if ( obj.constructor === Kitana )
        {
            obj = obj.get();
        }

        Utils.forEach( obj, function( item )
        {
            arr.push( item );
        });

        return this._props.call( new Kitana(), arr, this.selector );
    },

    on: function( event_name, handler )
    {
        FuncExp.Event.add( this[ 0 ], event_name, handler );

        return this;
    },

    off: function( event_name, handler )
    {
        FuncExp.Event.remove( this[ 0 ], event_name, handler );

        return this;
    },

    slice: function( from, to )
    {
        if ( !this.length ) { return this; }

        arguments.length === 1 ? to = this.length :
        arguments.length === 0 ? ( from = 0, to = this.length ) : null;

        var arr = [];

        for ( var i = from; i < to && i < this.length; i++ )
        {
            arr.push( this[ i ] );
        }

        return this._props.call( new Kitana(), arr, this.selector );
    },

    find: function( class_list )
    {
        if ( !this.length ) { return this; }

        var nodes = [];

        for ( var i = 0, ilen = this.length; i < ilen; i++ )
        {
            nodes = nodes.concat( DOM.find( class_list, this[ i ] ) );
        };

        return this._props.call( new Kitana(), nodes, this.selector + " " + class_list );
    },

    tmpl: function( html )
    {
        var elem = $.tmpl( html );

        return this._props.call( new Kitana(), [ elem ], elem.className );
    },

    insertBefore: function( elem )
    {
        DOM.insertBefore( this[ 0 ], elem );
    },

    eq: function( index )
    {
        var elem = this[ index ];

        return this._props.call( new Kitana(), [ elem ], this.selector );
    },

    get: function( index )
    {
        var nodes = [];

        if ( arguments.length )
        {
            return this[ index ];
        }
        else
        {
            this.each( function( item, i )
            {
                nodes[ i ] = this;
            });
        }

        return nodes;
    },

    css: function( style )
    {
        CSS.css( this[ 0 ], style );

        return this;
    },

    addClass: function( class_name )
    {
        if ( !this.length ) { return this; }

        CSS.addClass( this[ 0 ], class_name );

        return this;
    },

    removeClass: function( class_name )
    {
        if ( !this.length ) { return this; }

        CSS.removeClass( this[ 0 ], class_name );

        return this;
    },

    attr: function( name, value )
    {
        if ( !this.length ) { return this; }

        var res = DOM.attr( this[ 0 ], name, value );

        return res || res === null ? res : this;
    },

    removeAttr: function( name )
    {
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

})( window );