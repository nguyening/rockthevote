<?php
require 'Slim/Slim.php';
try {
	\Slim\Slim::registerAutoloader();
	$db = new PDO('mysql:host=localhost;port=3306;dbname=test', 'testuser', 'testpass');
	// $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
	$app = new \Slim\Slim(array(
		'debug' => true
		));
}
catch(Exception $ex) {
	header('HTTP/1.1 500 Internal Server Error');
	exit();
}

$app->get('/', function() { echo 'You\'re not in the right place.'; });

/* ELECTION ROUTING */
$app->get('/election', 'getElections');					// Showing list of elections
$app->get('/election/:id', 'getElection');				// Showing details of a single election
$app->put('/election(/:id)', 'putElection');			// Add/editing an existing election
$app->delete('/election/:id', 'deleteElection');		// Deleting an election
$app->get('/election/:id/voters', 'getVoters');			// Show voters for an election

function getElections() {
	global $app, $db;
	$elections = [];

	try {
		$election_rows = $db->query('SELECT `id`, `title` FROM `elections`');
		foreach($election_rows as $election)
			array_push($elections, $election);

		$app->response()->header('Content-type', 'application/json');
		echo json_encode($elections);
	}
	catch(PDOException $ex) {
		$app->response()->status(500);
		echo $ex->getMessage();
	}
}

function getElection($id) {
	global $app, $db;
	try {
		// TODO: Construct object with JOINs over multiple SELECTs
		/* ELECTION DETAILS */
		$election_query = $db->prepare('SELECT * FROM elections WHERE id = ?');
		$election_query->bindParam(1, $id, PDO::PARAM_INT);
		$election_query->execute();
		$election = $election_query->fetchObject();

		/* POSITIONS */
		$election->positions = array();
		
		$runner_query = $db->prepare('SELECT * FROM runners WHERE position_id = ?');
		$voter_query = $db->prepare('SELECT * FROM voters WHERE runner_id = ?');
		$position_query = $db->prepare('SELECT * FROM positions WHERE election_id = ?');
		$position_query->bindParam(1, $id, PDO::PARAM_INT);
		$position_query->execute();
		while($position = $position_query->fetchObject()) {
			$position->runners = array();

			$runner_query->bindParam(1, $position->id, PDO::PARAM_INT);
			$runner_query->execute();
			while($runner = $runner_query->fetchObject()) {	
				// $runner->voters = array();
				
				$voter_query->bindParam(1, $runner->id, PDO::PARAM_INT);
				$voter_query->execute();
				// while($voter = $voter_query->fetchObject()) {
				// 	unset($voter->email);
				// 	unset($voter->election_id);
				// 	unset($voter->id);
				// 	array_push($runner->voters, $voter);
				// }
				$runner->votes = count($voter_query->fetchAll());
				// unset($runner->id);
				unset($runner->position_id);
				array_push($position->runners, $runner);
			}

			// unset($position->id);
			unset($position->election_id);
			array_push($election->positions, $position);
		}

		echo json_encode($election);

	}
	catch(PDOException $ex) {
		$app->response()->status(500);
		echo $ex->getMessage();
	}
	catch(Exception $ex) {
		$app->response()->status(400);
		echo $ex->getMessage();
	}

}

