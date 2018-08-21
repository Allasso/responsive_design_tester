<?php
  error_reporting(E_ALL);
  ini_set('display_errors', 1);

  /* setcookie() will add a response header on its own */
  //setcookie('foo', 'bar');

  /* Define a custom response header
     This will be ignored by most clients */
  //header("X-Sample-Test: foo");

  /* Specify plain text content in our response */
  //header('Content-type: text/plain');

  header("User-Agent: mobile");
  ini_set("user_agent","Well House Robot mobile - see http://www.wellho.net");

  /* What headers are going to be sent? */
  var_dump(headers_list());

  $contents = file_get_contents("../files/fetched_url.html");
  echo $contents;
?>
