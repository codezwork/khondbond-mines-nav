// enhanced-map.js
// Optimized for the new KML structure (doc.kml)

// Global map reference
let mineMap;

// KML File Configuration
const KML_FILE_PATH = 'doc.kml'; // Updated path

// Store KML styles globally for reference
let kmlStyles = {};

// Store overlay layer groups for custom control panel
let overlayLayers = {};

// Store KML layer reference
let kmlLayer = null;

// Enhanced Map Functionality
// enhanced-map.js - Updated for new layout

function initEnhancedMap() {
    // Initialize the map with satellite view centered on the mine area
    mineMap = L.map('enhanced-map').setView([21.9438, 85.3798], 15);
    
    // Define base layers
    const baseLayers = {
        "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        }),
        "Terrain": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', {
        }),
        "Topographic": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        }),
        "Street Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        })
    };
    
    // Add default base layer
    baseLayers.Satellite.addTo(mineMap);
    
    // Check if we're in the new layout
    const isNewLayout = document.body.classList.contains('full-viewport-map');
    
    if (isNewLayout) {
        // For new layout, use simplified controls
        // Add only the native layers control (collapsed by default)
        const layersControl = L.control.layers(baseLayers, {}, {
            collapsed: true,
            position: 'topright'
        }).addTo(mineMap);
        
        // Add scale control (bottom left)
        L.control.scale({imperial: false, position: 'bottomleft'}).addTo(mineMap);
        
        // Add locate control (bottom right for mobile, topright for desktop)
        const isMobile = window.innerWidth <= 768;
        window.locateControl = L.control.locate({
            position: isMobile ? 'bottomright' : 'topright',
            strings: {
                title: "Find My Location"
            },
            locateOptions: {
                enableHighAccuracy: true,
                maxZoom: 16
            }
        }).addTo(mineMap);
        
    } else {
        // Original implementation for old layout
        // ... keep original code here ...
    }
    
    // Load KML file
    loadKMLFile(KML_FILE_PATH);
    
    // Store map reference globally
    window.mineMap = mineMap;
}

// Initialize custom overlay checkboxes for desktop control panel
function initializeOverlayCheckboxes() {
    const overlayContainer = document.getElementById('overlayCheckboxes');
    if (!overlayContainer) return;
    
    // Clear existing content
    overlayContainer.innerHTML = '';
    
    // Create checkboxes for each overlay
    Object.keys(overlayLayers).forEach(layerName => {
        const checkboxId = `overlay-${layerName.replace(/\s+/g, '-').toLowerCase()}`;
        
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'checkbox-wrapper';
        
        checkboxWrapper.innerHTML = `
            <input type="checkbox" id="${checkboxId}" value="${layerName}" checked>
            <label for="${checkboxId}">${layerName}</label>
        `;
        
        overlayContainer.appendChild(checkboxWrapper);
        
        // Add event listener
        const checkbox = document.getElementById(checkboxId);
        checkbox.addEventListener('change', function() {
            updateOverlayVisibility(layerName, this.checked);
        });
        
        // Add layer to map initially if checked
        if (checkbox.checked) {
            overlayLayers[layerName].addTo(mineMap);
        }
    });
}

// Update overlay visibility based on checkbox state
function updateOverlayVisibility(layerName, isVisible) {
    if (overlayLayers[layerName]) {
        if (isVisible) {
            overlayLayers[layerName].addTo(mineMap);
        } else {
            mineMap.removeLayer(overlayLayers[layerName]);
        }
    }
}

// KML Loading Function - Optimized for new KML structure
function loadKMLFile(kmlUrl) {
    // First parse the KML to extract styles
    parseKMLStyles(kmlUrl).then(() => {
        // Check if omnivore is available
        if (typeof omnivore !== 'undefined' && omnivore.kml) {
            // Method 1: Using omnivore
            kmlLayer = omnivore.kml(kmlUrl)
                .on('ready', function() {
                    // Fit map to show all KML features
                    mineMap.fitBounds(kmlLayer.getBounds());
                    console.log('KML loaded successfully with ' + kmlLayer.getLayers().length + ' features');
                    
                    // Apply KML styles to features
                    applyKMLStyles(kmlLayer);
                    
                    // Add text labels to KML features
                    addKMLTextLabels(kmlLayer);
                    
                    // Add interactivity to KML features
                    addKMLInteractivity(kmlLayer);
                    
                    // Organize KML features into appropriate overlay layers
                    organizeKMLIntoOverlays(kmlLayer);
                    
                    // Add KML layer to custom control panel
                    addKMLOverlayCheckbox(kmlLayer);
                })
                .on('error', function(e) {
                    console.error('Error loading KML file:', e);
                    showKMLFallbackMessage();
                })
                .addTo(mineMap);
        } else {
            // Fallback if omnivore is not available
            console.warn('Omnivore not available, using alternative KML loading');
            loadKMLFileAlternative(kmlUrl);
        }
    }).catch(error => {
        console.error('Error parsing KML styles:', error);
        // Continue with default KML loading even if style parsing fails
        loadKMLFileAlternative(kmlUrl);
    });
}

