// script-common.js
// Shared JavaScript across all pages

document.addEventListener('DOMContentLoaded', function() {
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});

// Smooth scroll to map section
function smoothScrollToMap() {
    document.getElementById('map').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Function to copy phone number to clipboard
function copyToClipboard(phoneNumber) {
    navigator.clipboard.writeText(phoneNumber).then(function() {
        showCopyNotification('Phone number copied to clipboard!');
    }, function(err) {
        console.error('Could not copy text: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = phoneNumber;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showCopyNotification('Phone number copied to clipboard!');
        } catch (err) {
            console.error('Fallback copy failed: ', err);
            alert('Failed to copy phone number. Please copy manually: ' + phoneNumber);
        }
        document.body.removeChild(textArea);
    });
}

// Function to show a temporary notification
function showCopyNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #101010;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add to the end of script.js

// Scroll reveal animation
document.addEventListener('DOMContentLoaded', function() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    // Set up card indices for staggered animations
    const featureCards = document.querySelectorAll('.feature-card');
    const contactItems = document.querySelectorAll('.contact-item');
    const locationCards = document.querySelectorAll('.location-card');
    const legendItems = document.querySelectorAll('.legend-item');
    
    featureCards.forEach((card, index) => {
        card.style.setProperty('--card-index', index);
    });
    
    contactItems.forEach((item, index) => {
        item.style.setProperty('--item-index', index);
    });
    
    locationCards.forEach((card, index) => {
        card.style.setProperty('--card-index', index);
    });
    
    legendItems.forEach((item, index) => {
        item.style.setProperty('--item-index', index);
    });
    
    // Intersection Observer for scroll animations
    if (revealElements.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        revealElements.forEach(element => {
            observer.observe(element);
        });
    }
    
    // Add hover sound effect for buttons (optional subtle feedback)
    const buttons = document.querySelectorAll('.cta-button, .feature-button, .location-button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            // Create a subtle ripple effect on hover
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size/2;
            const y = event.clientY - rect.top - size/2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                top: ${y}px;
                left: ${x}px;
            `;
            
            this.appendChild(ripple);
            
            // Remove ripple element after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add CSS for dynamic ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// --- PDF Viewer Logic ---

// Path to your PDF file (Relative path recommended)
const url = 'KIMM.pdf'; 

let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.0, // Initial Zoom level (100%)
    canvas = document.getElementById('the-canvas'),
    ctx = canvas.getContext('2d');

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num) {
  pageRendering = true;
  
  // Fetch page
  pdfDoc.getPage(num).then(function(page) {
    const viewport = page.getViewport({scale: scale});
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    const renderTask = page.render(renderContext);

    // Wait for render to finish
    renderTask.promise.then(function() {
      pageRendering = false;
      if (pageNumPending !== null) {
        // New page rendering is pending
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });

  // Update page counters
  document.getElementById('page_num').textContent = num;
  
  // Update zoom percentage text
  document.getElementById('zoomLevel').textContent = Math.round(scale * 100) + "%";
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

/**
 * Displays previous page.
 */
function onPrevPage() {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
}

/**
 * Displays next page.
 */
function onNextPage() {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
}

/**
 * Handles Zoom In
 */
function onZoomIn() {
    scale += 0.2; // Increase zoom by 20%
    queueRenderPage(pageNum);
}

/**
 * Handles Zoom Out
 */
function onZoomOut() {
    if (scale <= 0.4) return; // Prevent zooming out too much
    scale -= 0.2; // Decrease zoom by 20%
    queueRenderPage(pageNum);
}

// --- Updated Event Listeners & Init Logic (Replace end of script.js) ---

// Button Events for Navigation
document.getElementById('pdfPrev').addEventListener('click', onPrevPage);
document.getElementById('pdfNext').addEventListener('click', onNextPage);
document.getElementById('pdfZoomIn').addEventListener('click', onZoomIn);
document.getElementById('pdfZoomOut').addEventListener('click', onZoomOut);

// NEW: Close Button Logic
const closeBtn = document.getElementById('pdfModalClose');
if (closeBtn) {
    closeBtn.addEventListener('click', function() {
        document.getElementById('pdfModal').style.display = 'none';
    });
}

// NEW: Close when clicking outside the white box (overlay background)
window.addEventListener('click', function(event) {
    const modal = document.getElementById('pdfModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
});

// Updated Initialization with Auto-Fit Zoom
function initPdfViewer() {
    // Show modal first so we can calculate width correctly
    const modal = document.getElementById('pdfModal');
    modal.style.display = 'flex'; // Changed from 'block' to 'flex' for centering

    if(pdfDoc === null) { 
        pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
            pdfDoc = pdfDoc_;
            document.getElementById('page_count').textContent = pdfDoc.numPages;
            
            // --- AUTO-ZOOM FIX ---
            // Fetch first page *just to calculate scale*, then render.
            pdfDoc.getPage(1).then(function(page) {
                const container = document.getElementById('pdfCanvasContainer');
                
                // Get available width (minus some padding)
                const availableWidth = container.clientWidth - 40; 
                const viewportUnscaled = page.getViewport({scale: 1});
                
                // Calculate scale to fit width exactly
                const newScale = availableWidth / viewportUnscaled.width;
                
                // Apply the new scale (limit it to reasonable max/min if needed)
                scale = Math.min(Math.max(newScale, 0.5), 1.5); 
                
                // Render the page with the calculated scale
                renderPage(pageNum);
            });

        }).catch(function(error) {
            console.error('Error loading PDF:', error);
            document.getElementById('pdfCanvasContainer').innerHTML = 
                '<p style="text-align:center; color: white; margin-top: 20px;">PDF could not be loaded.</p>';
        });
    } else {
        // If already loaded, just ensure it renders
        renderPage(pageNum);
    }
}

// Trigger Logic
const infoBtn = document.getElementById('infoBtn');
if(infoBtn) {
    infoBtn.addEventListener('click', function() {
        initPdfViewer();
    });
}