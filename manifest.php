<?php
header('Content-Type: application/manifest+json; charset=utf-8');

$baseFolder = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\') . '/';
$configFile = __DIR__ . '/MapQuizzzes.json';
$quizName = 'MapQuizzzes';

if (file_exists($configFile)) {
    $jsonContent = file_get_contents($configFile);
    $config = json_decode($jsonContent, true);
    if (json_last_error() === JSON_ERROR_NONE && !empty($config['quizName'])) {
        $quizName = $config['quizName'];
    }
}

$manifestData = [
    "name" => $quizName,
    "short_name" => $quizName,
    "description" => "MapQuizzzes",
    "start_url" => $baseFolder,
    "scope" => $baseFolder,
    "display" => "standalone",
    "display_override" => ["standalone", "minimal-ui"],
    "background_color" => "#ffffff",
    "theme_color" => "#ffffff",
    "icons" => [
        [
            "src" => "images/icon-192.png",
            "sizes" => "192x192",
            "type" => "image/png",
            "purpose" => "any"
        ],
        [
            "src" => "images/icon-512.png",
            "sizes" => "512x512",
            "type" => "image/png",
            "purpose" => "any"
        ]
    ]
];

echo json_encode($manifestData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
?>
