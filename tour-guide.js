// tour-guide.js
// Website tour guide for index.html

document.addEventListener('DOMContentLoaded', function() {
    // Check if this is index.html (tour always restarts on refresh)
    const isIndexPage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname.endsWith('/');
    
    if (isIndexPage) {
        // Remove any previous tour completion flag
        localStorage.removeItem('tourCompleted');
        
        // Wait for page to fully load
        setTimeout(() => {
            startTour();
        }, 1500);
    }
});

// Tour steps configuration
const tourSteps = [
    {
        target: '.search-pill',
        title: 'Mine Rules PDF',
        message: 'Use the info button here to open the mine overview PDF.',
        position: 'bottom-left',
        step: 1
    },
    {
        target: '.key-locations-fab',
        title: 'Key Locations',
        message: 'Click this button to view important mine locations like Admin Complex, G.E.M Complex, and more.',
        position: 'right',
        step: 2
    },
    {
        target: '.layers-fab',
        title: 'Map Layers',
        message: 'Change between Satellite, Terrain, Topographic, and Street map views using this button.',
        position: 'left',
        step: 3
    },
    {
        target: '.location-fab',
        title: 'My Location',
        message: 'Click here to center the map on your current GPS location.',
        position: 'left',
        step: 4
    },
    {
        target: 'nav a[href="contact.html"], .mobile-direct-link',
        title: 'Important Contacts',
        message: 'Quick access to emergency contacts and department heads for the mine.',
        position: 'top-right',
        step: 5
    },
    {
        target: null, // No target for static message
        title: 'Navigation Tip',
        message: 'Follow the Green Color LMV (Light Motor Vehicle) Road to Explore the Mine Area',
        position: 'center',
        step: 6
    }
];

let currentStep = 0;
let tourOverlay = null;
let tourSpeechBubble = null;

function startTour() {
    // Create tour overlay
    createTourOverlay();
    
    // Show first step
    showStep(0);
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleTourKeyboard);
}

function createTourOverlay() {
    // Create overlay div
    tourOverlay = document.createElement('div');
    tourOverlay.className = 'tour-overlay';
    tourOverlay.id = 'tourOverlay';
    
    // Create backdrop for overlay
    const backdrop = document.createElement('div');
    backdrop.className = 'tour-backdrop';
    
    
    
    // Create tour controls container
    const controls = document.createElement('div');
    controls.className = 'tour-controls';
    
    // Create step indicator
    const stepIndicator = document.createElement('div');
    stepIndicator.className = 'tour-step-indicator';
    stepIndicator.id = 'tourStepIndicator';
    
    // Assemble overlay
    tourOverlay.appendChild(backdrop);

    tourOverlay.appendChild(controls);
    
    // Create speech bubble element
    tourSpeechBubble = document.createElement('div');
    tourSpeechBubble.className = 'tour-speech-bubble';
    tourSpeechBubble.id = 'tourSpeechBubble';
    
    document.body.appendChild(tourOverlay);
    document.body.appendChild(tourSpeechBubble);
    
    // Add animation
    setTimeout(() => {
        tourOverlay.classList.add('active');
    }, 100);
}

function showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= tourSteps.length) {
        endTour();
        return;
    }
    
    currentStep = stepIndex;
    const step = tourSteps[stepIndex];
    
    // Update step indicator
    updateStepIndicator();
    
    // Handle static center message (no target)
    if (step.target === null) {
        // Show static center message
        showStaticCenterMessage(step);
        return;
    }
    
    // Find target element
    let targetElement = null;
    if (typeof step.target === 'string') {
        targetElement = document.querySelector(step.target);
    } else if (step.target instanceof Element) {
        targetElement = step.target;
    }
    
    if (!targetElement) {
        // If element not found, skip to next step
        showNextStep();
        return;
    }
    
    // Highlight target element
    highlightElement(targetElement);
    
    // Show speech bubble
    showSpeechBubble(step, targetElement);
}

function updateStepIndicator() {
    const indicator = document.getElementById('tourStepIndicator');
    if (indicator) {
        indicator.textContent = `Step ${currentStep + 1} of ${tourSteps.length}`;
    }
}

