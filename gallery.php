<?php
/**
 * ===========================================================================
 *   MapQuizzzes (MapQuizzzes-nl)
 * 
 *   File:        gallery.php
 *   Copyright:   (c) 2026 Heinz Ahrens
 *   Repository:  https://github.com/ahrenstk/MapQuizzzes-nl
 *   License:     GNU General Public License v3 (GPL v3)
 * ===========================================================================
 * 
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 * 
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *   GNU General Public License for more details.
 * 
 *   You should have received a copy of the GNU General Public License
 *   along with this program. If not, see <https://www.gnu.org/licenses/>.
 * 
 *   =========================================================================
 *   DATA EXCEPTION NOTICE:
 *   =========================================================================
 *   This license applies EXCLUSIVELY to the software framework code.
 *   All individual tour contents, questions, tips, answers, images, and
 *   media loaded by the framework (e.g. from quizdata.json and assets) are
 *   strictly excluded from the GPL v3. They remain the intellectual property
 *   of their respective authors and do not have to be open-sourced.
 * 
 * ===========================================================================
 */



$baseDir = realpath(__DIR__) . DIRECTORY_SEPARATOR;


$inputPath = isset($_GET['tour']) ? rawurldecode($_GET['tour']) : '';
if ($inputPath !== '') {
    $inputPath = rtrim($inputPath, '/\\') . DIRECTORY_SEPARATOR . 'img';
}

$requestedPath = realpath($baseDir . $inputPath);

if ($requestedPath === false || strpos($requestedPath, $baseDir) !== 0 || !is_dir($requestedPath)) {
    $imagePath = $baseDir;
} else {
    $imagePath = $requestedPath . DIRECTORY_SEPARATOR;
}

function getAllImages($fullPath) {
    $allowed = ['jpg', 'jpeg', 'png', 'gif'];
    $files = [];
    if ($handle = opendir($fullPath)) {
        while (false !== ($entry = readdir($handle))) {
            if ($entry !== "." && $entry !== "..") {
                $ext = strtolower(pathinfo($entry, PATHINFO_EXTENSION));
                if (in_array($ext, $allowed)) {
                    $files[] = $entry;
                }
            }
        }
        closedir($handle);
    }
    return $files;
}

function serveImage($filename, $fullPath) {
    $safeFilename = basename($filename);
    $targetFile = $fullPath . $safeFilename;
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    $ext = strtolower(pathinfo($safeFilename, PATHINFO_EXTENSION));
    
    if (!in_array($ext, $allowedExtensions) || !file_exists($targetFile) || !is_file($targetFile)) {
        header("HTTP/1.0 404 Not Found");
        exit("File not found.");
    }

    $mimeTypes = [
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'gif'  => 'image/gif'
    ];
    $contentType = $mimeTypes[$ext] ?? 'application/octet-stream';

    header("Content-Type: " . $contentType);
    header("Content-Length: " . filesize($targetFile));
    header("Cache-Control: public, max-age=31536000");
    readfile($targetFile);
    exit;
}

if (isset($_GET['img'])) {
    serveImage($_GET['img'], $imagePath);
}

if (isset($_GET['getImages'])) {
    header("Content-Type: application/json");
    echo json_encode(getAllImages($imagePath));
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Gallery</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="icon" type="image/png" sizes="192x192" href="images/icon-192.png" />
<link rel="apple-touch-icon" href="images/icon-192.png" />
<style>
html, body { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; }

.image-container { position: relative; height: 100%; width: 100%; overflow: hidden; }
img { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); min-width: 100%; min-height: 100%; width: auto; height: auto; object-fit: cover; opacity: 1; }
#clock { position: absolute; top: 20px; right: 20px; color: white; font-size: 96px; z-index: 1000; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
</style>
</head>
<body>
<div class="image-container">
<img src="" id="randomImage">
</div>
<div id="clock"></div>

<script>
const urlParams = new URLSearchParams(window.location.search);
const currentTour = urlParams.get('tour') || '';

const state = { 
    images: [], 
    currentIndex: 0 
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function fetchAndShuffleImages() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const apiUrl = window.location.pathname + '?getImages=true&tour=' + encodeURIComponent(currentTour);
        const response = await fetch(apiUrl, { 
            signal: controller.signal, 
            cache: 'no-cache' 
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) { 
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newImages = await response.json();
        if (newImages && newImages.length > 0) {
            state.images = shuffleArray(newImages);
            state.currentIndex = 0;
            refreshImage();
        } else {
            console.error('No images found in the directory or path is invalid.');
        }
    } catch (error) {
        if (error.name !== 'AbortError') { 
            console.error('Error loading image.', error);
        }
    }
}

function getNextImage() {
    if (state.images.length === 0) return '';
    const image = state.images[state.currentIndex];
    state.currentIndex = (state.currentIndex + 1) % state.images.length;
    return image;
}

function refreshImage() {
    const img = document.getElementById('randomImage');
    const nextImgName = getNextImage();
    
    if (!nextImgName) return;

    const newSrc = window.location.pathname + '?img=' + encodeURIComponent(nextImgName) + '&tour=' + encodeURIComponent(currentTour);
    if (img.src !== newSrc) {
        img.onload = function() {
            const imgRatio = img.naturalWidth / img.naturalHeight;
            const screenRatio = window.innerWidth / window.innerHeight;
            const widthRatio = window.innerWidth / img.naturalWidth;
            const heightRatio = window.innerHeight / img.naturalHeight;
            const zoomFactor = Math.min(widthRatio, heightRatio);
            
            if (imgRatio > screenRatio) {
                img.style.width = `${img.naturalWidth * zoomFactor}px`;
                img.style.height = 'auto';
            } else {
                img.style.width = 'auto';
                img.style.height = `${img.naturalHeight * zoomFactor}px`;
            }
        };
        img.src = newSrc;
    }
}

function updateClock() {
    const clockElement = document.getElementById('clock');
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
}

document.addEventListener('DOMContentLoaded', function() {
    fetchAndShuffleImages();
    setInterval(refreshImage, 4000);
    
    updateClock();
    setInterval(updateClock, 1000);
});
window.addEventListener('resize', refreshImage);
</script>
</body>
</html>