// Organize KML features into appropriate overlay layers
function organizeKMLIntoOverlays(kmlLayer) {
    kmlLayer.eachLayer(function(layer) {
        if (layer.feature && layer.feature.properties) {
            const props = layer.feature.properties;
            const name = props.name || '';
            const description = props.description || '';
            
            // Check if it's a lease pillar
            if (description.includes('Lease pillar') || 
                (name && /^\d+([A-Z]?|\/[0-9]?)$/.test(name.trim()))) {
                overlayLayers["Lease Pillars"].addLayer(layer.clone());
            }
            // Check if it's infrastructure (PIT, GATE, PLANT, etc.)
            else if (name.includes('PIT') || 
                     name.includes('GATE') || 
                     name.includes('PLANT') || 
                     name.includes('ADMIN') || 
                     name.includes('TLS') || 
                     name.includes('WTP') ||
                     name.includes('ROAD') ||
                     name.includes('Chowk') ||
                     name.includes('COMPLEX')) {
                overlayLayers["Infrastructure"].addLayer(layer.clone());
            }
            // Check if it's an area (based on polygon geometry or area in name)
            else if (layer instanceof L.Polygon || 
                     (props.styleUrl && props.styleUrl.includes('area'))) {
                overlayLayers["Areas"].addLayer(layer.clone());
            }
            // Default to Boundaries
            else {
                overlayLayers["Boundaries"].addLayer(layer.clone());
            }
            
            // Remove from main KML layer to avoid duplication
            kmlLayer.removeLayer(layer);
        }
    });
}

// Add KML overlay checkbox to custom control panel
function addKMLOverlayCheckbox(kmlLayer) {
    const overlayContainer = document.getElementById('overlayCheckboxes');
    if (!overlayContainer) return;
    
    const checkboxId = 'overlay-official-mine-map';
    
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.className = 'checkbox-wrapper';
    
    checkboxWrapper.innerHTML = `
        <input type="checkbox" id="${checkboxId}" value="Official Mine Map" checked>
        <label for="${checkboxId}">Official Mine Map (All Layers)</label>
    `;
    
    overlayContainer.appendChild(checkboxWrapper);
    
    // Add event listener
    const checkbox = document.getElementById(checkboxId);
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            kmlLayer.addTo(mineMap);
        } else {
            mineMap.removeLayer(kmlLayer);
        }
    });
}

