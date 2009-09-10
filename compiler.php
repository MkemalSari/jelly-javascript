<?php

#############################################################
#    Configuration
#############################################################

# define a base path for your dev directory
define( 'BASE', 'c:\wamp\www\jelly' ); 

define( 'SRC_PATH', BASE . '/src' );
define( 'BUILD_PATH', BASE . '/build' );
define( 'TOOLS_PATH', BASE . '/tools' );
define( 'YUI_COMPRESSOR', TOOLS_PATH . '/yuicompressor-2.4.2.jar' );

$ini_file = BASE . "/build.conf";

# Accept alternative configuration files when called from the command line
if ( isset( $argv ) && isset( $argv[1] ) ) {
	$ini_file = $argv[1];
} 

$config = parse_ini_file( $ini_file, true );


#############################################################
#    Helpers
#############################################################

$license_content = trim( file_get_contents( BASE . '/licence.txt' ) );
$date = date('Y-m-d');
$license = <<<TXT
/*!

{$license_content}
this build compiled: {$date} 

*/
TXT;

function print_build ( $build, $show_file_tags = true ) {
	
	global $license;
	echo $license;
	echo "\n;(function () {";
	
	$externals = array();
	
	foreach ( $build as $file ) {
		if ( isset( $file[2] ) ) {
			$externals[] = $file;
			continue;
		}
		if ( $show_file_tags ) {
			echo "\n\n/*! {$file[0]} */";
		}
		$contents = trim( file_get_contents( SRC_PATH . "/" . $file[1] . ".js" ) );
		echo "\n\n{$contents}";
	}

	echo "\n})(); // End outer closure";
	
	foreach ( $externals as $file ) {
		if ( $show_file_tags ) {
			echo "\n\n/*! {$file[0]} */";
		}
		$contents = trim( file_get_contents( SRC_PATH . "/" . $file[1] . ".js" ) );
		echo "\n\n{$contents}";
	}
}

function ifset (&$param, $default=array() ) {
	return isset($param) ? $param : $default;
}
function mapto_core( $item ) {
	return array( str_replace( '-', ' ', $item ), "core/{$item}" );
}
function mapto_plugins( $item ) {
	return array( str_replace( '-', ' ', $item ), "plugins/{$item}/{$item}" );
}
function mapto_dev_tools( $item ) {
	return array( str_replace( '-', ' ', $item ), "dev_tools/{$item}" );
}
function mapto_externals( $item ) {
	return array( str_replace( '-', ' ', $item ), "externals/{$item}/{$item}", true );
}


#############################################################
#	Make build order stacks
#############################################################

$build_config = $config['build'];

$core = ifset( $build_config['core'] );
$plugins = ifset( $build_config['plugins'] );
$dev_tools = ifset( $build_config['dev_tools'] );
$externals = ifset( $build_config['externals'] );

$core = array_map( 'mapto_core', $core );
$plugins = array_map( 'mapto_plugins', $plugins );
$dev_tools = array_map( 'mapto_dev_tools', $dev_tools );
$externals = array_map( 'mapto_externals', $externals );

$debug_stack = $core;
$prod_stack = $core;

if ( !empty( $dev_tools ) ) {
	
	# put dev_tools somewhere near the beginning of the stack
	$offset = 2;
	
	if ( count( $debug_stack ) > $offset ) { 
		$base_slice = array_slice( $debug_stack, 0, $offset );
		$top_slice = array_slice( $debug_stack, $offset );
		$debug_stack = array_merge( $base_slice, $dev_tools, $top_slice );
	}
}
if ( !empty( $plugins ) ) {
	$debug_stack = array_merge( $debug_stack, $plugins );
	$prod_stack = array_merge( $prod_stack, $plugins );
}
if ( !empty( $externals ) ) {
	$debug_stack = array_merge( $debug_stack, $externals );
	$prod_stack = array_merge( $prod_stack, $externals );
}


#############################################################
#	Build
#############################################################

ob_start();
print_build ( $debug_stack, false );
$debug_build = ob_get_clean();

# Serve direct requests
#
if ( array_key_exists( 'latest', $_GET ) ) {
	header('Content-type: text/javascript; charset: UTF-8');
	echo $debug_build;
	exit();
} 

ob_start();
print_build ( $prod_stack );
$prod_build = ob_get_clean();

# Compress the production build
#
$options = '';
foreach( $config['compression options'] as $k => $v ) {
	if ( $v == 1 ) { 
		$options .= " --{$k}";
	}
	else if ( $v != 0 ) {
		$options .= " --{$k}={$v}";
	}
	echo $k . '=' . $v;
}
$compressor_path = YUI_COMPRESSOR;
$tmp_file = tempnam( TOOLS_PATH, 'JS_' );
file_put_contents( $tmp_file, $prod_build ); 
$command = <<<CMD
java -jar "{$compressor_path}" --type=js{$options} "{$tmp_file}"
CMD;

ob_start();    
system( $command );
$prod_build = ob_get_clean(); 

unlink( $tmp_file );


#############################################################
#   Output files
#############################################################

$output_config = $config['output options'];
$output_dirs = !empty( $output_config['dir'] ) ? $output_config['dir'] : array();

if ( !empty( $output_config['archive'] ) ) { 
	# output archiving
	$archive_datetime = !empty( $output_config['archive_datetime'] );
	$datetime_stamp = date( 'Y-m-d-H.i.s-' );
	$archive_dir = BUILD_PATH . '/' . date( 'Y-m-d' );
	if ( !is_dir( $archive_dir ) ) {
		mkdir( $archive_dir );
	}
	$output_dirs[] = $archive_datetime ? array( $archive_dir ) : $archive_dir;
}

# always output to the standard build path
$output_dirs[] = BUILD_PATH;

foreach ( $output_dirs as $dir ) {
	$prefix = ''; 
	if ( is_array( $dir ) ) {
		$prefix = $datetime_stamp;
		$dir = $dir[0];
	} 
	file_put_contents( "{$dir}/{$prefix}min.js", $prod_build );	
	file_put_contents( "{$dir}/{$prefix}debug.js", $debug_build );	
}

?>