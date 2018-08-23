<?php
  error_reporting(E_ALL);
  ini_set('display_errors', 1);

  $currentURL = trim($_POST["fetch_url"]);

  function absolutizeHref($href, $baseUrl) {
    $href = trim($href);

    if (strpos($href, "http") === 0) {
      return $href;
    }

    if (strpos($href, "//") === 0) {
      $protocol = preg_replace('/(https?:)\/\/.*/', '$1', $baseUrl);
      return $protocol . $href;
    }

    if (strpos($href, "/") === 0) {
      $site = preg_replace('/(https?:\/\/[^\/]*).*/', '$1', $baseUrl);
      return $site . $href;
    }

    // $href is relative...
    $baseParts = explode ('/', $baseUrl);
    $hrefParts = explode ('/', $href);

    $lastSeg = array_pop($baseParts);
    if (strlen($lastSeg) > 0) {
      if (count($baseParts) == 2 || preg_match('/\./', $lastSeg) === 0) {
        // Ooops, looks like either this is the root (count($baseParts) == 2),
        // or it probably was a directory, put it back on...
        // (note, testing for a dot to determine if file or directory is very
        // naive/buggy, since directory names can have a dot, and filenames
        // may not have one.)
        // TODO - come up with something better.
        $baseParts[] = $lastSeg;
      }
    }

    for ($i = 0; $i < count($hrefParts); $i++) {
      if ($hrefParts[$i] === ".") {
        continue;
      }
      if ($hrefParts[$i] === "..") {
        array_pop($baseParts);
      } else {
        $baseParts[] = $hrefParts[$i];
      }
    }
    return implode("/", $baseParts);
  }

  function fixLinks($text, $baseUrl) {
    $new_text = "";
    $segs = preg_split('/((?:href|src)="[^"]*")/', $text, null, PREG_SPLIT_NO_EMPTY | PREG_SPLIT_DELIM_CAPTURE);
    for ($i = 0; $i < count($segs); $i++) {
      $seg = $segs[$i];
      if (strpos($seg, "href=") === 0 || strpos($seg, "src=") === 0) {
        $attribute = preg_replace('/((?:href|src))=.*/', '$1', $seg);
        $link = preg_replace('/(?:href|src)="([^"]*)"/', '$1', $seg);
        $seg_orig = $seg;
        $seg = $attribute . '="' . absolutizeHref($link, $baseUrl) . '"';
      }
      $new_text .= $seg;
    }

    $text = $new_text;
    $new_text = "";
    $segs = preg_split("/((?:href|src)='[^']*')/", $text, null, PREG_SPLIT_NO_EMPTY | PREG_SPLIT_DELIM_CAPTURE);
    for ($i = 0; $i < count($segs); $i++) {
      $seg = $segs[$i];
      if (strpos($seg, "href=") === 0 || strpos($seg, "src=") === 0) {
        $attribute = preg_replace('/((?:href|src))=.*/', '$1', $seg);
        $link = preg_replace("/(?:href|src)='([^']*)'/", '$1', $seg);
        $seg_orig = $seg;
        $seg = $attribute . "='" . absolutizeHref($link, $baseUrl) . "'";
      }
      $new_text .= $seg;
    }

    return $new_text;
  }

  function insertScript($text) {
    $new_text = "";
    $has_head = strpos($text, "</head>") !== false;
    $has_body = strpos($text, "<body") !== false;
    $has_html = strpos($text, "<html") !== false;

    $regex = "";
    $replacement = "\n<script>\n";

//$replacement .= "console.log(\"UA in  : \" + navigator.userAgent);\n";

    $replacement .= "var rspdsg___userAgentMod = \"\"\n";

    if (!isset($_POST["overwrite"])) {
      $replacement .= "rspdsg___userAgentMod += navigator.userAgent;\n";
    }
    if (isset($_POST["spoof_mobile"])) {
      $replacement .= "rspdsg___userAgentMod += \" mobile\";\n";
    }
    if (isset($_POST["ua_string"])) {
      $replacement .= "rspdsg___userAgentMod += \" " . $_POST["ua_string"] . "\";\n";
    }

    $replacement .= "Object.defineProperty(navigator, \"userAgent\", {\n";
    $replacement .=   "get: function() {\n";
    $replacement .=     "return rspdsg___userAgentMod;\n";
    $replacement .=   "}\n";
    $replacement .= "});\n";

//$replacement .= "console.log(\"UA out : \" + navigator.userAgent);\n;";

    $replacement .= "</script>\n";

    if ($has_head) {
      $regex = '/(<head[^<>]*>)/';
      $replacement = "$1" . $replacement;
    } else if ($has_body) {
      $regex = '/(<body[^<>]*>)/';
      $replacement = "$1" . $replacement;
    } else if ($has_html) {
      $regex = '/(<html[^<>]*>)/';
      $replacement = "$1" . $replacement;
    } else if ($has_html) {
      $regex = '/(<!DOCTYPE[^<>]*>)/';
      $replacement = "$1" . $replacement;
    } else {
      $regex = '/^/';
    }

    $new_text = preg_replace($regex, $replacement, $text);

    return $new_text;
  }

  $contents = file_get_contents($currentURL);
  $contents = fixLinks($contents, $currentURL);
  if (isset($_POST["spoof_mobile"]) || isset($_POST["ua_string"])) {
    $contents = insertScript($contents);
  }

  file_put_contents("../files/fetched_url.html", $contents);
?>
