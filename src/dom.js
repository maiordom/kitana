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