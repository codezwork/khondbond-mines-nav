// enhanced-map.js
// Optimized for Custom KML Styling & Symbol Collision Fixes

let mineMap;
let userMarker;
let watchId = null;
let currentGeoJSON = null;
let lmvFeatures = []; 

window.navState = {
    isActive: false,
    destination: null, 
    userLocation: null, 
    isAutoCentering: false 
};

function initEnhancedMap() {
    mineMap = new maplibregl.Map({
        container: 'enhanced-map',
        style: {
            version: 8,
            glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
            sources: {
                'satellite': {
                    type: 'raster',
                    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                    tileSize: 256
                }
            },
            layers: [{
                id: 'satellite-layer',
                type: 'raster',
                source: 'satellite'
            }]
        },
        center: [85.3798, 21.9438], 
        zoom: 15,
        maxZoom: 17, 
        pitchWithRotate: true,
        dragRotate: true 
    });

    mineMap.addControl(new maplibregl.NavigationControl(), 'bottom-left');

    mineMap.on('load', () => {
        loadAndParseKML('doc.kml');
        setupNavigationLayers();
        startGPSWatch();
    });

    mineMap.on('dragstart', () => {
        if (window.navState.isActive) {
            window.navState.isAutoCentering = false;
        }
    });

    window.mineMap = mineMap;
}

