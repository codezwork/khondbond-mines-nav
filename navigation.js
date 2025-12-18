// navigation-new.js
// Google Maps Style Navigation Interface

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the new layout
    initNewNavigationLayout();
    
    // Set up bottom sheet interactions
    initSpeechBubble();
    
    // Set up FAB interactions
    initFABs();
    
    // Set up search functionality
    initSearch();
    
    // Create layers panel
    createLayersPanel();
    
    // Adjust UI for desktop/mobile
    adjustUIForViewport();
    
    // Listen for window resize
    window.addEventListener('resize', adjustUIForViewport);
    
    // Initialize mobile menu toggle from script.js
    initMobileMenu();
});

function initNewNavigationLayout() {
    // Remove any existing page-header and old sections
    const oldSections = document.querySelectorAll('.page-header, .map-section, .locations');
    oldSections.forEach(section => {
        if (section.parentNode) {
            section.parentNode.removeChild(section);
        }
    });
    
    // Add no-scroll class to body
    document.body.classList.add('no-scroll');
    
    // Initialize the map in fullscreen mode
    setTimeout(() => {
        if (typeof initEnhancedMap === 'function') {
            // Store the original initEnhancedMap function
            const originalInitEnhancedMap = window.initEnhancedMap;
            
            // Override to adjust for new layout
            window.initEnhancedMap = function() {
                // Call original function
                originalInitEnhancedMap.call(this);
                
                // Adjust map container for new layout
                const mapContainer = document.getElementById('enhanced-map');
                if (mapContainer) {
                    mapContainer.style.height = '100%';
                    mapContainer.style.width = '100%';
                }
                
                // Remove old controls that interfere with new layout
                removeOldMapControls();
                
                // Ensure zoom controls are positioned correctly
                setTimeout(() => {
                    adjustZoomControlPosition();
                }, 500);
            };
            
            // Call the enhanced map initialization
            initEnhancedMap();
        }
    }, 100);
}

function removeOldMapControls() {
    // Remove the native Leaflet layers control
    const nativeLayersControl = document.querySelector('.leaflet-control-layers');
    if (nativeLayersControl) {
        nativeLayersControl.style.display = 'none';
    }
    
    // Remove any custom control panels from enhanced-map.js
    const customControlPanel = document.querySelector('.map-controls-panel');
    if (customControlPanel) {
        customControlPanel.style.display = 'none';
    }
    
    const legend = document.querySelector('.legend');
    if (legend) {
        legend.style.display = 'none';
    }
}

function adjustZoomControlPosition() {
    // This function ensures zoom controls are in bottom-left
    const zoomControl = document.querySelector('.leaflet-control-zoom');
    if (zoomControl) {
        zoomControl.style.left = 'var(--space-16)';
        zoomControl.style.bottom = 'var(--space-16)';
        zoomControl.style.top = 'auto';
        zoomControl.style.right = 'auto';
    }
}

// Replace the entire bottom-sheet related functions (lines 73-291) with this new code:

// Remove all bottom-sheet initialization and replace with speech bubble
function initSpeechBubble() {
    const keyLocationsFab = document.getElementById('key-locations-fab');
    const speechBubbleOverlay = document.getElementById('speechBubbleOverlay');
    
    if (!keyLocationsFab || !speechBubbleOverlay) return;
    
    // Create backdrop for closing on outside click
    const backdrop = document.createElement('div');
    backdrop.className = 'overlay-backdrop';
    backdrop.id = 'overlayBackdrop';
    document.body.appendChild(backdrop);
    
    // Toggle speech bubble on FAB click
    keyLocationsFab.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleSpeechBubble();
    });
    
    // Close speech bubble when clicking outside
    backdrop.addEventListener('click', closeSpeechBubble);
    
    // Load location cards when speech bubble opens
    speechBubbleOverlay.addEventListener('transitionend', function() {
        if (speechBubbleOverlay.classList.contains('active')) {
            loadLocationCardsSpeechBubble();
        }
    });
}

function toggleSpeechBubble() {
    const speechBubbleOverlay = document.getElementById('speechBubbleOverlay');
    const backdrop = document.getElementById('overlayBackdrop');
    const keyLocationsFab = document.getElementById('key-locations-fab');
    
    if (speechBubbleOverlay.classList.contains('active')) {
        closeSpeechBubble();
    } else {
        openSpeechBubble();
    }
}

