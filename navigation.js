// navigation-new.js
// Updated for MapLibre GL JS and Navigation UX

document.addEventListener('DOMContentLoaded', function() {
    initNewNavigationLayout();
    initSpeechBubble();
    initFABs();
    initNavigationUI();
});

function initNewNavigationLayout() {
    document.body.classList.add('no-scroll');
    
    // Initialize MapLibre Map
    setTimeout(() => {
        if (typeof initEnhancedMap === 'function') {
            initEnhancedMap();
        }
    }, 100);
}

// UI controls for the new Turf.js Navigation Feature
function initNavigationUI() {
    const stopBtn = document.getElementById('stop-nav-btn');
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            if (typeof window.stopNavigation === 'function') {
                window.stopNavigation();
            }
        });
    }
    // NEW: Allow users to dismiss the GPS error banner
    const dismissGpsBtn = document.getElementById('dismiss-gps-error');
    if (dismissGpsBtn) {
        dismissGpsBtn.addEventListener('click', () => {
            document.getElementById('gps-error-banner').classList.add('hidden');
        });
    }
}

function initFABs() {
    const locationFab = document.getElementById('location-fab');
    if (locationFab) {
        locationFab.addEventListener('click', function() {
            // If GPS is currently in an error state, tell them why when they click
            const dot = document.getElementById('gps-status-dot');
            if (dot && dot.classList.contains('status-error')) {
                showGpsErrorBanner("Location unavailable. Please check your device settings.");
                return;
            }
            
            // Re-engage auto-centering if they panned away
            if (window.navState) {
                window.navState.isAutoCentering = true;
                if (window.navState.userLocation && window.mineMap) {
                    window.mineMap.flyTo({
                        center: window.navState.userLocation,
                        zoom: 16
                    });
                }
            }
        });
    }
}

// Speech Bubble Logic (Kept mostly identical, updated for MapLibre compatibility)
function initSpeechBubble() {
    const keyLocationsFab = document.getElementById('key-locations-fab');
    const speechBubbleOverlay = document.getElementById('speechBubbleOverlay');
    
    if (!keyLocationsFab || !speechBubbleOverlay) return;
    
    const backdrop = document.createElement('div');
    backdrop.className = 'overlay-backdrop';
    backdrop.id = 'overlayBackdrop';
    document.body.appendChild(backdrop);
    
    keyLocationsFab.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleSpeechBubble();
    });
    
    backdrop.addEventListener('click', closeSpeechBubble);
    speechBubbleOverlay.addEventListener('transitionend', function() {
        if (speechBubbleOverlay.classList.contains('active')) {
            loadDefaultLocationsSpeechBubble();
        }
    });
}

function toggleSpeechBubble() {
    const speechBubbleOverlay = document.getElementById('speechBubbleOverlay');
    if (speechBubbleOverlay.classList.contains('active')) {
        closeSpeechBubble();
    } else {
        openSpeechBubble();
    }
}

function openSpeechBubble() {
    document.getElementById('speechBubbleOverlay').classList.add('active');
    document.getElementById('overlayBackdrop').classList.add('active');
    loadDefaultLocationsSpeechBubble();
}

function closeSpeechBubble() {
    document.getElementById('speechBubbleOverlay').classList.remove('active');
    document.getElementById('overlayBackdrop').classList.remove('active');
}

function loadDefaultLocationsSpeechBubble() {
    const carousel = document.getElementById('locationsCarouselSpeech');
    if (!carousel) return;
    carousel.innerHTML = '';
    
    const defaultLocations = [
        {
            name: "Admin Complex",
            description: "Central Administration & Management Center",
            latitude: 21.9308,
            longitude: 85.3810,
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="15" fill="currentColor">
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
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="15" height="20" fill="currentColor">
            <path d="M475.1 163.8L336 252.3V176c0-13.3-10.7-24-24-24-4.5 0-8.9 1.3-12.8 3.7L160 243.4V176c0-13.3-10.7-24-24-24-4.5 0-8.9 1.3-12.8 3.7L0 233.9V448c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V184c0-18.2-19.8-29.5-36.9-20.2zM64 448V283.9l96-60V448H64zm160 0V275.9l96-60V448h-96zm160 0V244.3l64-40.4V448h-64z"/>
            </svg>`
        },
        {
            name: "Security Control",
            description: "Main mining excavation area",
            latitude: 21.9320,
            longitude: 85.3802,
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="15" height="15" fill="currentColor">
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
        },
        {
            name: "Equipment Maint Shed",
            description: "Maintenance facility near GEM Complex",
            latitude: 21.942126,
            longitude: 85.386866,
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
            </svg>`
        },
        {
            name: "LCSS1",
            description: "Location near GEM Complex",
            latitude: 21.942126,
            longitude: 85.386666,
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
            </svg>`
        },
        {
            name: "LCSS2",
            description: "Location near C/W Plant",
            latitude: 21.943810,
            longitude: 85.385910,
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
            </svg>`
        },
        {
            name: "TLS Office",
            description: "Office facility",
            latitude: 21.949258,
            longitude: 85.388008,
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
            </svg>`
        },
        {
            name: "Outsource Plant",
            description: "Plant near PIT-2",
            latitude: 21.944097,
            longitude: 85.381909,
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
            </svg>`
        }
    ];
    
    defaultLocations.forEach((location) => {
        const card = document.createElement('div');
        card.className = 'location-card-speech';
        // ADD THE ONCLICK TO THE CARD ITSELF
        card.setAttribute('onclick', `triggerNavigation(${location.latitude}, ${location.longitude})`); 
        
        card.innerHTML = `
            <div class="location-icon-speech">
                ${location.icon}
            </div>
            <h4>${location.name}</h4>
            <p>${location.description}</p>
            <span class="location-button-speech">
                Navigate Here
            </span>
        `;
        carousel.appendChild(card);
    });
}

// Global function triggered by the HTML button
window.triggerNavigation = function(lat, lng) {
    closeSpeechBubble();
    if (typeof window.startNavigation === 'function') {
        window.startNavigation(lat, lng);
    }
}