function highlightElement(element) {
    // Remove previous highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
    });
    
    // Add highlight to current element
    element.classList.add('tour-highlight');
    
    // Scroll element into view if needed (with mobile optimization)
    const isMobile = window.innerWidth <= 768;
    element.scrollIntoView({
        behavior: 'smooth',
        block: isMobile ? 'center' : 'center',
        inline: 'center'
    });
}

function showSpeechBubble(step, targetElement) {
    const rect = targetElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth <= 768;
    
    // Mobile optimization: Calculate based on available space
    let top, left, arrowPosition;
    
    if (isMobile) {
        // Mobile-specific positioning to avoid overlap
        const bubbleWidth = Math.min(280, viewportWidth - 40);
        const bubbleHeight = 220; // Increased height for skip button
        
        // Check available space around target
        const spaceAbove = rect.top;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceLeft = rect.left;
        const spaceRight = viewportWidth - rect.right;
        
        // Determine best position to avoid overlap
        if (spaceBelow >= bubbleHeight + 50) {
            // Position below target (preferred for mobile)
            top = rect.bottom + window.scrollY + 10;
            left = Math.max(20, Math.min(rect.left + window.scrollX, viewportWidth - bubbleWidth - 20));
            arrowPosition = 'top';
        } else if (spaceAbove >= bubbleHeight + 50) {
            // Position above target
            top = rect.top + window.scrollY - bubbleHeight - 10;
            left = Math.max(20, Math.min(rect.left + window.scrollX, viewportWidth - bubbleWidth - 20));
            arrowPosition = 'bottom';
        } else if (spaceRight >= bubbleWidth + 50) {
            // Position to the right
            top = Math.max(20, Math.min(rect.top + window.scrollY + (rect.height / 2) - (bubbleHeight / 2), viewportHeight - bubbleHeight - 20));
            left = rect.right + window.scrollX + 10;
            arrowPosition = 'left';
        } else {
            // Position to the left
            top = Math.max(20, Math.min(rect.top + window.scrollY + (rect.height / 2) - (bubbleHeight / 2), viewportHeight - bubbleHeight - 20));
            left = rect.left + window.scrollX - bubbleWidth - 10;
            arrowPosition = 'right';
        }
    } else {
        // Desktop positioning (original logic)
        switch(step.position) {
            case 'bottom-left':
                top = rect.bottom + window.scrollY + 10;
                left = rect.left + window.scrollX;
                arrowPosition = 'top-left';
                break;
            case 'right':
                top = rect.top + window.scrollY + (rect.height / 2) - 60; // Adjusted for taller bubble
                left = rect.right + window.scrollX + 10;
                arrowPosition = 'left';
                break;
            case 'left':
                top = rect.top + window.scrollY + (rect.height / 2) - 60; // Adjusted for taller bubble
                left = rect.left + window.scrollX - 350;
                arrowPosition = 'right';
                break;
            case 'bottom-right':
                top = rect.bottom + window.scrollY + 10;
                left = rect.right + window.scrollX - 300;
                arrowPosition = 'top-right';
                break;
            default:
                top = rect.bottom + window.scrollY + 10;
                left = rect.left + window.scrollX;
                arrowPosition = 'top';
        }
        
        // Ensure bubble stays within viewport on desktop
        const bubbleWidth = 320;
        const bubbleHeight = 220; // Increased height for skip button
        
        if (left + bubbleWidth > viewportWidth) {
            left = viewportWidth - bubbleWidth - 20;
        }
        if (left < 20) {
            left = 20;
        }
        if (top + bubbleHeight > viewportHeight + window.scrollY) {
            top = rect.top + window.scrollY - bubbleHeight - 10;
            arrowPosition = arrowPosition.replace('top', 'bottom');
        }
        if (top < window.scrollY + 20) {
            top = window.scrollY + 20;
        }
    }
    
    // Update speech bubble content and position
    tourSpeechBubble.innerHTML = `
        <div class="tour-speech-bubble-arrow ${arrowPosition}"></div>
        <div class="tour-speech-bubble-content">
            <div class="tour-speech-header">
                <h4>${step.title}</h4>
                <span class="tour-step-badge">${step.step}/${tourSteps.length}</span>
            </div>
            <p>${step.message}</p>
            <div class="tour-speech-actions">
                <button class="tour-speech-prev">← Previous</button>
                <button class="tour-speech-skip">Skip Tour</button>
                <button class="tour-speech-next">Next →</button>
            </div>
        </div>
    `;
    
    // Position the bubble
    tourSpeechBubble.style.top = `${top}px`;
    tourSpeechBubble.style.left = `${left}px`;
    tourSpeechBubble.classList.add('active');
    
    // Add event listeners to bubble buttons
    tourSpeechBubble.querySelector('.tour-speech-prev').addEventListener('click', showPreviousStep);
    tourSpeechBubble.querySelector('.tour-speech-skip').addEventListener('click', endTour);
    tourSpeechBubble.querySelector('.tour-speech-next').addEventListener('click', showNextStep);
}