function loadAndParseKML(kmlUrl) {
    fetch(kmlUrl)
        .then(response => response.text())
        .then(kmlText => {
            const parser = new DOMParser();
            const kmlDoc = parser.parseFromString(kmlText, 'text/xml');
            currentGeoJSON = toGeoJSON.kml(kmlDoc);
            
            // --- THE MAGIC: DATA TAGGING & LABEL CONTROL ---
            currentGeoJSON.features.forEach(f => {
                if (!f.properties) f.properties = {};
                const name = (f.properties.name || '').trim().toUpperCase();
                const desc = (f.properties.description || '').trim().toUpperCase();
                const geomType = f.geometry ? f.geometry.type : '';

                // Set a specific label property. If the name is just "0", hide the text entirely!
                f.properties._label = f.properties.name || '';
                if (name === '0') f.properties._label = '';

                // 1. Functional Routes (Hide labels & tag for Turf.js)
                if (name.includes('LMV ROUTE') && /[0-9]/.test(name)) {
                    f.properties._customStyle = 'hidden_functional';
                    f.properties._label = ''; 
                }
                // 2. Master Visual LMV
                else if (name.includes('LMV M ROUTE')) {
                    f.properties._customStyle = 'visual_lmv_green';
                }
                // 3. Polygons
                else if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
                    f.properties._customStyle = 'polygon_pink';
                }
                // 4. Gates
                else if (name.includes('GATE')) {
                    f.properties._customStyle = 'gate_yellow_triangle';
                }
                // 5. Lease Pillars (Ensure it's a boundary number 1+, not a generic "0")
                else if (desc.includes('LEASE PILLAR') || (geomType === 'Point' && /^[1-9]\d*([A-Z]?|\/[0-9]?)$/.test(name))) {
                    f.properties._customStyle = 'pillar_red_circle';
                }
                // 6. Generic Points (Like the inside markers labeled "0")
                else if (geomType === 'Point') {
                    if (name === '0' || name === '') {
                        f.properties._customStyle = 'hidden_point';
                    } else {
                        f.properties._customStyle = 'named_point';
                    }
                }
                // 7. Other Lines
                else if (geomType.includes('LineString')) {
                    f.properties._customStyle = 'other_line';
                }
            });

            lmvFeatures = currentGeoJSON.features.filter(f => f.properties._customStyle === 'hidden_functional');

            mineMap.addSource('kml-data', {
                type: 'geojson',
                data: currentGeoJSON
            });

            // A. Draw Polygons (Pink)
            mineMap.addLayer({
                id: 'kml-polygons',
                type: 'fill',
                source: 'kml-data',
                filter: ['==', ['get', '_customStyle'], 'polygon_pink'],
                paint: {
                    'fill-color': '#ff0000',
                    'fill-opacity': 0.25 
                }
            }, 'route-line-active'); 

            // B. Draw Master LMV Route (Green)
            mineMap.addLayer({
                id: 'kml-master-lmv',
                type: 'line',
                source: 'kml-data',
                filter: ['==', ['get', '_customStyle'], 'visual_lmv_green'],
                paint: {
                    'line-color': '#00FF00',
                    'line-width': 1.5,
                    'line-opacity': 1
                }
            }, 'route-line-active');

            // C. Draw Other Lines
            mineMap.addLayer({
                id: 'kml-other-lines',
                type: 'line',
                source: 'kml-data',
                filter: ['==', ['get', '_customStyle'], 'other_line'],
                paint: {
                    'line-color': ['case', ['has', 'stroke'], ['get', 'stroke'], '#FFFFFF'],
                    'line-width': 2,
                    'line-opacity': 0.6
                }
            }, 'route-line-active');

            // D. Lease Pillars (Bright Red Circles)
            mineMap.addLayer({
                id: 'kml-pillars',
                type: 'circle',
                source: 'kml-data',
                filter: ['==', ['get', '_customStyle'], 'pillar_red_circle'],
                paint: {
                    'circle-color': '#FF0000',
                    'circle-radius': 7, // Increased size to make it obvious!
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#FFFFFF'
                }
            });

            // E. Hidden Points (The "0" markers)
            mineMap.addLayer({
                id: 'kml-hidden-points',
                type: 'circle',
                source: 'kml-data',
                filter: ['==', ['get', '_customStyle'], 'hidden_point'],
                paint: {
                    'circle-color': '#ff0000', 
                    'circle-radius': 4,
                    'circle-opacity': 0
                }
            });

            // E2. Named Points (Markers with actual names like the new added ones)
            mineMap.addLayer({
                id: 'kml-named-points',
                type: 'circle',
                source: 'kml-data',
                filter: ['==', ['get', '_customStyle'], 'named_point'],
                paint: {
                    'circle-color': 'rgba(0,0,0,0)', // Cyan to stand out
                    'circle-radius': 6,
                    'circle-opacity': 0.8,
                    'circle-stroke-width': 0,
                    'circle-stroke-color': '#000000'
                }
            });

            // F. Gates (Yellow Triangles WITH COLLISION OVERRIDE)
            mineMap.addLayer({
                id: 'kml-gates',
                type: 'symbol',
                source: 'kml-data',
                filter: ['==', ['get', '_customStyle'], 'gate_yellow_triangle'],
                layout: {
                    'text-field': '▲', 
                    'text-size': 22,
                    'text-anchor': 'center',
                    'text-allow-overlap': false, // FORCES the triangle to show even if text is nearby!
                    'text-ignore-placement': true
                },
                paint: {
                    'text-color': '#FFFF00',
                    'text-halo-color': '#000000',
                    'text-halo-width': 1
                }
            });

            // G. Text Labels (Pushed downward so they don't cover the markers)
            mineMap.addLayer({
                id: 'kml-labels',
                type: 'symbol',
                source: 'kml-data',
                filter: ['!=', ['get', '_label'], ''], // Only draw if a valid label exists
                layout: {
                    'text-field': ['get', '_label'],
                    'text-font': ['Noto Sans Regular'], 
                    'text-size': 12,
                    'text-anchor': 'top',
                    'text-offset': [0, 1], // Pushes the text label cleanly UNDER the red circles/yellow triangles
                    'symbol-placement': 'point',
                    'text-allow-overlap': true,
                    'text-ignore-placement': true
                },
                paint: {
                    'text-color': '#ffffff',
                    'text-halo-color': '#000000',
                    'text-halo-width': 2
                }
            });

            // Popups
            mineMap.on('click', ['kml-polygons', 'kml-master-lmv', 'kml-pillars', 'kml-gates', 'kml-labels', 'kml-named-points'], (e) => {
                const feature = e.features[0];
                if (!feature.properties.name && !feature.properties.description) return;
                
                let html = '<div class="mine-popup" style="color: #000; padding: 5px;">';
                if (feature.properties.name) html += `<h3 style="margin: 0 0 8px 0;">${feature.properties.name}</h3>`;
                
                let desc = feature.properties.description;
                if (desc && desc !== 'TEXT' && desc !== '0') {
                    desc = desc.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
                    html += `<p style="margin: 0; font-size: 13px;">${desc}</p>`;
                }
                html += '</div>';

                new maplibregl.Popup({ closeButton: false, closeOnClick: true })
                    .setLngLat(e.lngLat)
                    .setHTML(html)
                    .addTo(mineMap);
            });

            // Cursors
            const interactiveLayers = ['kml-polygons', 'kml-master-lmv', 'kml-pillars', 'kml-gates', 'kml-named-points'];
            interactiveLayers.forEach(layer => {
                mineMap.on('mouseenter', layer, () => mineMap.getCanvas().style.cursor = 'pointer');
                mineMap.on('mouseleave', layer, () => mineMap.getCanvas().style.cursor = '');
            });
        })
        .catch(err => console.error("Error loading KML:", err));
}

