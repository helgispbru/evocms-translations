<?php
if (!defined('MODX_BASE_PATH')) {
    die('HACK???');
}

$location = MODX_BASE_PATH . 'assets/modules/translations/dist/index.html';

if (file_exists($location)) {
    return file_get_contents($location, true);
} else {
    die("Error: File not found.");
}