function showStaticCenterMessage(step) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth <= 768;
    
    // Calculate center position
    const bubbleWidth = isMobile ? Math.min(280, viewportWidth - 40) : 320;
    const bubbleHeight = 220; // Increased height for skip button
    
    const top = (viewportHeight / 2) - (bubbleHeight / 2) + window.scrollY;
    const left = (viewportWidth / 2) - (bubbleWidth / 2);
    
    // Update speech bubble content and position
    tourSpeechBubble.innerHTML = `
        <div class="tour-speech-bubble-arrow center"></div>
        <div class="tour-speech-bubble-content">
            <div class="tour-speech-header">
                <h4>${step.title}</h4>
                <span class="tour-step-badge">${step.step}/${tourSteps.length}</span>
            </div>
            <p>${step.message}</p>
            <div class="tour-speech-actions">
                <button class="tour-speech-prev">← Previous</button>
                <button class="tour-speech-skip">Skip Tour</button>
                <button class="tour-speech-next">Finish Tour</button>
            </div>
        </div>
    `;
    
    // Position the bubble
    tourSpeechBubble.style.top = `${top}px`;
    tourSpeechBubble.style.left = `${left}px`;
    tourSpeechBubble.classList.add('active');
    
    // Add event listeners to bubble buttons
    tourSpeechBubble.querySelector('.tour-speech-prev').addEventListener('click', showPreviousStep);
    tourSpeechBubble.querySelector('.tour-speech-skip').addEventListener('click', endTour);
    tourSpeechBubble.querySelector('.tour-speech-next').addEventListener('click', completeTour);
}

function showNextStep() {
    if (currentStep < tourSteps.length - 1) {
        showStep(currentStep + 1);
    } else {
        completeTour();
    }
}

function showPreviousStep() {
    if (currentStep > 0) {
        showStep(currentStep - 1);
    }
}

function handleTourKeyboard(e) {
    if (!tourOverlay || !tourOverlay.classList.contains('active')) return;
    
    switch(e.key) {
        case 'ArrowRight':
        case ' ':
            e.preventDefault();
            showNextStep();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            showPreviousStep();
            break;
        case 'Escape':
            e.preventDefault();
            endTour();
            break;
    }
}

function completeTour() {
    localStorage.setItem('tourCompleted', 'true');
    endTour();
    
    // Show completion message with reload instruction
    showNotification('Tour completed! Reload the website to restart the tour.');
}

function endTour() {
    // Remove highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
    });
    
    // Remove tour elements
    if (tourOverlay) {
        tourOverlay.classList.remove('active');
        setTimeout(() => {
            if (tourOverlay.parentNode) {
                tourOverlay.parentNode.removeChild(tourOverlay);
            }
        }, 300);
    }
    
    if (tourSpeechBubble) {
        tourSpeechBubble.classList.remove('active');
        setTimeout(() => {
            if (tourSpeechBubble.parentNode) {
                tourSpeechBubble.parentNode.removeChild(tourSpeechBubble);
            }
        }, 300);
    }
    
    // Remove keyboard listener
    document.removeEventListener('keydown', handleTourKeyboard);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'tour-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}