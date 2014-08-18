var CSS = {
    elemRect: function( elem, ignore_scroll ) {
        var rect = elem.getBoundingClientRect(), result = {};

        result = {
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

    offset: function( elem ) {
        var left = 0, top = 0;

        while ( elem ) {
            left += ( elem.offsetLeft - elem.scrollLeft + elem.clientLeft );
            top  += ( elem.offsetTop  - elem.scrollTop  + elem.clientTop );
            elem = elem.offsetParent;
        }

        return { left: left, top: top };
    },

    outerWidth: function( elem ) {
        return elem.offsetWidth;
    },

    outerHeight: function( elem ) {
        return elem.offsetHeight;
    },

    css: function( elem, style ) {
        for ( var i in style ) {
            elem.style[ i ] = style[ i ];
        }
    },

    hasClass: function( elem, class_name ) {
        return elem.className.match( new RegExp( "(\\s|^)" + class_name + "(\\s|$)" ) );
    },

    addClass: function( elem, class_name ) {
        if ( this.hasClass( elem, class_name ) ) { return false; }

        var re = new RegExp( "(^|\\s)" + class_name + "(\\s|$)", "g" );

        if ( re.test( elem.className ) ) { return false; };

        elem.className = ( elem.className + " " + class_name ).replace( /\s+/g, " " ).replace( /(^ | $)/g, "" );
    },

    removeClass: function ( elem, class_name ) {
        if ( !this.hasClass( elem, class_name ) ) { return false; }

        var re = new RegExp( "(^|\\s)" + class_name + "(\\s|$)", "g" );

        elem.className = elem.className.replace( re, "$1" ).replace( /\s+/g, " " ).replace( /(^ | $)/g, "" );
    }
};