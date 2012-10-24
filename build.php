<?php
$lib_path = "src/";
$lib_name = "src/" . "kitana.js";

createBundle( Array( "utils.js", "event.js", "css.js", "dom.js", "core.js" ), $lib_path, $lib_name );

function createBundle( $files, $path, $bundle )
{
    $file_str = "";

    for ( $i = 0, $ilen = count( $files ); $i < $ilen; $i++ )
    {
        $file_str .= file_get_contents( $path . $files[ $i ]  ) . "\r\n\r\n";
    }

    $file_str = preg_replace( "/window/", "global", $file_str );

    $file_handle = fopen( $bundle, "w+" );
    fwrite( $file_handle, "(function( global )\r\n{\r\n" );
    fwrite( $file_handle, $file_str );
    fwrite( $file_handle, "})( window );" );
    fclose( $file_handle );
}