// Parse KML styles from the file - Optimized for new structure
function parseKMLStyles(kmlUrl) {
    return fetch(kmlUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(kmlText => {
            const parser = new DOMParser();
            const kmlDoc = parser.parseFromString(kmlText, 'text/xml');
            
            // Clear existing styles
            kmlStyles = {};
            
            // Parse all Style elements
            const styleElements = kmlDoc.getElementsByTagName('Style');
            for (let i = 0; i < styleElements.length; i++) {
                const styleElement = styleElements[i];
                const styleId = styleElement.getAttribute('id');
                
                if (styleId) {
                    kmlStyles[styleId] = {};
                    
                    // Parse LineStyle
                    const lineStyle = styleElement.getElementsByTagName('LineStyle')[0];
                    if (lineStyle) {
                        const colorElement = lineStyle.getElementsByTagName('color')[0];
                        if (colorElement && colorElement.textContent) {
                            kmlStyles[styleId].lineColor = kmlColorToHex(colorElement.textContent);
                        }
                        const widthElement = lineStyle.getElementsByTagName('width')[0];
                        if (widthElement) {
                            kmlStyles[styleId].lineWidth = parseInt(widthElement.textContent) || 2;
                        }
                    }
                    
                    // Parse PolyStyle
                    const polyStyle = styleElement.getElementsByTagName('PolyStyle')[0];
                    if (polyStyle) {
                        const colorElement = polyStyle.getElementsByTagName('color')[0];
                        if (colorElement && colorElement.textContent) {
                            kmlStyles[styleId].polyColor = kmlColorToHex(colorElement.textContent);
                        }
                        
                        const fillElement = polyStyle.getElementsByTagName('fill')[0];
                        if (fillElement) {
                            kmlStyles[styleId].fill = fillElement.textContent === '1';
                        }
                        
                        const outlineElement = polyStyle.getElementsByTagName('outline')[0];
                        if (outlineElement) {
                            kmlStyles[styleId].outline = outlineElement.textContent === '1';
                        }
                    }
                    
                    // Parse LabelStyle
                    const labelStyle = styleElement.getElementsByTagName('LabelStyle')[0];
                    if (labelStyle) {
                        const colorElement = labelStyle.getElementsByTagName('color')[0];
                        if (colorElement && colorElement.textContent) {
                            kmlStyles[styleId].labelColor = kmlColorToHex(colorElement.textContent);
                        }
                    }
                    
                    // Parse IconStyle
                    const iconStyle = styleElement.getElementsByTagName('IconStyle')[0];
                    if (iconStyle) {
                        const colorElement = iconStyle.getElementsByTagName('color')[0];
                        if (colorElement && colorElement.textContent) {
                            kmlStyles[styleId].iconColor = kmlColorToHex(colorElement.textContent);
                        }
                    }
                    
                    // Determine style type based on ID
                    if (styleId.startsWith('area')) {
                        kmlStyles[styleId].type = 'area';
                    } else if (styleId.startsWith('point')) {
                        kmlStyles[styleId].type = 'point';
                    } else if (styleId.startsWith('line')) {
                        kmlStyles[styleId].type = 'line';
                    }
                }
            }
            
            console.log('Parsed KML styles:', kmlStyles);
            return kmlStyles;
        });
}

// Convert KML color format (AABBGGRR) to hex
function kmlColorToHex(kmlColor) {
    if (!kmlColor) return '#000000';
    
    // KML color format is AABBGGRR
    const aa = kmlColor.substring(0, 2);
    const bb = kmlColor.substring(2, 4);
    const gg = kmlColor.substring(4, 6);
    const rr = kmlColor.substring(6, 8);
    
    // Convert to standard RRGGBB format
    return `#${rr}${gg}${bb}`;
}

// Apply KML styles to features - Enhanced for new structure
function applyKMLStyles(kmlLayer) {
    kmlLayer.eachLayer(function(layer) {
        if (layer.feature && layer.feature.properties) {
            const props = layer.feature.properties;
            const styleUrl = props.styleUrl;
            
            if (styleUrl && styleUrl.startsWith('#') && kmlStyles[styleUrl.substring(1)]) {
                const style = kmlStyles[styleUrl.substring(1)];
                
                // Apply styles based on layer type
                if (layer instanceof L.Polyline) {
                    // Apply line styles
                    layer.setStyle({
                        color: style.lineColor || '#504d75ff',
                        weight: style.lineWidth || 3,
                        opacity: 0.8,
                        dashArray: style.type === 'boundary' ? '5, 5' : null
                    });
                } else if (layer instanceof L.Polygon) {
                    // Apply polygon styles for areas
                    const polyStyle = {
                        color: style.lineColor || '#000000',
                        weight: style.lineWidth || 2,
                        opacity: 0.8,
                        fillColor: style.polyColor || (style.lineColor || '#000000'),
                        fillOpacity: style.fill !== false ? 0.3 : 0
                    };
                    layer.setStyle(polyStyle);
                } else if (layer instanceof L.Marker) {
                    // For points, we'll use text labels instead of markers
                    // Store style information for text labels
                    layer.feature.properties._labelColor = style.labelColor || style.iconColor || '#FFFFFF';
                    layer.feature.properties._styleType = style.type || 'point';
                }
            }
            
            // Apply special styling based on feature properties
            if (props.name) {
                if (props.name.includes('PIT')) {
                    layer.feature.properties._featureType = 'pit';
                    layer.feature.properties._labelColor = '#FF0000';
                } else if (props.name.includes('GATE')) {
                    layer.feature.properties._featureType = 'gate';
                    layer.feature.properties._labelColor = '#00FF00';
                } else if (props.description && props.description.includes('Lease pillar')) {
                    layer.feature.properties._featureType = 'lease_pillar';
                    layer.feature.properties._labelColor = '#ffffffff';
                } else if (props.name.includes('ROAD')) {
                    layer.feature.properties._featureType = 'road';
                }
            }
        }
    });
}

// Add text labels to KML features - Enhanced for new structure
function addKMLTextLabels(kmlLayer) {
    kmlLayer.eachLayer(function(layer) {
        if (layer.feature && layer.feature.properties) {
            const props = layer.feature.properties;
            const name = props.name;
            
            if (!name) return;
            
            let labelColor = props._labelColor || '#FFFFFF';
            let fontSize = '12px';
            let fontWeight = 'normal';
            let padding = '0px 0px';
            let borderRadius = '3px';
            
            // Adjust styling based on feature type
            if (props._featureType === 'pit') {
                fontSize = '14px';
                fontWeight = 'bold';
                backgroundColor = 'rgba(255, 0, 0, 0)';
            } else if (props._featureType === 'gate') {
                fontSize = '13px';
                fontWeight = 'bold';
                backgroundColor = 'rgba(0, 255, 0, 0)';
            } else if (props._featureType === 'lease_pillar') {
                fontSize = '11px';
                backgroundColor = 'rgba(0, 0, 255, 0)';
            }
            
            // Get coordinates for label placement
            let latlng;
            if (layer.getLatLng) {
                latlng = layer.getLatLng();
            } else if (layer.getBounds) {
                latlng = layer.getBounds().getCenter();
            }
            
            if (latlng) {
                // Create a custom text label
                const textLabel = L.marker(latlng, {
                    icon: L.divIcon({
                        className: 'kml-text-label',
                        html: `<div class="kml-label" style="color: ${labelColor}; font-size: ${fontSize}; font-weight: ${fontWeight}; background-color: ${backgroundColor}; padding: ${padding}; border-radius: ${borderRadius};">${name}</div>`,
                        iconSize: [100, 20],
                        iconAnchor: [10, 10]
                    })
                });
                
                // Add to the KML layer
                kmlLayer.addLayer(textLabel);
                
                // Store reference to original feature for interactivity
                textLabel.feature = props;
                textLabel.latlng = latlng;
                
                // Remove the original marker if it exists
                if (layer instanceof L.Marker) {
                    kmlLayer.removeLayer(layer);
                }
            }
            
            // Add labels to polygons at their center
            if ((layer instanceof L.Polygon || layer instanceof L.Polyline) && name) {
                const bounds = layer.getBounds();
                const center = bounds.getCenter();
                
                const polygonLabel = L.marker(center, {
                    icon: L.divIcon({
                        className: 'kml-text-label',
                        html: `<div class="kml-label" style="color: #FFFFFF; font-size: 12px; background-color: rgba(0, 0, 0, 0.7); padding: 2px 5px; border-radius: 3px;">${name}</div>`,
                        iconSize: [100, 20],
                        iconAnchor: [50, 10]
                    })
                });
                
                kmlLayer.addLayer(polygonLabel);
                polygonLabel.feature = props;
                polygonLabel.latlng = center;
            }
        }
    });
}

// Alternative KML loading method
function loadKMLFileAlternative(kmlUrl) {
    fetch(kmlUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(kmlText => {
            // Parse KML manually
            const parser = new DOMParser();
            const kmlDoc = parser.parseFromString(kmlText, 'text/xml');
            
            // Create a layer group for the KML
            const kmlLayerGroup = L.layerGroup().addTo(mineMap);
            
            // Parse placemarks (simplified parsing - would need to be expanded for full KML support)
            const placemarks = kmlDoc.getElementsByTagName('Placemark');
            console.log(`Found ${placemarks.length} placemarks in KML`);
            
            // Show fallback message with option to download
            showKMLFallbackMessage();
        })
        .catch(error => {
            console.error('Error loading KML file:', error);
            showKMLFallbackMessage();
        });
}

// Add interactivity to KML features - Enhanced for new structure
function addKMLInteractivity(kmlLayer) {
    kmlLayer.eachLayer(function(layer) {
        if (layer.feature || (layer.latlng && layer.feature)) {
            const props = layer.feature || {};
            const name = props.name || '';
            const description = props.description || '';
            
            // Get coordinates
            const latlng = layer.latlng || layer.getLatLng();
            
            if (latlng) {
                // Create popup content from KML properties
                let popupContent = '<div class="mine-popup">';
                
                if (name) {
                    popupContent += `<h3>${name}</h3>`;
                }
                
                if (description && description !== 'TEXT' && description !== '0') {
                    // Clean up description
                    let cleanDescription = description;
                    cleanDescription = cleanDescription.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
                    cleanDescription = cleanDescription.replace(/\n/g, '<br>');
                    popupContent += `<p>${cleanDescription}</p>`;
                }
                
                // Add feature type if available
                if (props._featureType) {
                    const typeNames = {
                        'pit': 'Mining Pit',
                        'gate': 'Access Gate',
                        'lease_pillar': 'Lease Boundary Pillar',
                        'road': 'Access Road'
                    };
                    popupContent += `<p><strong>Type:</strong> ${typeNames[props._featureType] || props._featureType}</p>`;
                }
                
                // Add coordinates
                popupContent += `<p><strong>Coordinates:</strong> ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}</p>`;
                
                // Add action buttons
                popupContent += `<div class="popup-actions">
                    <button class="popup-button" onclick="zoomToLocation(${latlng.lat}, ${latlng.lng})">Zoom In</button>
                    <button class="popup-button" onclick="getDirections(${latlng.lat}, ${latlng.lng})">Directions</button>
                </div>`;
                
                popupContent += '</div>';
                
                // Bind popup to layer
                layer.bindPopup(popupContent);
                
                // Add click event for additional interactivity
                layer.on('click', function(e) {
                    console.log('KML feature clicked:', props);
                });
            }
        }
    });
}

// Show message if KML fails to load
function showKMLFallbackMessage() {
    const fallbackMessage = L.control({position: 'topright'});
    fallbackMessage.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'kml-fallback-message');
        div.innerHTML = `
            <div style="background: #fff3cd; color: #856404; padding: 10px; border-radius: 4px; border-left: 4px solid #ffc107; max-width: 300px;">
                <strong>KML Map Loaded with Basic Features</strong><br>
                Official mine map loaded with ${kmlLayer ? kmlLayer.getLayers().length : 0} features.
                <br><small>For full KML support, ensure the KML file is accessible.</small>
            </div>
        `;
        return div;
    };
    fallbackMessage.addTo(mineMap);
    
    // Remove message after 10 seconds
    setTimeout(() => {
        mineMap.removeControl(fallbackMessage);
    }, 10000);
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to zoom to a specific location
function zoomToLocation(lat, lng) {
    if (mineMap) {
        mineMap.setView([lat, lng], 18);
    }
}

// Function to get directions to a location
function getDirections(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
}

// Function to search for features by name
function searchFeatures(searchTerm) {
    const results = [];
    
    if (kmlLayer) {
        kmlLayer.eachLayer(function(layer) {
            if (layer.feature && layer.feature.properties) {
                const props = layer.feature.properties;
                const name = props.name || '';
                
                if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    results.push({
                        name: name,
                        latlng: layer.latlng || layer.getLatLng(),
                        type: props._featureType || 'feature'
                    });
                }
            }
        });
    }
    
    return results;
}

