/*! -----------------------------------------------------------------------------

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

class QuizMap {
    constructor(quizTitle, uiTranslations, urls, onMarkerClick, onHomeClick) {
        this.quizTitle = quizTitle;
        this.translations = uiTranslations;
        this.urls = urls;
        this.onMarkerClick = onMarkerClick;
        this.onHomeClick = onHomeClick;
        this.currentLocationMarker = null;
        this.app = null;
        this.map = null;
        this.gpxLayerGroup = null;
        this.lineLayerGroup = null;
        this.markerLayerGroup = null;
    }
    isInitialized() {
        return this.map !== null;
    }
    initialize(app) {
        if (this.map) return;
        if (app) this.app = app;
        this.map = L.map('map', {
            preferCanvas: true
        });
        this.gpxLayerGroup = L.layerGroup().addTo(this.map);
        this.lineLayerGroup = L.layerGroup().addTo(this.map);
        this.markerLayerGroup = L.featureGroup().addTo(this.map);
        this._initLayers();
        this._initControls();
    }
    _initLayers() {
        const commonAttribution = [`<a href='${window.location.pathname}' class='custom-attribution'>${this.quizTitle}</a>`, `<a href='${this.urls.instructionsUrl}' class='custom-attribution'>${this.translations['linkInstructions']}</a>`, `<a href='${this.urls.legalUrl}' class='custom-attribution'>${this.translations['linklegalNotice']}</a>`, `<a href='${this.urls.privacyUrl}' class='custom-attribution'>${this.translations['linkPrivacy']}</a>`].join(' | ');
        this.osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 20,
            maxNativeZoom: 19,
            crossOrigin: true,
            attribution: `&copy; OpenStreetMap contributors <br> ${commonAttribution}`
        }).addTo(this.map);
        this.satelliteLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
            maxZoom: 20,
            maxNativeZoom: 20,
            crossOrigin: true,
            attribution: `Tiles &copy; Esri | Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community | ${commonAttribution}`
        });
        L.control.layers({
            "OpenStreetMap": this.osmLayer,
            "Esri": this.satelliteLayer
        }).addTo(this.map);
    }
    _initControls() {
        this._addHomeButton();
        this._addGalleryButton();
        this._addQrButton();
        this._addLocateButton();
    }
    _addHomeButton() {
        const HomeButton = L.Control.extend({
            options: {
                position: 'topright'
            },
            onAdd: () => {
                const button = L.DomUtil.create('div', 'home-button leaflet-bar');
                button.style.backgroundColor = 'white';
                button.style.cursor = 'pointer';
                button.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" style="display:block;"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`;
                L.DomEvent.on(button, 'click', this.onHomeClick);
                L.DomEvent.disableClickPropagation(button);
                return button;
            }
        });
        this.map.addControl(new HomeButton());
    }
    _addGalleryButton() {
        const galleryControl = L.control({
            position: 'topright'
        });
        galleryControl.onAdd = () => {
            const div = L.DomUtil.create('div', 'custom-control-container');
            div.innerHTML = `<a id="dynamicGalleryLink" href="#" target="_self" class="gallery-button"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></a>`;
            L.DomEvent.disableClickPropagation(div);
            return div;
        };
        galleryControl.addTo(this.map);
    }
    _addQrButton() {
        const qrControl = L.control({
            position: "topright"
        });
        qrControl.onAdd = () => {
            const div = L.DomUtil.create("div", "custom-control-container");
            div.innerHTML = `<div class="qr-button" style="cursor: pointer; padding: 5px; background: white;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2zM13 13h2v2h-2v-2zm0 3h2v2h-2v-2z"/></svg></div>`;
            L.DomEvent.on(div, 'click', (e) => {
                L.DomEvent.stopPropagation(e);
                this.app.uiManager.openQRModal();
            });
            L.DomEvent.disableClickPropagation(div);
            return div;
        };
        qrControl.addTo(this.map);
    }
    _addLocateButton() {
        const locateControl = L.control({
            position: "topright"
        });
        locateControl.onAdd = (map) => {
            const div = L.DomUtil.create("div", "custom-control-container");
            div.innerHTML = `<div class="locate-button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></div>`;
            div.addEventListener("click", () => this._locateUser(map));
            return div;
        };
        locateControl.addTo(this.map);
    }
    _locateUser(map) {
        if (!navigator.geolocation) {
            alert(this.translations.locationError);
            return;
        }
        const loadingMessage = L.control({
            position: "topleft"
        });
        loadingMessage.onAdd = () => {
            const loadingDiv = L.DomUtil.create("div", "loading-message");
            loadingDiv.innerHTML = `<div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);"><span>${this.translations['loadingLocation']}</span></div>`;
            return loadingDiv;
        };
        loadingMessage.addTo(map);
        const cleanup = () => {
            try {
                map.removeControl(loadingMessage);
            } catch (e) {}
        };
        navigator.geolocation.getCurrentPosition(
            (position) => {
                try {
                    const {
                        latitude: userLat,
                        longitude: userLng
                    } = position.coords;
                    map.setView([userLat, userLng], 18);
                    if (this.currentLocationMarker) {
                        map.removeLayer(this.currentLocationMarker);
                    }
                    this.currentLocationMarker = L.circleMarker([userLat, userLng], {
                        radius: 8,
                        color: 'blue',
                        weight: 2,
                        opacity: 1,
                        fillColor: '#0078ff',
                        fillOpacity: 0.8
                    }).addTo(map);
                } finally {
                    cleanup();
                }
            },
            (error) => {
                try {
                    alert(`${this.translations.locationError} ${error.message}`);
                } finally {
                    cleanup();
                }
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
    }
    addThumbnailToMap(lat, lon, displayUrl, quizPointId, number, title) {
        const thumbnailSize = 100;
        const numberBadgeHtml = number ? `<div class="thumb-badge">${number}</div>` : '';
        const titleHtml = title ? `<div class="thumb-title">${title}</div>` : '';
        const thumbnailIcon = L.divIcon({
            className: 'thumbnail-marker',
            html: `
            <div class="thumb-box">
                <img src="${displayUrl}" alt="" class="thumb-img" />
                ${numberBadgeHtml}
                ${titleHtml}
            </div>
        `,
            iconSize: [thumbnailSize, thumbnailSize],
            iconAnchor: [thumbnailSize / 2, thumbnailSize / 2]
        });
        const marker = L.marker([lat, lon], {
            icon: thumbnailIcon,
            myQuizId: quizPointId
        }).addTo(this.markerLayerGroup);
        marker.on('click', (e) => this.onMarkerClick(e.target.options.myQuizId));
    }
    updatePolyline(latlngs) {
        this.lineLayerGroup.clearLayers();
        if (latlngs.length > 1) {
            const polyline = L.polyline(latlngs, {
                color: '#0000FF',
                weight: 4,
                opacity: 0.6,
                lineJoin: 'round'
            }).addTo(this.lineLayerGroup);
            L.polylineDecorator(polyline, {
                patterns: [{
                    offset: '10%',
                    repeat: '100px',
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 12,
                        polygon: false,
                        pathOptions: {
                            stroke: true,
                            color: '#00008B',
                            weight: 3,
                            opacity: 0.9
                        }
                    })
                }]
            }).addTo(this.lineLayerGroup);
        }
    }
    updateGpxRoute(allGpxPoints, percentage) {
        this.gpxLayerGroup.clearLayers();
        if (!allGpxPoints || allGpxPoints.length === 0) return;
        let p = Math.min(1.0, Math.max(0.0, parseFloat(percentage) || 1.0));
        const pointsCount = Math.floor(allGpxPoints.length * p);
        const visibleCoords = allGpxPoints.slice(0, pointsCount);
        if (visibleCoords.length >= 2) {
            const progressLine = L.polyline(visibleCoords, {
                color: '#0000FF',
                weight: 5,
                opacity: 0.7,
                dashArray: '10, 15',
                lineJoin: 'round',
                smoothFactor: 1
            }).addTo(this.gpxLayerGroup);
            L.polylineDecorator(progressLine, {
                patterns: [{
                    offset: 25,
                    repeat: 60,
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 12,
                        polygon: false,
                        pathOptions: {
                            color: '#0000FF',
                            stroke: true,
                            weight: 3,
                            opacity: 1.0
                        }
                    })
                }]
            }).addTo(this.gpxLayerGroup);
        }
    }
    fitMapToMarkers() {
        const markerLayers = this.markerLayerGroup.getLayers();
        if (markerLayers.length > 0) {
            const bounds = this.markerLayerGroup.getBounds();
            if (bounds.isValid()) {
                const edgePadding = window.innerWidth < 600 ? [50, 50] : [100, 100];
                this.map.fitBounds(bounds, {
                    padding: edgePadding,
                    maxZoom: 18,
                    animate: false
                });
            }
        } else if (this.allGpxPoints && this.allGpxPoints.length > 0) {
            const gpxBounds = L.latLngBounds(this.allGpxPoints);
            if (gpxBounds.isValid()) {
                this.map.fitBounds(gpxBounds, {
                    padding: [50, 50],
                    maxZoom: 18
                });
            }
        }
    }
    markAsVisited(quizPointId) {
        this.map.eachLayer((layer) => {
            if (layer instanceof L.Marker && layer.options.myQuizId === quizPointId && layer._icon) {
                layer._icon.classList.add('visited-icon');
            }
        });
    }
    clearLayers() {
        this.gpxLayerGroup.clearLayers();
        this.lineLayerGroup.clearLayers();
        this.markerLayerGroup.clearLayers();
    }
    resetView() {
        if (this.satelliteLayer && this.map.hasLayer(this.satelliteLayer)) {
            this.map.removeLayer(this.satelliteLayer);
        }
        if (this.osmLayer && !this.map.hasLayer(this.osmLayer)) {
            this.map.addLayer(this.osmLayer);
        }
        this.map.stop();
        this.map.setView([48.0, 11.0], 5);
    }
    invalidateSize() {
        setTimeout(() => this.map.invalidateSize(), 100);
    }
}
class TourManager {
    constructor(app) {
        this.app = app;
        this.EMPTY_SQUARE_IMAGE = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23ffffff'/%3E%3C/svg%3E";
        this.tourFolder = "";
        this.hasGpx = false;
        this.mappingData = {};
        this.images = [];
        this.sortedQuizPoints = [];
        this.unlockedMarkerIds = [];
        this.visitedPointIds = new Set();
        this.shuffledAnswersMap = new Map();
        this.allGpxPoints = [];
        this.maxGpxPercentage = 0;
        this.imageDataMap = new Map();
        this.blobCache = new Map();
        this.activeSessionProgress = new Map();
    }
    _saveProgress() {
        if (!this.tourFolder) return;
        this.activeSessionProgress.set(this.tourFolder, {
            unlockedMarkerIds: [...this.unlockedMarkerIds],
            visitedPointIds: new Set(this.visitedPointIds),
            maxGpxPercentage: this.maxGpxPercentage
        });
    }
    _loadProgress() {
        if (!this.tourFolder || !this.activeSessionProgress.has(this.tourFolder)) {
            return false;
        }
        const saved = this.activeSessionProgress.get(this.tourFolder);
        this.unlockedMarkerIds = [...saved.unlockedMarkerIds];
        this.visitedPointIds = new Set(saved.visitedPointIds || []);
        this.maxGpxPercentage = saved.maxGpxPercentage || 0;
        return true;
    }
    isPointSolved(quizPointId) {
        return this.isPointVisited(quizPointId);
    }
    markPointAsSolved(quizPointId) {
        this.markPointAsVisited(quizPointId);
    }
    markPointAsVisited(quizPointId) {
        if (!this.visitedPointIds) {
            this.visitedPointIds = new Set();
        }
        this.visitedPointIds.add(quizPointId);
        this.app.map.markAsVisited(quizPointId);
        this._saveProgress();
    }
    isPointVisited(quizPointId) {
        return this.visitedPointIds ? this.visitedPointIds.has(quizPointId) : false;
    }
    async activateTour(selectedTour) {
        this.tourFolder = selectedTour;
        this.hasGpx = false;
        const hasSavedProgress = this._loadProgress();
        if (!hasSavedProgress) {
            this.maxGpxPercentage = 0;
            this.unlockedMarkerIds = [];
            this.visitedPointIds.clear();
        }
        try {
            document.body.classList.add('map-loading');
            const response = await fetch(`?tour=${encodeURIComponent(selectedTour)}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            if (!this.app.map.isInitialized()) {
                this.app.map.initialize(this.app);
            }
            if (!history.state || history.state.page !== "tour") {
                history.pushState({
                    page: "tour",
                    tour: selectedTour
                }, "");
            }
            document.body.classList.add('tour-active');
            this.app.map.invalidateSize();
            this.mappingData = data.tourData;
            this.images = Object.keys(this.mappingData);
            this.allGpxPoints = [];
            this.app.map.clearLayers();
            await this._fetchGpxData();
            const galleryLink = document.getElementById('dynamicGalleryLink');
            if (galleryLink) {
                galleryLink.href = `gallery.php?tour=${encodeURIComponent(this.tourFolder)}`;
            }
            if (this.images.length > 0) {
                await this._processAllImages();
            }
        } catch (e) {
            console.error("Error activating tour:", e);
        }
    }
    async _fetchGpxData() {
        try {
            const safeTourPath = encodeURIComponent(this.tourFolder).replace(/%2F/g, '/');
            const gpxResponse = await fetch(`${safeTourPath}/quizdata.gpx`, {
                cache: 'no-store'
            });
            if (!gpxResponse.ok) return;
            const gpxText = await gpxResponse.text();
            const xml = new DOMParser().parseFromString(gpxText, "text/xml");
            if (xml.querySelector("parsererror")) return;
            const trackPoints = Array.from(xml.getElementsByTagName("trkpt"));
            this.allGpxPoints = trackPoints.map(pt => [parseFloat(pt.getAttribute("lat")), parseFloat(pt.getAttribute("lon"))]).filter(p => !isNaN(p[0]) && !isNaN(p[1]));
            this.hasGpx = this.allGpxPoints.length > 0;
        } catch (gpxErr) {}
    }
    async _processAllImages() {
        this.sortedQuizPoints = this.images.filter(img => img);
        const safeFolder = encodeURIComponent(this.tourFolder).replace(/%2F/g, '/');
        const loadPromises = this.sortedQuizPoints.map(id => this._loadImageAndExif(id, `${safeFolder}/min/${encodeURIComponent(id)}`));
        await Promise.all(loadPromises);
        this._initializeUnlockedMarkers();
        this._updateRoutePolyline();
        await this._renderMapMarkers();
        const isStepByStep = !this.sortedQuizPoints.some(id => this.mappingData[id]?.stepbystep === false);
        if (!isStepByStep) {
            this._updateGpxVisibility();
        } else if (this.hasGpx && this.maxGpxPercentage > 0) {
            this.app.map.updateGpxRoute(this.allGpxPoints, this.maxGpxPercentage);
        }
    }
    async _loadImageAndExif(id, url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();
            this.blobCache.set(id, URL.createObjectURL(blob));
            const isJpeg = blob.type === 'image/jpeg' || id.toLowerCase().endsWith('.jpg') || id.toLowerCase().endsWith('.jpeg');
            if (isJpeg && window.piexif) {
                const buffer = await blob.arrayBuffer();
                const bytes = new Uint8Array(buffer);
                let binaryString = '';
                const chunkSize = 8192;
                for (let i = 0; i < bytes.length; i += chunkSize) {
                    binaryString += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
                }
                const exifObj = piexif.load(binaryString);
                const gps = this._getGpsFromExif(exifObj);
                if (gps && this.mappingData[id]) {
                    this.imageDataMap.set(id, {
                        gps
                    });
                    this.mappingData[id].latitude = this.mappingData[id].latitude ?? gps.lat;
                    this.mappingData[id].longitude = this.mappingData[id].longitude ?? gps.lon;
                }
            }
        } catch (err) {
            this.blobCache.set(id, this.EMPTY_SQUARE_IMAGE);
            console.warn(`Failed to load image ${id}:`, err);
        }
    }
    _getGpsFromExif(exifData) {
        if (!exifData?.["GPS"]) return null;
        const gpsData = exifData["GPS"];
        const lat = this._convertGpsToDecimal(gpsData[piexif.GPSIFD.GPSLatitude], gpsData[piexif.GPSIFD.GPSLatitudeRef]);
        const lon = this._convertGpsToDecimal(gpsData[piexif.GPSIFD.GPSLongitude], gpsData[piexif.GPSIFD.GPSLongitudeRef]);
        return (lat !== null && lon !== null) ? {
            lat,
            lon
        } : null;
    }
    _convertGpsToDecimal(gpsData, ref) {
        if (!gpsData || gpsData.length < 3) return null;
        try {
            const calc = (pair) => (pair && pair[1] !== 0) ? pair[0] / pair[1] : 0;
            const decimal = calc(gpsData[0]) + (calc(gpsData[1]) / 60) + (calc(gpsData[2]) / 3600);
            return (ref === "S" || ref === "W") ? -decimal : decimal;
        } catch {
            return null;
        }
    }
    _initializeUnlockedMarkers() {
        if (this.unlockedMarkerIds.length > 0) {
            return;
        }
        const isStepByStep = !this.sortedQuizPoints.some(id => this.mappingData[id]?.stepbystep === false);
        if (isStepByStep) {
            if (this.sortedQuizPoints.length > 0 && !this.unlockedMarkerIds.includes(this.sortedQuizPoints[0])) {
                this.unlockedMarkerIds.push(this.sortedQuizPoints[0]);
            }
        } else {
            this.unlockedMarkerIds = [...this.sortedQuizPoints];
        }
    }
    async _renderMapMarkers() {
        this.unlockedMarkerIds.forEach(id => {
            this._createMapMarker(id);
            if (this.isPointVisited(id)) {
                this.app.map.markAsVisited(id);
            }
        });
        if (this.unlockedMarkerIds.length > 1 || (this.hasGpx && this.allGpxPoints.length > 0)) {
            this.app.map.fitMapToMarkers();
        } else if (this.unlockedMarkerIds.length === 1) {
            const point = this._getPointCoordinates(this.unlockedMarkerIds[0]);
            if (point) this.app.map.map.setView([point.lat, point.lon], 17);
        }
        document.body.classList.remove('map-loading');
    }
    _createMapMarker(quizPointId) {
        const imageUrl = this.blobCache.get(quizPointId) || this.EMPTY_SQUARE_IMAGE;
        const mapping = this.mappingData[quizPointId] || {};
        const point = this._getPointCoordinates(quizPointId);
        if (point) {
            this.app.map.addThumbnailToMap(point.lat, point.lon, imageUrl, quizPointId, String(mapping.number || '').trim(), String(mapping.title || '').trim());
        }
    }
    _getPointCoordinates(quizPointId) {
        const mapping = this.mappingData[quizPointId] || {};
        const gps = this.imageDataMap.get(quizPointId)?.gps;
        const lat = mapping.latitude ?? gps?.lat;
        const lon = mapping.longitude ?? gps?.lon;
        if (lat !== null && lon !== null && lat !== undefined && lon !== undefined) {
            return {
                lat,
                lon
            };
        }
        return null;
    }
    _updateRoutePolyline() {
        if (this.hasGpx) return;
        const latlngs = this.unlockedMarkerIds.map(id => this._getPointCoordinates(id)).filter(Boolean).map(p => [p.lat, p.lon]);
        this.app.map.updatePolyline(latlngs);
    }
    _updateMaxGpxRoute(percentage) {
        let p = Math.min(1.0, Math.max(0.0, parseFloat(percentage) || 0.0));
        if (p > this.maxGpxPercentage) {
            this.maxGpxPercentage = p;
        }
        this.app.map.updateGpxRoute(this.allGpxPoints, this.maxGpxPercentage);
    }
    _unlockNextMarker(currentId) {
        const isStepByStepTour = !this.sortedQuizPoints.some(id => this.mappingData[id]?.stepbystep === false);
        if (!isStepByStepTour) {
            return;
        }
        const currentIndex = this.sortedQuizPoints.indexOf(currentId);
        const nextIndex = currentIndex + 1;
        if (nextIndex < this.sortedQuizPoints.length) {
            const nextId = this.sortedQuizPoints[nextIndex];
            if (!this.unlockedMarkerIds.includes(nextId)) {
                this.unlockedMarkerIds.push(nextId);
                this._createMapMarker(nextId);
                this._updateRoutePolyline();
                const newConfig = this.mappingData[nextId];
                if (this.hasGpx && newConfig && newConfig.gpxShow !== null && newConfig.gpxShow !== undefined) {
                    this._updateMaxGpxRoute(newConfig.gpxShow);
                }
                this._saveProgress();
            }
        }
    }
    _updateGpxVisibility() {
        if (!this.hasGpx || this.allGpxPoints.length === 0) {
            return;
        }
        let percentage = 0;
        if (this.unlockedMarkerIds.length > 1) {
            percentage = 1.0;
        } else if (this.unlockedMarkerIds.length === 1) {
            const currentId = this.unlockedMarkerIds[0];
            if (currentId && this.mappingData[currentId]) {
                percentage = this.mappingData[currentId].gpxShow || 0;
            }
        }
        this._updateMaxGpxRoute(percentage);
    }
    onModalClose(closedQuizPointId) {
        const config = this.mappingData[closedQuizPointId];
        if (config) {
            const hasQuestion = (config.question || "").trim() !== "";
            const isSolved = this.isPointSolved(closedQuizPointId);
            if (!hasQuestion || isSolved) {
                this.markPointAsVisited(closedQuizPointId);
                this._unlockNextMarker(closedQuizPointId);
            } else if (this.hasGpx && config.gpxShow !== null && config.gpxShow !== undefined) {
                this._updateMaxGpxRoute(config.gpxShow);
            }
        }
        this._updateRoutePolyline();
    }
    getShuffledAnswers(quizPointId, mapping) {
        if (this.shuffledAnswersMap.has(quizPointId)) {
            return this.shuffledAnswersMap.get(quizPointId);
        }
        let answers = [{
            text: mapping.answer,
            correct: true
        }, {
            text: mapping.wrong1,
            correct: false
        }, {
            text: mapping.wrong2,
            correct: false
        }, {
            text: mapping.wrong3,
            correct: false
        }];
        let validAnswers = answers.filter(ans => ans.text && ans.text.trim() !== "");
        for (let i = validAnswers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [validAnswers[i], validAnswers[j]] = [validAnswers[j], validAnswers[i]];
        }
        this.shuffledAnswersMap.set(quizPointId, validAnswers);
        return validAnswers;
    }
    resetTourState() {
        this._saveProgress();
        this.blobCache.forEach((url) => {
            if (url && typeof url === 'string' && url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
        this.tourFolder = "";
        this.unlockedMarkerIds = [];
        this.visitedPointIds = new Set();
        this.allGpxPoints = [];
        this.maxGpxPercentage = 0;
        this.imageDataMap.clear();
        this.blobCache.clear();
        this.mappingData = {};
        this.images = [];
        this.sortedQuizPoints = [];
    }
}
class QuizModal {
    constructor(app) {
        this.app = app;
        this.els = {
            modalOverlay: document.getElementById('modalOverlay'),
            modalContent: document.getElementById('modalContent'),
            modalImage: document.getElementById('modalImage'),
            imageNumberBadge: document.querySelector('.image-number-badge'),
            modalTitleRow: document.getElementById('m-title-row'),
            modalPinRow: document.getElementById('m-pin-row'),
            modalGoogleLink: document.getElementById('m-google-link'),
            modalTopRow: document.getElementById('m-top-row'),
            modalTopContent: document.getElementById('m-top-content'),
            modalQuizArea: document.getElementById('m-quiz-area'),
            modalQuestion: document.getElementById('m-question'),
            hintContainer: document.getElementById('hintContainer'),
            hintSpan: document.getElementById('hintSpan'),
            showAnswerButton: document.getElementById('showAnswerButton'),
            answerButtonsContainer: document.getElementById('answerButtonsContainer'),
            quizFeedbackMsg: document.getElementById('quizFeedbackMsg'),
            infoRow: document.getElementById('infoRow'),
            modalInfoContent: document.getElementById('m-info-content'),
            extraModalOverlay: document.getElementById('extraModalOverlay'),
            extraModalBody: document.getElementById('extraModalBody')
        };
        this.currentOpenQuizPointId = null;
        this.currentModalTimer = null;
        this.currentModalStep = 0;
        this.currentModalQuizData = null;
        this.isWrongAnswerLocked = false;
        this._initEventListeners();
    }
    _initEventListeners() {
        this.els.modalOverlay.addEventListener('click', () => this.close());
        this.els.modalContent.addEventListener('click', (e) => {
            if (e.target.closest('a, button, input, label, select, textarea')) {
                e.stopPropagation();
            }
        });
        if (this.els.showAnswerButton) {
            this.els.showAnswerButton.addEventListener('click', (e) => this.handleAnswerButtonClick(e));
        }
        if (this.els.extraModalOverlay) {
            this.els.extraModalOverlay.addEventListener('click', () => this.closeExtraModal());
        }
        if (this.els.answerButtonsContainer) {
            this.els.answerButtonsContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.mc-button');
                if (btn && !btn.disabled) {
                    e.stopPropagation();
                    const isCorrect = btn.dataset.correct === "true";
                    const mapping = this.currentModalQuizData?.mapping;
                    if (mapping) {
                        this._handleMultipleChoiceClick(isCorrect, mapping, btn, this.els.answerButtonsContainer);
                    }
                }
            });
        }
    }
    openExtraModal(content) {
        if (!this.els.extraModalOverlay) return;
        this.els.extraModalBody.innerHTML = content;
        this.els.extraModalOverlay.style.display = 'flex';
    }
    closeExtraModal() {
        if (!this.els.extraModalOverlay) return;
        this.els.extraModalOverlay.style.display = 'none';
        this.els.extraModalBody.innerHTML = '';
    }
    open(quizPointId) {
        this.currentOpenQuizPointId = quizPointId;
        const safeFolder = encodeURIComponent(this.app.tourManager.tourFolder).replace(/%2F/g, '/');
        const imgUrl = `${safeFolder}/img/${encodeURIComponent(quizPointId)}`;
        this.els.modalImage.style.display = 'none';
        this.els.modalImage.onerror = () => {
            this.els.modalImage.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='480' viewBox='0 0 640 480'%3E%3Crect width='640' height='480' fill='%23eeeeee'/%3E%3Crect x='1' y='1' width='638' height='478' fill='none' stroke='%23cccccc' stroke-width='2'/%3E%3Cg transform='translate(130, 50) scale(16)' opacity='0.2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2' stroke='%23000' fill='none'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5' fill='%23000'/%3E%3Cpolyline points='21 15 16 10 5 21' stroke='%23000' fill='none'/%3E%3C/g%3E%3C/svg%3E";
            this._show();
        };
        this.els.modalImage.onload = () => this._show();
        this.els.modalImage.src = imgUrl;
    }
    _show() {
        this._updateContent(this.currentOpenQuizPointId);
        this.els.modalOverlay.style.display = 'flex';
        this.els.modalImage.style.display = 'block';
    }
    _updateContent(quizPointId) {
        if (this.currentModalTimer) clearInterval(this.currentModalTimer);
        this.currentModalTimer = null;
        this.isWrongAnswerLocked = false;
        if (this.els.quizFeedbackMsg) {
            this.els.quizFeedbackMsg.textContent = '';
            this.els.quizFeedbackMsg.style.visibility = 'hidden';
        }
        const mapping = this.app.tourManager.mappingData[quizPointId] || {};
        const gpsData = this.app.tourManager.imageDataMap.get(quizPointId)?.gps;
        let lat = mapping.latitude ?? gpsData?.lat;
        let lon = mapping.longitude ?? gpsData?.lon;
        this.els.modalTopContent.innerHTML = mapping.modalHeaderTxt || "";
        this.els.modalTopRow.style.display = 'block';
        const displayTitle = (mapping.largetitle || "").trim() !== "" ? mapping.largetitle : (mapping.title || quizPointId);
        this.els.modalTitleRow.textContent = displayTitle;
        this._updateNumberBadge(mapping.number);
        this._updatePinLink(lat, lon);
        this._updateQuizArea(mapping);
        this._updateInfoArea(mapping);
    }
    _updateNumberBadge(number) {
        if (!this.els.imageNumberBadge) return;
        if (number === undefined || number === null || String(number).trim() === "") {
            this.els.imageNumberBadge.style.display = 'none';
        } else {
            this.els.imageNumberBadge.textContent = number;
            this.els.imageNumberBadge.style.display = 'flex';
        }
    }
    _updatePinLink(lat, lon) {
        const hasCoords = lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon);
        if (hasCoords) {
            this.els.modalPinRow.style.display = 'block';
            const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const link = isApple ? `maps://maps.apple.com/?q=${lat},${lon}` : `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
            this.els.modalGoogleLink.href = link;
            this.els.modalGoogleLink.title = this.app.tr('openMaps');
        } else {
            this.els.modalPinRow.style.display = 'none';
        }
    }
    close() {
        if (this.isWrongAnswerLocked) return;
        if (this.els.modalOverlay.style.display === 'none') return;
        this.closeExtraModal();
        const closedQuizPointId = this.currentOpenQuizPointId;
        this.els.modalOverlay.style.display = 'none';
        if (this.currentModalTimer) clearInterval(this.currentModalTimer);
        this.currentModalTimer = null;
        this.isWrongAnswerLocked = false;
        this.currentOpenQuizPointId = null;
        this.els.modalImage.removeAttribute('src');
        this.els.modalImage.onerror = null;
        this.els.modalImage.onload = null;
        this.els.infoRow.style.visibility = 'hidden';
        this.els.hintSpan.style.visibility = 'hidden';
        this.els.modalInfoContent.innerHTML = '';
        if (this.els.quizFeedbackMsg) {
            this.els.quizFeedbackMsg.textContent = '';
            this.els.quizFeedbackMsg.style.visibility = 'hidden';
        }
        if (this.els.answerButtonsContainer) {
            this.els.answerButtonsContainer.innerHTML = '';
            this.els.answerButtonsContainer.style.display = 'none';
        }
        if (closedQuizPointId) this.app.tourManager.onModalClose(closedQuizPointId);
    }
    _updateInfoArea(mapping) {
        this.els.modalInfoContent.innerHTML = "";
        const htmlParts = [];
        if (mapping.link) {
            const linkText = mapping.info || this.app.tr('openLink');
            htmlParts.push(`<div style="padding: 0 10px 0 10px;"><a href="${mapping.link}" target="_blank" style="color: #007bff; font-weight: bold;">${linkText}</a></div>`);
        } else if (mapping.info && mapping.extraModalTxt) {
            const linkText = mapping.info;
            htmlParts.push(`<div style="padding: 0 10px 0 10px;"><a href="#" id="extraModalBtn" style="color: #007bff; font-weight: bold;">${linkText}</a></div>`);
        }
        if (mapping.modalFooterTxt) {
            htmlParts.push(`<div class="external-txt-content" style="padding: 0 10px 0 10px; text-align: left;">${mapping.modalFooterTxt}</div>`);
        }
        if (htmlParts.length > 0) {
            this.els.modalInfoContent.innerHTML = htmlParts.join('');
            const extraBtn = document.getElementById('extraModalBtn');
            if (extraBtn) {
                extraBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openExtraModal(mapping.extraModalTxt);
                });
            }
        }
        const hasInfoContent = htmlParts.length > 0;
        const isAlreadySolved = this.app.tourManager.isPointSolved(this.currentOpenQuizPointId);
        this.els.infoRow.style.visibility = (hasInfoContent && (!this.currentModalQuizData || isAlreadySolved)) ? 'visible' : 'hidden';
    }
    handleAnswerButtonClick(e) {
        if (e) e.stopPropagation();
        if (!this.currentModalQuizData) return;
        const {
            mapping,
            hasAnswer,
            hasWrong,
            hasHint
        } = this.currentModalQuizData;
        if (this.currentModalStep === 0 && hasHint) {
            this.els.hintSpan.style.visibility = 'visible';
            this.currentModalStep = 1;
            this._renderQuizControls();
        } else if (this.currentModalStep === 1 && !hasWrong && hasAnswer) {
            let count = 3;
            this.els.showAnswerButton.disabled = true;
            this.els.showAnswerButton.style.cursor = "wait";
            this.els.showAnswerButton.style.backgroundColor = "#007bff";
            const timer = setInterval(() => {
                count--;
                if (count > 0) {
                    this.els.showAnswerButton.textContent = this.app.tr(count === 1 ? 'countdownSingular' : 'countdownPlural', count);
                } else {
                    clearInterval(timer);
                    this.currentModalTimer = null;
                    this.currentModalStep = 2;
                    this.app.tourManager.markPointAsSolved(this.currentOpenQuizPointId);
                    this._renderQuizControls();
                    this.els.infoRow.style.visibility = 'visible';
                    this.app.map.markAsVisited(this.currentOpenQuizPointId);
                }
            }, 1000);
            this.currentModalTimer = timer;
            this.els.showAnswerButton.textContent = this.app.tr('countdownPlural', count);
        }
    }
    _updateQuizArea(mapping) {
        const isAlreadySolved = this.app.tourManager.isPointSolved(this.currentOpenQuizPointId);
        const hasQuestion = (mapping.question || "").trim() !== "";
        if (hasQuestion) {
            this.els.modalQuizArea.style.display = 'block';
            this.els.modalQuestion.textContent = mapping.question;
            const hasHint = (mapping.hint || "").trim() !== "";
            const hasWrong = [mapping.wrong1, mapping.wrong2, mapping.wrong3].some(w => (w || "").trim() !== "");
            const hasAnswer = (mapping.answer || "").trim() !== "";
            if (hasHint) {
                this.els.hintSpan.textContent = `(${this.app.tr('hintPrefix')}: ${mapping.hint})`;
                this.els.hintSpan.style.visibility = isAlreadySolved ? 'visible' : 'hidden';
            } else {
                this.els.hintSpan.textContent = '';
                this.els.hintSpan.style.visibility = 'hidden';
            }
            this.currentModalQuizData = {
                mapping,
                hasAnswer,
                hasWrong,
                hasHint
            };
            if (isAlreadySolved) {
                this.currentModalStep = 2;
            } else {
                this.currentModalStep = hasHint ? 0 : 1;
            }
            this._renderQuizControls();
        } else {
            this.els.modalQuizArea.style.display = 'none';
            this.currentModalQuizData = null;
        }
    }
    _renderQuizControls() {
        if (!this.currentModalQuizData) return;
        const {
            mapping,
            hasAnswer,
            hasWrong,
            hasHint
        } = this.currentModalQuizData;
        const isAlreadySolved = this.app.tourManager.isPointSolved(this.currentOpenQuizPointId);
        if (isAlreadySolved) {
            if (hasWrong) {
                if (this.els.showAnswerButton) {
                    this.els.showAnswerButton.style.display = 'none';
                }
                this._renderMultipleChoiceButtons(mapping);
                const container = this.els.answerButtonsContainer;
                if (container) {
                    const allButtons = container.querySelectorAll('button');
                    allButtons.forEach(btn => {
                        if (btn.dataset.correct === "true") {
                            btn.classList.add('correct-answer-highlight');
                        }
                        btn.disabled = true;
                    });
                }
                if (this.els.quizFeedbackMsg) {
                    this.els.quizFeedbackMsg.style.color = '#28a745';
                    this.els.quizFeedbackMsg.textContent = this.app.tr('correctAnswer');
                    this.els.quizFeedbackMsg.style.visibility = 'visible';
                }
            } else {
                if (this.els.answerButtonsContainer) {
                    this.els.answerButtonsContainer.style.display = 'none';
                }
                if (this.els.showAnswerButton) {
                    this.els.showAnswerButton.style.display = 'inline-block';
                    const btn = this.els.showAnswerButton;
                    btn.disabled = true;
                    btn.style.cursor = "default";
                    btn.textContent = hasAnswer ? mapping.answer : this.app.tr('correctAnswer');
                    btn.style.backgroundColor = "#28a745";
                }
            }
            if (this.els.modalInfoContent && this.els.modalInfoContent.innerHTML.trim() !== '') {
                this.els.infoRow.style.visibility = 'visible';
            }
            return;
        }
        if (this.currentModalStep === 0 && hasHint) {
            if (this.els.showAnswerButton) {
                this.els.showAnswerButton.style.display = 'inline-block';
                this.els.showAnswerButton.disabled = false;
                this.els.showAnswerButton.style.cursor = "pointer";
                this.els.showAnswerButton.textContent = this.app.tr('showHint');
                this.els.showAnswerButton.style.backgroundColor = "#007bff";
            }
            if (this.els.answerButtonsContainer) {
                this.els.answerButtonsContainer.style.display = 'none';
            }
            return;
        }
        if (hasWrong) {
            if (this.els.showAnswerButton) {
                this.els.showAnswerButton.style.display = 'none';
            }
            this._renderMultipleChoiceButtons(mapping);
        } else {
            if (this.els.answerButtonsContainer) {
                this.els.answerButtonsContainer.style.display = 'none';
            }
            if (this.els.showAnswerButton) {
                this.els.showAnswerButton.style.display = 'inline-block';
                const btn = this.els.showAnswerButton;
                btn.disabled = false;
                btn.style.cursor = "pointer";
                if (this.currentModalStep === 1) {
                    btn.textContent = hasAnswer ? this.app.tr('showAnswer') : this.app.tr('noAnswer');
                    btn.style.backgroundColor = hasAnswer ? "#dc3545" : "#28a745";
                    if (!hasAnswer) btn.style.cursor = "default";
                } else if (this.currentModalStep === 2 && hasAnswer) {
                    btn.textContent = mapping.answer;
                    btn.style.backgroundColor = "#28a745";
                    btn.style.cursor = "default";
                }
            }
        }
    }
    _renderMultipleChoiceButtons(mapping) {
        const container = this.els.answerButtonsContainer;
        if (!container) return;
        container.innerHTML = '';
        container.style.display = 'grid';
        const validAnswers = this.app.tourManager.getShuffledAnswers(this.currentOpenQuizPointId, mapping);
        if (validAnswers.length > 2) {
            container.classList.add('grid-2x2');
        } else {
            container.classList.remove('grid-2x2');
        }
        validAnswers.forEach((ans, index) => {
            const btn = document.createElement('button');
            btn.className = `mc-button mc-btn-${index % 4}`;
            btn.textContent = ans.text;
            btn.dataset.correct = ans.correct ? "true" : "false";
            container.appendChild(btn);
        });
    }
    _handleMultipleChoiceClick(isCorrect, mapping, clickedButton, container) {
        if (this.isWrongAnswerLocked) return;
        const feedbackMsg = this.els.quizFeedbackMsg;
        if (isCorrect) {
            this.app.tourManager.markPointAsSolved(this.currentOpenQuizPointId);
            if (feedbackMsg) {
                feedbackMsg.style.color = '#28a745';
                feedbackMsg.textContent = this.app.tr('correctAnswer');
                feedbackMsg.style.visibility = 'visible';
            }
            const allButtons = container.querySelectorAll('button');
            allButtons.forEach(btn => {
                if (btn.dataset.correct === "true") {
                  btn.classList.add('correct-answer-highlight');
                }
                btn.disabled = true;
            });
            this.els.infoRow.style.visibility = 'visible';
        } else {
            this.isWrongAnswerLocked = true;
            clickedButton.style.opacity = '0.4';
            clickedButton.style.cursor = 'not-allowed';
            let secondsLeft = 3;
            const updateWrongFeedback = () => {
                if (feedbackMsg) {
                    feedbackMsg.style.color = '#dc3545';
                    const key = secondsLeft === 1 ? 'wrongWaitSingular' : 'wrongWaitPlural';
                    feedbackMsg.textContent = this.app.tr(key, secondsLeft);
                    feedbackMsg.style.visibility = 'visible';
                }
            };
            updateWrongFeedback();
            if (this.currentModalTimer) clearInterval(this.currentModalTimer);
            this.currentModalTimer = setInterval(() => {
                secondsLeft--;
                if (secondsLeft > 0) {
                    updateWrongFeedback();
                } else {
                    clearInterval(this.currentModalTimer);
                    this.currentModalTimer = null;
                    this.isWrongAnswerLocked = false;
                    if (feedbackMsg) {
                        feedbackMsg.textContent = '';
                        feedbackMsg.style.visibility = 'hidden';
                    }
                    clickedButton.style.opacity = '1';
                    clickedButton.style.cursor = 'pointer';
                }
            }, 1000);
        }
    }
}
class UIManager {
    constructor(app) {
        this.app = app;
        this.els = {
            consentNotice: document.getElementById('consentNotice'),
            qrModalOverlay: document.getElementById('qrModalOverlay'),
            qrCode: document.getElementById('qrCode'),
            qrUrl: document.getElementById('qrUrl'),
            qrStartBtn: document.querySelector('.qr-start-btn'),
        };
        this._initEventListeners();
    }
    _initEventListeners() {
        window.addEventListener('popstate', (event) => {
            if (!event.state || event.state.page !== "tour") {
                this.showSelectionScreen();
            }
        });
        if (this.els.qrStartBtn) {
            this.els.qrStartBtn.addEventListener('click', () => this.openQRModal());
        }
        if (this.els.qrModalOverlay) {
            this.els.qrModalOverlay.addEventListener('click', () => this.closeQRModal());
        }
        if (this.els.qrCode) {
            this.els.qrCode.addEventListener('click', () => this.closeQRModal());
        }
        const tourButtonsContainer = document.querySelector('.tour-buttons-list');
        if (tourButtonsContainer) {
            tourButtonsContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.tour-select-button');
                if (btn) {
                    const tour = btn.getAttribute('data-tour');
                    if (tour) {
                        this.app.tourManager.activateTour(tour);
                    }
                }
            });
        }
    }
    showSelectionScreen() {
        this.app.modal.close();
        this.closeQRModal();
        this.app.tourManager.resetTourState();
        this.app.map.clearLayers();
        this.app.map.resetView();
        document.body.classList.remove('tour-active');
        const baseUrl = window.location.origin + window.location.pathname;
        history.pushState(null, "", baseUrl);
    }
    openQRModal() {
        if (typeof QRCode === 'undefined') {
            return;
        }
        const url = window.location.href.replace(/\/$/, '');
        this.els.qrCode.innerHTML = '';
        new QRCode(this.els.qrCode, {
            text: url,
            width: 400,
            height: 400
        });
        this.els.qrUrl.href = url;
        this.els.qrUrl.textContent = url;
        this.els.qrUrl.style.color = 'blue';
        this.els.qrUrl.style.textDecoration = 'underline';
        this.els.qrModalOverlay.style.display = 'flex';
    }
    closeQRModal() {
        this.els.qrModalOverlay.style.display = 'none';
    }
}
class App {
    constructor(config) {
        this.translations = config.translations;
        this.quizTitle = config.quizTitle;
        this.urls = {
            instructionsUrl: config.instructionsUrl,
            legalUrl: config.legalUrl,
            privacyUrl: config.privacyUrl,
        };
        this.map = new QuizMap(this.quizTitle, this.translations, this.urls,
            (quizPointId) => this.modal.open(quizPointId),
            () => this.uiManager.showSelectionScreen());
        this.modal = new QuizModal(this);
        this.tourManager = new TourManager(this);
        this.uiManager = new UIManager(this);
        this.map.app = this;
    }
    init() {
        document.title = this.quizTitle;
        this._registerServiceWorker();
    }
    tr(key, param = null) {
        let text = this.translations[key] || key;
        return param !== null ? text.replace('%s', param) : text;
    }
    _registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                window.location.reload();
                refreshing = true;
            }
        });

        window.addEventListener('load', () => {
            const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
            navigator.serviceWorker.register('sw.js', {
                scope: basePath
            })
            .then(reg => {
                console.log('ServiceWorker erfolgreich registriert mit Scope:', reg.scope);
            })
            .catch(error => {
                console.error('ServiceWorker Registrierung fehlgeschlagen:', error);
            });
        });
    }
}

}