function setupNavigationLayers() {
    mineMap.addSource('active-route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
    });

    mineMap.addLayer({
        id: 'route-line-active',
        type: 'line',
        source: 'active-route',
        paint: {
            'line-color': '#0088FF',
            'line-width': 6,
            'line-opacity': 0.9
        },
        filter: ['==', 'routeType', 'main']
    });

    mineMap.addLayer({
        id: 'route-line-dashed',
        type: 'line',
        source: 'active-route',
        paint: {
            'line-color': '#0088FF',
            'line-width': 4,
            'line-dasharray': [2, 2],
            'line-opacity': 0.9
        },
        filter: ['==', 'routeType', 'dashed']
    });
}

// --- REPLACE EXISTING startGPSWatch ---
function startGPSWatch() {
    if ("geolocation" in navigator) {
        updateGpsStatus('searching'); // Set initial dot to yellow/pulsing

        watchId = navigator.geolocation.watchPosition(position => {
            const lng = position.coords.longitude;
            const lat = position.coords.latitude;
            window.navState.userLocation = [lng, lat];

            updateUserMarker(lng, lat);
            
            // Success! Update UI
            updateGpsStatus('active'); 
            hideGpsErrorBanner(); 

            if (window.navState.isActive && window.navState.destination) {
                calculateTurfRoute();
            }

            if (window.navState.isAutoCentering) {
                mineMap.flyTo({ center: [lng, lat], speed: 0.5 });
            }

        }, err => {
            console.error("GPS Error:", err);
            updateGpsStatus('error'); // Set dot to red
            handleGpsError(err);      // Trigger the banner
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000 // NEW: 10 second timeout forces the error handler to run if GPS is off
        });
    } else {
        updateGpsStatus('error');
        showGpsErrorBanner("Geolocation is not supported by your browser.");
    }
}

function updateUserMarker(lng, lat) {
    if (!userMarker) {
        const el = document.createElement('div');
        el.className = 'user-location-marker';
        el.style.backgroundColor = '#0088FF';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';

        userMarker = new maplibregl.Marker({element: el})
            .setLngLat([lng, lat])
            .addTo(mineMap);
    } else {
        userMarker.setLngLat([lng, lat]);
    }
}

