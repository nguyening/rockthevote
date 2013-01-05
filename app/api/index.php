<?php
require 'app/lib/Slim/Slim.php';
\Slim\Slim::registerAutoloader();
require 'app/lib/NotORM/NotORM.php';
require 'app/lib/helper.php';
require 'php_creds.php';

$pdo = new PDO('mysql:host=localhost;port=3306;dbname=test', $username, $password);
$db = new NotORM($pdo);

$app = new \Slim\Slim(array(
	'debug' => true
	));

$app->get('/', function() { echo 'You\'re not in the right place.'; });

foreach(glob('app/routes/*.php') as $filename)		// Add in all routes defined in app/routes/
	require $filename;
$app->run();

?>