function openSpeechBubble() {
    const speechBubbleOverlay = document.getElementById('speechBubbleOverlay');
    const backdrop = document.getElementById('overlayBackdrop');
    const keyLocationsFab = document.getElementById('key-locations-fab');
    
    speechBubbleOverlay.classList.add('active');
    backdrop.classList.add('active');
    keyLocationsFab.style.backgroundColor = 'var(--color-primary)';
    keyLocationsFab.querySelector('svg').style.color = 'var(--color-btn-primary-text)';
    
    // Load location cards
    loadLocationCardsSpeechBubble();
}

function closeSpeechBubble() {
    const speechBubbleOverlay = document.getElementById('speechBubbleOverlay');
    const backdrop = document.getElementById('overlayBackdrop');
    const keyLocationsFab = document.getElementById('key-locations-fab');
    
    speechBubbleOverlay.classList.remove('active');
    backdrop.classList.remove('active');
    keyLocationsFab.style.backgroundColor = 'var(--color-surface)';
    keyLocationsFab.querySelector('svg').style.color = 'var(--color-primary)';
}

function loadLocationCardsSpeechBubble() {
    const carousel = document.getElementById('locationsCarouselSpeech');
    if (!carousel) return;
    
    // Clear existing cards
    carousel.innerHTML = '';
    
    // Check if locationData exists
    if (typeof locationData === 'undefined') {
        console.warn('locationData not found. Loading default locations.');
        loadDefaultLocationsSpeechBubble();
        return;
    }
    
    // Combine all locations from all categories
    const allLocations = [];
    Object.values(locationData).forEach(category => {
        allLocations.push(...category);
    });
    
    // Create cards for each location with staggered animation
    allLocations.forEach((location, index) => {
        const card = createLocationCardSpeechBubble(location, index);
        carousel.appendChild(card);
        
        // Set animation delay for staggered entrance
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // If no locations were loaded, show default
    if (carousel.children.length === 0) {
        loadDefaultLocationsSpeechBubble();
    }
}

function createLocationCardSpeechBubble(location, index) {
    const card = document.createElement('div');
    card.className = 'location-card-speech';
    
    // Get icon from location data or use default
    const icon = location.icon || getDefaultIcon(location);
    
    card.innerHTML = `
        <div class="location-icon-speech">
            ${icon}
        </div>
        <h4>${location.name}</h4>
        <p>${location.description || 'Mine location'}</p>
        <button class="location-button-speech" 
                onclick="zoomToLocation(${location.latitude}, ${location.longitude});closeSpeechBubble()">
            View on Map
        </button>
    `;
    
    // Add click event to entire card
    card.addEventListener('click', function(e) {
        if (!e.target.classList.contains('location-button-speech')) {
            zoomToLocation(location.latitude, location.longitude);
            closeSpeechBubble();
        }
    });
    
    return card;
}

function getDefaultIcon(location) {
    // Return appropriate SVG based on location type
    if (location.name.includes('Administration') || location.name.includes('Admin')) {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V17H7V10ZM11 7H13V17H11V7ZM15 13H17V17H15V13Z"/>
        </svg>`;
    } else if (location.name.includes('G.E.M')) {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
        </svg>`;
    } else {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"/>
        </svg>`;
    }
}

function loadDefaultLocationsSpeechBubble() {
    const carousel = document.getElementById('locationsCarouselSpeech');
    if (!carousel) return;
    
    const defaultLocations = [
        {
            name: "Admin Complex",
            description: "Central Administration & Management Center",
            latitude: 21.9308,
            longitude: 85.3810,
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="15">
            <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3 0 498.7 13.3 512 29.7 512h388.6c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304h-91.4z"/>
            </svg>`
        },
        {
            name: "G.E.M Complex",
            description: "Geology, Equipment & Mining Office Complex",
            latitude: 21.9420,
            longitude: 85.3870,
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
            </svg>`
        },
        {
            name: "CW Plant",
            description: "Crushing and Washing Plant",
            latitude: 21.9440,
            longitude: 85.3860,
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="15" height="20">
            <path d="M475.1 163.8L336 252.3V176c0-13.3-10.7-24-24-24-4.5 0-8.9 1.3-12.8 3.7L160 243.4V176c0-13.3-10.7-24-24-24-4.5 0-8.9 1.3-12.8 3.7L0 233.9V448c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V184c0-18.2-19.8-29.5-36.9-20.2zM64 448V283.9l96-60V448H64zm160 0V275.9l96-60V448h-96zm160 0V244.3l64-40.4V448h-64z"/>
            </svg>`
        },
        {
            name: "Security Control",
            description: "Main mining excavation area",
            latitude: 21.9320,
            longitude: 85.3802,
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="15" height="15">
            <path d="M256 0c4.6 0 9.2.9 13.5 2.7l216 90c8.6 3.6 14.5 12 14.5 21.3 0 198.5-114.9 335.9-241.5 395.3-1.9.9-3.9 1.7-6 2.4-4.3 1.5-8.9 1.5-13.1 0-2.1-.7-4.1-1.5-6-2.4C126.9 449.9 12 312.5 12 114c0-9.3 5.9-17.7 14.5-21.3l216-90C246.8.9 251.4 0 256 0z"/>
            </svg>`
        },
        {
            name: "Twin Chowk",
            description: "Main intersection and access point",
            latitude: 21.9440,
            longitude: 85.3845,
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"/>
            </svg>`
        },
        {
            name: "WTP Area",
            description: "Water Treatment Plant and storage",
            latitude: 21.9253,
            longitude: 85.3799,
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
            </svg>`
        }
    ];
    
    defaultLocations.forEach((location, index) => {
        const card = createLocationCardSpeechBubble(location, index);
        carousel.appendChild(card);
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

function createLayersPanel() {
    // Create the layers panel modal
    const layersPanel = document.createElement('div');
    layersPanel.className = 'layers-panel';
    layersPanel.id = 'layersPanel';
    
    layersPanel.innerHTML = `
        <div class="layers-content">
            <div class="layers-header">
                <h3>Map Layers</h3>
                <button class="close-layers" id="closeLayers">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
            <div class="layer-options" id="layerOptions">
                <!-- Layers will be populated dynamically -->
                <div class="layer-group">
                    <h4>Base Map</h4>
                    <div class="layer-radio">
                        <input type="radio" id="layer-satellite" name="baseLayer" value="satellite" checked>
                        <label for="layer-satellite">Satellite</label>
                        <div class="layer-preview" style="background: linear-gradient(135deg, #2c5e2e, #1e3a1e);"></div>
                    </div>
                    <div class="layer-radio">
                        <input type="radio" id="layer-terrain" name="baseLayer" value="terrain">
                        <label for="layer-terrain">Terrain</label>
                        <div class="layer-preview" style="background: linear-gradient(135deg, #d4b483, #a67c52);"></div>
                    </div>
                    <div class="layer-radio">
                        <input type="radio" id="layer-topographic" name="baseLayer" value="topographic">
                        <label for="layer-topographic">Topographic</label>
                        <div class="layer-preview" style="background: linear-gradient(135deg, #e8e6e1, #d1cfc7);"></div>
                    </div>
                    <div class="layer-radio">
                        <input type="radio" id="layer-street" name="baseLayer" value="street">
                        <label for="layer-street">Street Map</label>
                        <div class="layer-preview" style="background: linear-gradient(135deg, #ffffff, #e0e0e0);"></div>
                    </div>
                </div>
                <div class="overlay-group">
                    <h4>Overlays</h4>
                    <div class="checkbox-wrapper">
                        <input type="checkbox" id="overlay-lease-pillars" checked>
                        <label for="overlay-lease-pillars">Lease Pillars</label>
                    </div>
                    <div class="checkbox-wrapper">
                        <input type="checkbox" id="overlay-infrastructure" checked>
                        <label for="overlay-infrastructure">Infrastructure</label>
                    </div>
                    <div class="checkbox-wrapper">
                        <input type="checkbox" id="overlay-areas" checked>
                        <label for="overlay-areas">Areas</label>
                    </div>
                    <div class="checkbox-wrapper">
                        <input type="checkbox" id="overlay-boundaries" checked>
                        <label for="overlay-boundaries">Boundaries</label>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(layersPanel);
    
    // Add event listeners
    const closeLayersBtn = document.getElementById('closeLayers');
    const layersPanelEl = document.getElementById('layersPanel');
    
    if (closeLayersBtn) {
        closeLayersBtn.addEventListener('click', closeLayersPanel);
    }
    
    if (layersPanelEl) {
        layersPanelEl.addEventListener('click', function(e) {
            if (e.target === layersPanelEl) {
                closeLayersPanel();
            }
        });
    }
    
    // Add event listeners for layer changes
    setupLayerControls();
}

function setupLayerControls() {
    // Base layer radio buttons
    const baseLayerRadios = document.querySelectorAll('input[name="baseLayer"]');
    baseLayerRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            changeBaseLayer(this.value);
        });
    });
    
    // Overlay checkboxes
    const overlayCheckboxes = document.querySelectorAll('.overlay-group input[type="checkbox"]');
    overlayCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const overlayName = this.id.replace('overlay-', '').replace('-', ' ');
            toggleOverlay(overlayName, this.checked);
        });
    });
}