function calculateTurfRoute() {
    if (!lmvFeatures.length || !window.navState.userLocation || !window.navState.destination) return;

    const userPt = turf.point(window.navState.userLocation);
    const destPt = turf.point(window.navState.destination);

    let closestToUser = null;
    let closestToDest = null;
    let bestLineToUse = null;
    let bestTotalScore = Infinity; 

    lmvFeatures.forEach(lineFeature => {
        if(lineFeature.geometry.type === 'LineString') {
            const snapU = turf.nearestPointOnLine(lineFeature, userPt);
            const snapD = turf.nearestPointOnLine(lineFeature, destPt);
            
            const totalScore = snapU.properties.dist + snapD.properties.dist;
            
            if (totalScore < bestTotalScore) {
                bestTotalScore = totalScore;
                closestToUser = snapU;
                closestToDest = snapD;
                bestLineToUse = lineFeature; 
            }
        }
    });

    if (!closestToUser || !closestToDest || !bestLineToUse) return;

    try {
        const slicedRoute = turf.lineSlice(closestToUser, closestToDest, bestLineToUse);
        slicedRoute.properties.routeType = 'main';

        const offRoadToUser = turf.lineString([window.navState.userLocation, closestToUser.geometry.coordinates], { routeType: 'dashed' });
        const offRoadToDest = turf.lineString([closestToDest.geometry.coordinates, window.navState.destination], { routeType: 'dashed' });

        const routeCollection = turf.featureCollection([slicedRoute, offRoadToUser, offRoadToDest]);
        mineMap.getSource('active-route').setData(routeCollection);
    } catch (e) {
        console.warn("Turf slicing skipped a frame to prevent crash", e);
    }
}

// --- REPLACE EXISTING startNavigation ---
window.startNavigation = function(lat, lng) {
    window.navState.isActive = true;
    window.navState.destination = [lng, lat]; 

    document.getElementById('nav-active-banner').classList.remove('hidden');

    if (window.navState.userLocation) {
        window.navState.isAutoCentering = true;
        calculateTurfRoute();
        mineMap.flyTo({ center: window.navState.userLocation, zoom: 16, pitch: 45 });
    } else {
        // THE MANUAL FALLBACK: No GPS signal yet
        showGpsErrorBanner("GPS unavailable. Tap anywhere on the map to set your starting point.");
        
        // Listen for a ONE-TIME click on the map to manually set their start location
        mineMap.once('click', (e) => {
            // Only use the click if real GPS hasn't kicked in yet
            if (!window.navState.userLocation) {
                window.navState.userLocation = [e.lngLat.lng, e.lngLat.lat];
                updateUserMarker(e.lngLat.lng, e.lngLat.lat);
                calculateTurfRoute();
                mineMap.flyTo({ center: window.navState.userLocation, zoom: 16, pitch: 45 });
                hideGpsErrorBanner();
            }
        });
    }
}

window.stopNavigation = function() {
    window.navState.isActive = false;
    window.navState.destination = null;
    document.getElementById('nav-active-banner').classList.add('hidden');
    
    mineMap.getSource('active-route').setData({ type: 'FeatureCollection', features: [] });
    mineMap.flyTo({ pitch: 0 }); 
}

// --- ADD NEW UI HELPER FUNCTIONS (At bottom of file) ---
function updateGpsStatus(state) {
    const dot = document.getElementById('gps-status-dot');
    if (!dot) return;
    
    // Clear old states, apply new one
    dot.classList.remove('status-searching', 'status-active', 'status-error');
    dot.classList.add(`status-${state}`);
}

function handleGpsError(err) {
    let message = "Unable to find your location.";
    
    switch(err.code) {
        case 1: // PERMISSION_DENIED
            message = "Location access denied. Please enable it in browser settings.";
            break;
        case 2: // POSITION_UNAVAILABLE
            message = "GPS signal lost. Please check device location services.";
            break;
        case 3: // TIMEOUT
            message = "Searching for GPS signal... Ensure clear view of the sky.";
            break;
    }

    // THE FIX: Prevent spamming the user while they are just browsing
    // Only show the banner if they are actively trying to navigate
    if (window.navState.isActive) {
        const msgEl = document.getElementById('gps-error-message');
        
        // Prevent overwriting the "Tap anywhere" manual fallback message
        if (msgEl && !msgEl.textContent.includes("Tap anywhere")) {
            showGpsErrorBanner(message);
        }
    }
}

function showGpsErrorBanner(message) {
    const banner = document.getElementById('gps-error-banner');
    const msgEl = document.getElementById('gps-error-message');
    if (banner && msgEl) {
        msgEl.textContent = message;
        banner.classList.remove('hidden');
    }
}

function hideGpsErrorBanner() {
    const banner = document.getElementById('gps-error-banner');
    if (banner) {
        banner.classList.add('hidden');
    }
}