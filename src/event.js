var Event = function() {
    var guid = 0;

    var me = {
        fixEvent: function( e ) {
            e = e || window.event;

            if ( e.isFixed ) { return e; }

            e.isFixed = true;

            e.preventDefault  = e.preventDefault || function() { this.returnValue = false; }
            e.stopPropagation = e.stopPropagaton || function() { this.cancelBubble = true; }

            if ( e.pageX === null && e.clientX !== null ) {
                var html = document.documentElement, body = document.body;
                e.pageX = e.clientX + ( html && html.scrollLeft || body && body.scrollLeft || 0 ) - ( html.clientLeft || 0 );
                e.pageY = e.clientY + ( html && html.scrollTop  || body && body.scrollTop  || 0 ) - ( html.clientTop  || 0 );
            }

            if ( !e.target ) { e.target = e.srcElement; }

            return e;
        },

        commonHandle: function( e ) {
            e = me.fixEvent( e );

            var handlers = this.events[ e.type ];

            for ( var i in handlers ) {
                if ( handlers[ i ].call( this, e ) === false ) {
                    e.preventDefault()
                    e.stopPropagation()
                }
            }
        },

        setHelpers: function( elem, event_type, handler ) {
            if ( elem.setInterval && ( elem != window && !elem.frameElement ) ) {
                elem = window;
            }

            if ( !handler.guid ) { handler.guid = ++guid; }

            if ( !elem.events ) {
                elem.events = {};

                elem.handle = function( event ) {
                    if ( typeof Event !== "undefined" ) {
                        return me.commonHandle.call( elem, event );
                    }
                }
            }

            if ( !elem.events[ event_type ] ) {
                elem.events[ event_type ] = {};

                me.addEvent( elem, event_type );
            }
        },

        addEvent: function( elem, event_type ) {
            if ( elem.addEventListener ) {
                elem.addEventListener( event_type, elem.handle, false );
            }
            else if ( elem.attachEvent ) {
                elem.attachEvent( "on" + event_type, elem.handle );
            }
        },

        removeHandler: function( elem, event_type, handler ) {
            var handlers = elem.events && elem.events[ event_type ]

            if ( !handlers ) { return false; }

            if ( !handler ) {
                Utils.forEach( handlers, function( val, name ) {
                    delete handlers[ name ];
                });

                return true;
            }

            delete handlers[ handler.guid ];

            for ( var any in handlers ) { return false; }

            return true;
        },

        removeEvent: function( elem, event_type ) {
            if ( elem.removeEventListener ) {
                elem.removeEventListener( event_type, elem.handle, false);
            }
            else if ( elem.detachEvent ) {
                elem.detachEvent( "on" + event_type, elem.handle );
            }
        },

        removeHelpers: function( elem, event_type ) {
            delete elem.events[ event_type ];

            for ( var any in elem.events ) { return false; }

            try {
                delete elem.handle;
                delete elem.events;
            }
            catch( e ) /* IE */ {
                elem.removeAttribute( "handle" );
                elem.removeAttribute( "events" );
            }
        },

        mouseenter: function( handler ) {
            return function( e ) {
                e = e || event; /* IE */
                var to_element = e.relatedTarget || e.srcElement; /* IE */

                while ( to_element && to_element !== this ) {
                    to_element = to_element.parentNode;
                }

                if ( to_element === this ) { return; }

                return handler.call( this, e );
            };
        },

        mouseleave: function( handler ) {
            return function( e ) {
                e = e || event; /* IE */
                var to_element = e.relatedTarget || e.toElement; /* IE */

                while ( to_element && to_element !== this ) {
                    to_element = to_element.parentNode;
                }

                if ( to_element === this ) { return; }

                return handler.call( this, e );
            };
        }
    };

    return {

        add: function( elem, event_type, handler ) {
            switch( event_type ) {
                case "mouseleave": { handler = me.mouseleave( handler ); event_type = "mouseout";  } break;
                case "mouseenter": { handler = me.mouseenter( handler ); event_type = "mouseover"; } break;
            }

            me.setHelpers( elem, event_type, handler );

            elem.events[ event_type ][ handler.guid ] = handler;

            return handler;
        },

        remove: function( elem, event_type, handler ) {
            if ( !me.removeHandler( elem, event_type, handler ) ) { return false; }

            me.removeEvent( elem, event_type );
            me.removeHelpers( elem, event_type );
        }
    }
};