function putElection() {
	global $app, $db;
	$election_id = null;
	if($args = func_get_args())
		$election_id = $args[0];

	try {
		$election = json_decode($app->request()->getBody());

		/* ELECTIONS */
		if($election_id) {										// UPDATE
			$election_query = $db->prepare('UPDATE elections
												SET title = ?,
													start = ?,
													end = ?,
													notes = ?
												WHERE id = ?');
			$election_query->execute(array($election->title, 
											$election->start, 
											$election->end, 
											$election->notes, 
											$election_id));
		}
		else {													// INSERT
			$election_query = $db->prepare('INSERT INTO elections
												(title, start, end, notes)
												VALUES (?, ?, ?, ?)');
			$election_query->execute(array($election->title, 
											$election->start, 
											$election->end, 
											$election->notes));
			if(!$election_query->rowCount())
				throw new Exception('Unable to insert new election');
			else
				$election_id = $db->lastInsertId();
		}

		/* FLUSH OLD DATA */
		$query = $db->prepare('DELETE FROM runners
								WHERE EXISTS (
									SELECT * FROM positions
									WHERE positions.id = runners.position_id
									AND positions.election_id = ?)');
		$query->bindParam(1, $election_id, PDO::PARAM_INT);
		$query->execute();
		
		$query = $db->prepare('DELETE FROM positions WHERE election_id = ?');
		$query->bindParam(1, $election_id, PDO::PARAM_INT);
		$query->execute();

		$query = $db->prepare('DELETE FROM voters WHERE election_id = ?)');
		$query->bindParam(1, $election_id, PDO::PARAM_INT);
		$query->execute();

		/* POSITIONS */
		$position_query = $db->prepare('INSERT INTO positions (title, election_id) VALUES(?, ?)');
		$runner_query = $db->prepare('INSERT INTO runners (name, year, concentration, position_id) VALUES(?, ?, ?, ?)');

		foreach($election->positions as $position) {
			$position_query->execute(array($position->title, $election_id));
			$position_id = $db->lastInsertId();

			/* RUNNERS */
			foreach($position->runners as $runner) {
				$runner_query->execute(array($runner->name,
												$runner->year,
												$runner->concentration,
												$position_id));
			}
		}

		echo $election_id;
	} 
	catch(PDOException $ex) {
		$app->response()->status(500);
		echo $ex->getMessage();
	}
	catch(Exception $ex) {
		$app->response()->status(400);
		echo $ex->getMessage();
	}
}

function deleteElection($election_id) {
	global $app, $db;
	try {
		$query = $db->prepare('DELETE FROM elections WHERE id = ?');
		$query->execute(array($election_id));
		$query = $db->prepare('DELETE FROM runners
							WHERE EXISTS (
								SELECT * FROM positions
								WHERE positions.id = runners.position_id
								AND positions.election_id = ?)');
		$query->bindParam(1, $election_id, PDO::PARAM_INT);
		$query->execute();
		$query = $db->prepare('DELETE FROM positions WHERE election_id = ?');
		$query->bindParam(1, $election_id, PDO::PARAM_INT);
		$query->execute();
		$query = $db->prepare('DELETE FROM voters WHERE election_id = ?)');
		$query->bindParam(1, $election_id, PDO::PARAM_INT);
		$query->execute();
	}
	catch(PDOException $ex) {
		$app->response()->status(500);
		echo $ex->getMessage();
	}
	catch(Exception $ex) {
		$app->response()->status(400);
		echo $ex->getMessage();
	}
}

function getVoters($election_id) {
	global $app, $db;
	try {
		$query = $db->prepare('SELECT * FROM voters WHERE election_id = ?');
		$query->bindParam(1, $election_id, PDO::PARAM_INT);
		$query->execute();
		$voters = array();
		while($voter = $query->fetchObject()) {
			unset($voter->election_id);
			unset($voter->runner_id);
			array_push($voters, $voter);
		}
		echo json_encode($voters);
	}
	catch(PDOException $ex) {
		$app->response()->status(500);
		echo $ex->getMessage();
	}
	catch(Exception $ex) {
		$app->response()->status(400);
		echo $ex->getMessage();
	}
}

/* VOTER ROUTING */
$app->delete('/voter/:vid', 'deleteVoter');
$app->put('/voter(/:vid)', 'putVoter');		// Add/update a voter to an election

function deleteVoter($vid) {
	global $app, $db;
	try {
		$query = $db->prepare('DELETE FROM voters WHERE id = ?)');
		$query->bindParam(1, $vid, PDO::PARAM_INT);
		$query->execute();
	}
	catch(PDOException $ex) {
		$app->response()->status(500);
		echo $ex->getMessage();
	}
	catch(Exception $ex) {
		$app->response()->status(400);
		echo $ex->getMessage();
	}
}

function putVoter() {
	global $app, $db;

	try {
		$voter_id = func_get_args() ? func_get_args()[0] : null;
		$voter = json_decode($app->request()->getBody(), true);

		if($voter_id) {
			$voter_query = $db->prepare('UPDATE voters SET email = ?, runner_id = ? WHERE id = ?');
			$voter_query->bindParam(1, $voter['email'], PDO::PARAM_STR);
			$voter_query->bindParam(2, $voter['runner_id'], PDO::PARAM_INT);
			$voter_query->bindParam(3, $voter_id, PDO::PARAM_INT);
			$voter_query->execute();
		}
		else {
			$voter_query = $db->prepare('INSERT INTO voters (email, runner_id, election_id) VALUES(?, ?, ?)');
			$voter_query->bindParam(1, $voter['email'], PDO::PARAM_STR);
			$voter_query->bindParam(2, $voter['runner_id'], PDO::PARAM_INT);
			$voter_query->bindParam(3, $voter['election_id'], PDO::PARAM_INT);
			$voter_query->execute();
			$voter_id = $db->lastInsertId();
		}
		echo $voter_id;
	}
	catch(PDOException $ex) {
		$app->response()->status(500);
		echo $ex->getMessage();
	}
	catch(Exception $ex) {
		$app->response()->status(400);
		echo $ex->getMessage();
	}
}

$app->run();
?>