function changeBaseLayer(layerType) {
    if (!window.mineMap) return;
    
    // Remove all base layers
    const baseLayers = window.mineMap._layers;
    Object.keys(baseLayers).forEach(key => {
        const layer = baseLayers[key];
        if (layer._url && layer._url.includes('tile')) {
            window.mineMap.removeLayer(layer);
        }
    });
    
    // Add the selected base layer
    let newLayer;
    switch(layerType) {
        case 'satellite':
            newLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri'
            });
            break;
        case 'terrain':
            newLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri'
            });
            break;
        case 'topographic':
            newLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri'
            });
            break;
        case 'street':
            newLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            });
            break;
        default:
            newLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
    }
    
    newLayer.addTo(window.mineMap);
    showNotification(`Changed to ${layerType} view`);
}

function toggleOverlay(overlayName, isVisible) {
    // This function should interact with the overlayLayers from enhanced-map.js
    if (window.overlayLayers && window.overlayLayers[overlayName]) {
        if (isVisible) {
            window.overlayLayers[overlayName].addTo(window.mineMap);
        } else {
            window.mineMap.removeLayer(window.overlayLayers[overlayName]);
        }
    }
    showNotification(`${overlayName} ${isVisible ? 'enabled' : 'disabled'}`);
}

function initFABs() {
    const layersFab = document.getElementById('layers-fab');
    const locationFab = document.getElementById('location-fab');
    
    if (layersFab) {
        layersFab.addEventListener('click', function() {
            openLayersPanel();
        });
    }
    
    if (locationFab) {
        locationFab.addEventListener('click', function() {
            centerOnUserLocation();
        });
    }
}