// Function to highlight a specific feature
function highlightFeature(featureName) {
    if (kmlLayer) {
        kmlLayer.eachLayer(function(layer) {
            if (layer.feature && layer.feature.properties) {
                const props = layer.feature.properties;
                if (props.name === featureName && layer.latlng) {
                    zoomToLocation(layer.latlng.lat, layer.latlng.lng);
                    layer.openPopup();
                }
            }
        });
    }
}

// Initialize enhanced map when page loads
document.addEventListener('DOMContentLoaded', function() {
    initEnhancedMap();
    
    // Add search functionality if search input exists
    const searchInput = document.getElementById('featureSearch');
    const searchResults = document.getElementById('searchResults');
    
    if (searchInput && searchResults) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim();
            if (searchTerm.length >= 2) {
                const results = searchFeatures(searchTerm);
                
                searchResults.innerHTML = '';
                
                if (results.length > 0) {
                    results.forEach(result => {
                        const resultItem = document.createElement('div');
                        resultItem.className = 'search-result-item';
                        resultItem.innerHTML = `
                            <strong>${result.name}</strong>
                            <br><small>Type: ${result.type}</small>
                        `;
                        resultItem.addEventListener('click', function() {
                            highlightFeature(result.name);
                            searchResults.innerHTML = '';
                            searchInput.value = '';
                        });
                        searchResults.appendChild(resultItem);
                    });
                } else {
                    searchResults.innerHTML = '<div class="no-results">No features found</div>';
                }
            } else {
                searchResults.innerHTML = '';
            }
        });
    }
});
