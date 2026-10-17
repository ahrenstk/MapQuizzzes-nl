<?php
/* -----------------------------------------------------------------------------

MapQuizzzes - version 2026-09-21

License: MIT

The MIT License (MIT)

Copyright (c) 2026 Heinrich Ahrens - heinz.ahrens@web.de

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

----------------------------------------------------------------------------- */

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");


define('ALLOWED_INLINE_TAGS', [
    'a', 'b', 'strong', 'i', 'em', 'br', 'p', 'span', 'div', 'small', 'hr',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'mark', 'sub', 'sup', 'del', 'ins', 's',
    'blockquote', 'cite', 'code', 'kbd', 'pre', 'abbr', 'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'img', 'figure', 'figcaption',
    'audio', 'source', 'details', 'summary'
]);


function sanitizeInlineHtml($html, $allowedTags = ALLOWED_INLINE_TAGS) {
    $clean = trim(strip_tags((string)$html, $allowedTags));
    if (empty($clean)) {
        return "";
    }

    if (strpos($clean, '<a') !== false) {
        $dom = new DOMDocument();
        libxml_use_internal_errors(true);

        $dom->loadHTML('<meta http-equiv="Content-Type" content="text/html; charset=utf-8"><div>' . $clean . '</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();

        foreach ($dom->getElementsByTagName('a') as $a) {
            $href = $a->getAttribute('href');
            $isSafeUrl = filter_var($href, FILTER_VALIDATE_URL) && preg_match('/^https?:/i', $href);
            $isRelative = preg_match('/^\/[^\/]/', $href) || preg_match('/^[a-zA-Z0-9_\-\/]+\.(html?|txt|zip|pdf)$/i', $href);

            if (!$isSafeUrl && !$isRelative) {
                $a->removeAttribute('href');
            }

            $allowedAttrs = ['href', 'target', 'rel', 'style', 'title', 'class'];
            foreach (iterator_to_array($a->attributes) as $attr) {
                if (strpos(strtolower($attr->name), 'on') === 0 || !in_array(strtolower($attr->name), $allowedAttrs, true)) {
                    $a->removeAttribute($attr->name);
                }
            }
        }

        $wrapper = $dom->getElementsByTagName('div')->item(0);
        if ($wrapper) {
            $output = '';
            foreach ($wrapper->childNodes as $child) {
                $output .= $dom->saveHTML($child);
            }

            return preg_replace('/\s+/', ' ', trim($output));
        }
    }

    return $clean;
}


function loadMappingTable($folder, $configFile = "quizdata.json") 
{
    $folderStr = (string)$folder;
    $configFileStr = (string)$configFile;

    if (strpos($folderStr, '..') !== false || strpos($configFileStr, '..') !== false) {
        return [];
    }

    $fullPath = __DIR__ . "/" . $folderStr . "/" . $configFileStr;
    $modalHeaderTxtDir = __DIR__ . "/" . $folderStr . "/modalheader/";
    $modalFooterTxtDir = __DIR__ . "/" . $folderStr . "/modalfooter/";
    $extraModalTxtDir  = __DIR__ . "/" . $folderStr . "/modalextra/";

    if (!file_exists($fullPath) || !is_readable($fullPath)) {
        return [];
    }

    $jsonContent = @file_get_contents($fullPath);
    if ($jsonContent === false) {
        return [];
    }

    $data = json_decode($jsonContent, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        return [];
    }

    $readTxtFile = function($dir, $id) {
        $idStr = (string)$id;
        if (strpos($idStr, '..') !== false) {
            return "";
        }
        $file = $dir . $idStr . ".txt";
        if (file_exists($file) && is_readable($file)) {
            $content = @file_get_contents($file);
            return $content !== false ? sanitizeInlineHtml($content) : "";
        }
        return "";
    };

    $mappingData = [];

    foreach ($data as $item) {
        if (!is_array($item)) {
            continue;
        }

        $id = isset($item["id"]) ? trim((string)$item["id"]) : "";
        if ($id === "" || strpos($id, '..') !== false) {
            continue;
        }

        $number = (isset($item["number"]) && $item["number"] !== null) ? trim((string)$item["number"]) : "";
        $titleValue = (isset($item["title"]) && $item["title"] !== null) ? (string)$item["title"] : "";
        
        $modalHeaderTxt = $readTxtFile($modalHeaderTxtDir, $id);
        $modalFooterTxt = $readTxtFile($modalFooterTxtDir, $id);
        $extraModalTxt  = $readTxtFile($extraModalTxtDir, $id);

        $link = trim((string)($item["link"] ?? ''));
        $validLink = (filter_var($link, FILTER_VALIDATE_URL) && preg_match('/^https?:/i', $link)) ? $link : "";

        $mappingData[$id] = [
            "number" => $number,
            "title" => $titleValue,
            "largetitle" => isset($item["largetitle"]) ? (string)$item["largetitle"] : $titleValue,
            "question" => isset($item["question"]) ? (string)$item["question"] : "",
            "hint" => isset($item["hint"]) ? (string)$item["hint"] : "",
            "answer" => isset($item["answer"]) ? (string)$item["answer"] : "",
            "wrong1" => isset($item["wrong1"]) ? (string)$item["wrong1"] : "",
            "wrong2" => isset($item["wrong2"]) ? (string)$item["wrong2"] : "",
            "wrong3" => isset($item["wrong3"]) ? (string)$item["wrong3"] : "",
            
            "latitude" => (isset($item["latitude"]) && is_numeric($item["latitude"])) ? (float)$item["latitude"] : null,
            "longitude" => (isset($item["longitude"]) && is_numeric($item["longitude"])) ? (float)$item["longitude"] : null,
            "gpxShow" => (isset($item["gpxShow"]) && is_numeric($item["gpxShow"])) ? (float)$item["gpxShow"] : null,
            
            "info" => isset($item["info"]) ? (string)$item["info"] : "",
            "link" => $validLink,
            "modalHeaderTxt" => $modalHeaderTxt,
            "modalFooterTxt" => $modalFooterTxt,
            "extraModalTxt"  => $extraModalTxt,
            "stepbystep" => isset($item["stepbystep"]) ? (bool)$item["stepbystep"] : true
        ];
    }

    return $mappingData;
}


$configFile = __DIR__ . "/MapQuizzzes.json";
$quizDataConfigJsonFile = "quizdata.json";

// Fallback values
$selectedLang = "en";
$quizName = "MapQuizzzes";
$instructionsUrl = "instructions.html";
$legalUrl = "legal.html";
$privacyUrl = "privacy.html";
$availableTours = [];
$privacyNotice = "The required map data is retrieved directly from the servers of the respective providers.";
$quizNotice = "Welcome to MapQuizzzes.";

$defaultTranslations = [
    "privacyHeading" => "Privacy Notice",
    "tourNotAvailable" => "Currently no tours available.",
    "acceptAndStart" => "Select a tour to start",
    "linkInstructions" => "Instructions",
    "linklegalNotice" => "Legal Notice",
    "linkPrivacy" => "Privacy",
];

$uiTranslations = $defaultTranslations;

if (file_exists($configFile) && is_readable($configFile)) {
    $jsonContent = @file_get_contents($configFile);
    if ($jsonContent !== false) {
        $config = json_decode($jsonContent, true);

        if (json_last_error() === JSON_ERROR_NONE && is_array($config)) {
            $selectedLang = (isset($config["language"]) && is_string($config["language"])) ? $config["language"] : $selectedLang;
            $quizName = (isset($config["quizName"]) && is_string($config["quizName"])) ? $config["quizName"] : $quizName;
            $instructionsUrl = (isset($config["instructionsUrl"]) && is_string($config["instructionsUrl"])) ? $config["instructionsUrl"] : $instructionsUrl;
            $legalUrl = (isset($config["legalUrl"]) && is_string($config["legalUrl"])) ? $config["legalUrl"] : $legalUrl;
            $privacyUrl = (isset($config["privacyUrl"]) && is_string($config["privacyUrl"])) ? $config["privacyUrl"] : $privacyUrl;

            if (isset($config["quizDataConfigJsonFile"]) && is_string($config["quizDataConfigJsonFile"])) {
                $quizDataConfigJsonFile = basename($config["quizDataConfigJsonFile"]);
            }

            if (isset($config["availableTours"]) && is_array($config["availableTours"])) {
                $availableTours = array_values(
                    array_filter($config["availableTours"], function ($tour) {
                        return (is_string($tour) && trim($tour) !== "" && strpos($tour, "..") === false);
                    })
                );
            }

            $privacyNotice = (isset($config["privacyNotice"]) && is_string($config["privacyNotice"])) ? $config["privacyNotice"] : $privacyNotice;
            $quizNotice = (isset($config["quizNotice"]) && is_string($config["quizNotice"])) ? $config["quizNotice"] : $quizNotice;

            if (isset($config["tr"][$selectedLang]) && is_array($config["tr"][$selectedLang])) {
                $uiTranslations = array_merge($defaultTranslations, $config["tr"][$selectedLang]);
            }
        }
    }
}

if (isset($_GET["tour"])) {
    header("Content-Type: application/json; charset=utf-8");

    $requestedTour = (string) $_GET["tour"];

    if (strpos($requestedTour, "..") !== false || !in_array($requestedTour, $availableTours, true)) {
        http_response_code(404);
        echo json_encode(["error" => "Tour nicht gefunden"]);
        exit();
    }

    $quizDataConfig = loadMappingTable($requestedTour, $quizDataConfigJsonFile);

    echo json_encode([
        "tourData" => $quizDataConfig,
    ]);
    exit();
}

$getAssetVersion = function($relativePath) {
    $fullPath = __DIR__ . '/' . ltrim($relativePath, '/');
    return file_exists($fullPath) ? filemtime($fullPath) : '1.0.0';
};


$appConfigArray = [
    'translations'    => $uiTranslations,
    'quizTitle'       => $quizName,
    'quizNotice'      => $quizNotice,
    'instructionsUrl' => $instructionsUrl,
    'legalUrl'        => $legalUrl,
    'privacyUrl'      => $privacyUrl
];

$appConfigJson = json_encode(
    $appConfigArray, 
    JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_QUOT | JSON_HEX_APOS
);

?>
<!doctype html>
<!--
  ==============================================================
  MapQuizzzes
  Copyright (c) 2026 Heinz Ahrens (https://ahrens.tk/MapQuizzzes)
  SPDX-License-Identifier: MIT
  ==============================================================
-->
<html lang="<?php echo htmlspecialchars($selectedLang); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="generator" content="MapQuizzzes">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php echo htmlspecialchars($quizName); ?></title>

    <link rel="manifest" href="manifest.php">
    <meta name="theme-color" content="#ffffff">

    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="MapQuizzzes">

    <link rel="icon" type="image/png" sizes="192x192" href="images/icon-192.png">
    <link rel="apple-touch-icon" href="images/icon-192.png">

    <link rel="stylesheet" href="css/leaflet.css?v=1.9.4">
    <link rel="stylesheet" href="css/MapQuizzzes.css?v=<?php echo $getAssetVersion('css/MapQuizzzes.css'); ?>">
</head>
<body>
    <div id="image-container" class="overlay-container">
        <div id="consentNotice" class="consent-window">
            
            <header class="consent-header">
                <div class="consent-title-container">
                    <h2 id="mainQuizTitle" class="quiz-badge consent-badge-title"><?php echo htmlspecialchars($quizName); ?></h2>
                    <div class="qr-start-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="black">
                            <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2zM13 13h2v2h-2v-2zm0 3h2v2h-2v-2z" />
                        </svg>
                    </div>
                </div>
            </header>

            <div class="consent-privacy-text"><?php echo sanitizeInlineHtml($privacyNotice, ['a', 'b', 'strong', 'i', 'em', 'br', 'p']); ?></div>

            <div class="tour-selection-wrapper">
                <div class="tour-selection-title"><?php echo htmlspecialchars($uiTranslations['acceptAndStart']); ?></div>
                <div class="scroll-container tour-scroll-box">
                    <div class="tour-buttons-list">
                        <?php if (empty($availableTours)): ?>
                            <p class="tour-not-available-msg"><?php echo htmlspecialchars($uiTranslations['tourNotAvailable']); ?></p>
                        <?php else: foreach ($availableTours as $tour): ?>
                            <button class="tour-select-button tour-select-button-item" data-tour="<?php echo htmlspecialchars($tour); ?>"><span class="tour-name-badge"><?php echo htmlspecialchars($tour); ?></span></button>
                        <?php endforeach; endif; ?>
                    </div>
                </div>
            </div>

            <?php if (!empty($quizNotice)): ?>
                <div class="consent-quiz-notice-text"><?php echo sanitizeInlineHtml($quizNotice, ['a', 'b', 'i', 'strong', 'em', 'br']); ?></div>
            <?php endif; ?>

            <nav class="consent-footer-nav">
                <a href="<?php echo htmlspecialchars($instructionsUrl); ?>"><?php echo htmlspecialchars($uiTranslations['linkInstructions']); ?></a>
                <a href="<?php echo htmlspecialchars($legalUrl); ?>"><?php echo htmlspecialchars($uiTranslations['linklegalNotice']); ?></a>
                <a href="<?php echo htmlspecialchars($privacyUrl); ?>"><?php echo htmlspecialchars($uiTranslations['linkPrivacy']); ?></a>
            </nav>
        </div>
    </div>

    <div id="map"></div>

    <div id="modalOverlay">
        <div id="modalContent">
            <div class="modal-image-container">
                <img id="modalImage" src="" alt="" />
                <div class="image-number-badge"></div>
            </div>
            <div id="contentWrapper">
                <div id="m-title-row" class="modal-title"></div>
                
                <div id="m-pin-row" class="pin-row">
                    <a id="m-google-link" href="#" target="_blank" rel="noopener noreferrer">
                        <img src="images/pin.svg" alt="In Google Maps öffnen" />
                    </a>
                </div>
                
                <div id="m-top-row">
                    <div id="m-top-content" class="external-txt-content"></div>
                </div>
                
                <div id="m-quiz-area">
                    <div id="m-question" class="modal-question"></div>
                    <div id="hintContainer" class="modal-hint-container">
                        <div id="hintSpan"></div>
                    </div>
                    
                    <div id="buttonWrapper">
                        <button id="showAnswerButton"></button>
                        <div id="answerButtonsContainer" class="multiple-choice-container"></div>
                    </div>
                    <div id="quizFeedbackMsg"></div>
                </div>
                
                <div id="infoRow">
                    <div id="m-info-content" class="modal-info-row-container"></div>
                </div>
            </div>
        </div>
    </div>

    <div id="extraModalOverlay" class="extra-modal-overlay">
        <div class="extra-modal-content">
            <div id="extraModalBody" class="external-txt-content"></div>
        </div>
    </div>

    <div id="qrModalOverlay" class="qr-modal-overlay">
        <div id="qrModalContent" class="qr-modal-content">
            <div id="qrCode" class="qr-code"></div>
            <a id="qrUrl" href="#" target="_blank" rel="noopener noreferrer" class="qr-url"></a>
        </div>
    </div>

    <script src="js/leaflet.js?v=1.9.4"></script>
    <script src="js/piexifjs.js?v=1.0.6"></script>
    <script src="js/leaflet.polylineDecorator.js?v=1.6.0"></script>
    <script src="js/qrcode.min.js?v=1.0.0"></script>
    <script src="js/MapQuizzzes.js?v=<?php echo $getAssetVersion('js/MapQuizzzes.js'); ?>"></script>

    <script id="app-config" type="application/json">
        <?php echo $appConfigJson; ?>
    </script>

    <script>
        document.addEventListener("DOMContentLoaded", function() {
            const configElement = document.getElementById("app-config");
            const config = JSON.parse(configElement.textContent || "{}");

            window.quizApp = new App(config);
            window.quizApp.init();
        });
    </script>
</body>
</html>