function openLayersPanel() {
    const layersPanel = document.getElementById('layersPanel');
    if (layersPanel) {
        layersPanel.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLayersPanel() {
    const layersPanel = document.getElementById('layersPanel');
    if (layersPanel) {
        layersPanel.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function centerOnUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latlng = [position.coords.latitude, position.coords.longitude];
            if (window.mineMap) {
                window.mineMap.setView(latlng, 16);
                
                // Add a marker at user's location
                L.marker(latlng, {
                    icon: L.divIcon({
                        className: 'user-location-marker',
                        html: `<div style="background: var(--color-primary); width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })
                }).addTo(window.mineMap)
                .bindPopup('Your Location')
                .openPopup();
                
                showNotification('Centered on your location');
            }
        }, function(error) {
            console.error('Geolocation error:', error);
            showNotification('Unable to retrieve location. Please enable location services.');
        });
    } else {
        showNotification('Geolocation is not supported by your browser.');
    }
}

function updateFABPosition(isExpanded) {
    const fabContainer = document.querySelector('.fab-container');
    const bottomSheet = document.getElementById('bottomSheet');
    
    if (!fabContainer || !bottomSheet) return;
    
    if (isExpanded) {
        // When expanded, position FABs above the bottom sheet
        const sheetHeight = bottomSheet.offsetHeight;
        fabContainer.style.bottom = `calc(${sheetHeight}px + var(--space-16))`;
    } else {
        // When collapsed, use default position
        fabContainer.style.bottom = 'calc(100px + var(--space-16))';
    }
}

function initSearch() {
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clearSearchBtn');
    const infoBtn = document.getElementById('infoBtn');
    
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            this.parentElement.style.boxShadow = '0 0 0 3px var(--color-focus-ring), var(--shadow-lg)';
            this.parentElement.style.borderColor = 'var(--color-primary)';
        });
        
        searchInput.addEventListener('blur', function() {
            this.parentElement.style.boxShadow = 'var(--shadow-lg)';
            this.parentElement.style.borderColor = 'rgba(var(--color-gray-400-rgb, 119, 124, 124), 0.1)';
        });
        
        searchInput.addEventListener('input', function() {
            if (this.value.trim().length > 0) {
                clearBtn.classList.add('active');
            } else {
                clearBtn.classList.remove('active');
            }
            performSearch(this.value);
        });
    }
    
    // Remove microphone functionality and add PDF modal
    if (infoBtn) {
        infoBtn.addEventListener('click', function() {
            openPdfModal();
        });
    }
    // Initialize PDF modal functionality
    initPdfModal();
}
// PDF Modal Functions
function initPdfModal() {
    const pdfModal = document.getElementById('pdfModal');
    const pdfModalClose = document.getElementById('pdfModalClose');
    const pdfZoomIn = document.getElementById('pdfZoomIn');
    const pdfZoomOut = document.getElementById('pdfZoomOut');
    const pdfDownload = document.getElementById('pdfDownload');
    const pdfViewer = document.getElementById('pdfViewer');
    
    if (!pdfModal) return;
    
    // Create zoom indicator
    const zoomIndicator = document.createElement('div');
    zoomIndicator.className = 'pdf-zoom-indicator';
    zoomIndicator.id = 'pdfZoomIndicator';
    document.querySelector('.pdf-viewer-container').appendChild(zoomIndicator);
    
    // Close modal when clicking the X button
    if (pdfModalClose) {
        pdfModalClose.addEventListener('click', closePdfModal);
    }
    
    // Close modal when clicking outside the content
    pdfModal.addEventListener('click', function(e) {
        if (e.target === pdfModal) {
            closePdfModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && pdfModal.classList.contains('active')) {
            closePdfModal();
        }
    });
    
    // PDF Controls - Corrected Zoom Functionality
    if (pdfZoomIn && pdfViewer) {
        pdfZoomIn.addEventListener('click', function() {
            zoomPdf('in');
        });
    }
    
    if (pdfZoomOut && pdfViewer) {
        pdfZoomOut.addEventListener('click', function() {
            zoomPdf('out');
        });
    }
    
    if (pdfDownload) {
        pdfDownload.addEventListener('click', function() {
            downloadPdf();
        });
    }
}

function openPdfModal() {
    const pdfModal = document.getElementById('pdfModal');
    if (pdfModal) {
        pdfModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Reset zoom when opening
        setTimeout(() => {
            resetPdfZoom();
        }, 100);
    }
}

function closePdfModal() {
    const pdfModal = document.getElementById('pdfModal');
    if (pdfModal) {
        pdfModal.classList.remove('active');
        document.body.style.overflow = '';
        showNotification('PDF viewer closed');
    }
}

function zoomPdf(direction) {
    const pdfViewer = document.getElementById('pdfViewer');
    const zoomIndicator = document.getElementById('pdfZoomIndicator');
    
    if (!pdfViewer) return;
    
    // Store current scale if not exists
    if (!pdfViewer.dataset.scale) {
        pdfViewer.dataset.scale = '100';
    }
    
    // Calculate new scale based on direction
    let currentScale = parseInt(pdfViewer.dataset.scale);
    let newScale;
    
    if (direction === 'in') {
        newScale = currentScale + 25; // Zoom in by 25%
    } else if (direction === 'out') {
        newScale = currentScale - 25; // Zoom out by 25%
    }
    
    // Limit zoom range (50% to 300%)
    newScale = Math.max(50, Math.min(300, newScale));
    
    // Apply zoom using CSS transform
    const scaleFactor = newScale / 100;
    pdfViewer.style.transform = `scale(${scaleFactor})`;
    pdfViewer.style.transformOrigin = '0 0';
    
    // Store new scale
    pdfViewer.dataset.scale = newScale.toString();
    
    // Show zoom indicator
    if (zoomIndicator) {
        zoomIndicator.textContent = `${newScale}%`;
        zoomIndicator.classList.add('show');
        setTimeout(() => {
            zoomIndicator.classList.remove('show');
        }, 1000);
    }
    
    // Show notification
    showNotification(`Zoomed ${direction === 'in' ? 'in' : 'out'} to ${newScale}%`);
}

function resetPdfZoom() {
    const pdfViewer = document.getElementById('pdfViewer');
    const zoomIndicator = document.getElementById('pdfZoomIndicator');
    
    if (!pdfViewer) return;
    
    // Reset to 100% scale
    pdfViewer.style.transform = 'scale(1)';
    pdfViewer.style.transformOrigin = '0 0';
    pdfViewer.dataset.scale = '100';
    
    // Hide zoom indicator
    if (zoomIndicator) {
        zoomIndicator.classList.remove('show');
    }
}

function downloadPdf() {
    // Replace with your actual PDF file path
    const pdfUrl = 'khondbond-overview.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Khondbond_Iron_Mines_Overview.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('PDF saved successfully');
}
