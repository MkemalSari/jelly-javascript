<?php

#############################################################
# Configuration
#############################################################

define( 'BASE', 'c:\wamp\www\jelly' ); 
define( 'SRC_PATH', BASE . '/src' );
define( 'BUILD_PATH', BASE . '/build' );
define( 'ASSET_PATH', BASE . '/tools' );
define( 'YUI_COMPRESSOR', ASSET_PATH . '/yuicompressor-2.4.2.jar' );

$ini_file = "build.ini";
$config = parse_ini_file( BASE . "/{$ini_file}", true );

//print_r( $config);

$use_compression = !empty( $config['compression']['enabled'] );
$archive = !empty( $config['options']['archive'] );


#############################################################
# Helpers
#############################################################

function remove_file_markers ( &$buffer ) {
	$buffer = preg_replace( '#\n+\/\*\!\s+[\w\s-]+\s+\*\/\n+#', "\n\n", $buffer );
}


#############################################################
# Build file
#############################################################

# open a buffer
ob_start();

# Print out licence
$content = trim( file_get_contents( BASE . '/licence.txt' ) );
$date = date('Y-m-d');
echo <<<TXT
/*!
{$content}
this build compiled: {$date} 
*/
TXT;

# Open outer closure
echo <<<TXT
\n(function () {
TXT;

# Collate core files
foreach ( $config['core'] as $filename ) {
	$contents = trim( file_get_contents( SRC_PATH . "/core/{$filename}.js" ) );
	$filename = str_replace( '-', ' ', $filename );
	echo <<<TXT
\n\n/*! {$filename} */\n
{$contents}
TXT;
}

# Collate plugin files
if ( !empty( $config['plugin'] ) ) { 
	foreach ( $config['plugin'] as $filename ) {
		$contents = trim( file_get_contents( SRC_PATH . "/plugins/{$filename}/{$filename}.js" ) );
		$filename = str_replace( '-', ' ', $filename );
		echo <<<TXT
	\n\n/*! {$filename} */\n
	{$contents}
TXT;
	}
}
	
# Close outer closure
echo <<<TXT
\n})(); // End core closure
TXT;
	
# flush buffer to a variable
$buffer = ob_get_clean();


#############################################################
# Handle output
#############################################################

# if called from the testpad
if ( array_key_exists( 'collate', $_GET ) ) {
	remove_file_markers( $buffer );
	header('Content-type: text/javascript; charset: UTF-8');
	echo $buffer;
	exit();
} 

$archive_datestamp = $archive ? date( 'Y-m-d-H.i.s-' ) : '';

$archive_date = date( 'Y-m-d' );
$archive_dir = BUILD_PATH . '/' . $archive_date;
if ( !is_dir( $archive_dir ) ) {
	mkdir( $archive_dir );
}
$output = array();

if ( $use_compression ) {

	$options = '';
	unset( $config['compression']['enabled'] );
	foreach( $config['compression'] as $k => $v ) {
		if ( $v == 1 ) { 
			$options .= " --{$k}";
		}
		else if ( $v != 0 ) {
			$options .= " --{$k}={$v}";
		}
		echo $k . '=' . $v;
	}
		
	$compressor_path = YUI_COMPRESSOR;
	$tmp_file = tempnam( ASSET_PATH, 'JS_' );
	file_put_contents( $tmp_file, $buffer ); 
	$command = <<<CMD
java -jar "{$compressor_path}" --type=js{$options} "{$tmp_file}"
CMD;

//echo $command;
	
	ob_start();    
	system( $command );
	$compressed_buffer = ob_get_clean(); 
	
	# clean up 
	unlink( $tmp_file );
	
	$output[ BUILD_PATH . "/jelly-min.js" ] = $compressed_buffer;
	
	$archived_file = $archive_dir . "/{$archive_datestamp}jelly-min.js";
	$output[ $archived_file ] = $compressed_buffer;
}

remove_file_markers( $buffer );
$output[ BUILD_PATH . "/jelly.js" ] = $buffer;

$archived_file = $archive_dir . "/{$archive_datestamp}jelly.js";
$output[ $archived_file ] = $buffer;

# Create files
foreach ( $output as $file => $content ) {
	file_put_contents( $file, $content );
}

?>