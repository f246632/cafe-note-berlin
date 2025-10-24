// ===================================
// Gallery Lightbox Functionality
// ===================================

document.addEventListener('DOMContentLoaded', function() {

    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const lightboxCaption = document.querySelector('.lightbox-caption');

    let currentIndex = 0;
    const totalImages = galleryItems.length;

    // Store all image sources and alt texts
    const images = Array.from(galleryItems).map(item => {
        const img = item.querySelector('img');
        return {
            src: img.src,
            alt: img.alt
        };
    });

    // ===================================
    // Open Lightbox
    // ===================================
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            currentIndex = index;
            openLightbox();
        });

        // Keyboard accessibility
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `View image ${index + 1} of ${totalImages}`);

        item.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                currentIndex = index;
                openLightbox();
            }
        });
    });

    function openLightbox() {
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        showImage(currentIndex);

        // Focus management for accessibility
        lightboxClose.focus();
    }

    // ===================================
    // Close Lightbox
    // ===================================
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling

        // Return focus to the gallery item that was clicked
        if (galleryItems[currentIndex]) {
            galleryItems[currentIndex].focus();
        }
    }

    lightboxClose.addEventListener('click', closeLightbox);

    // Close on clicking outside the image
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // ===================================
    // Navigation
    // ===================================
    function showImage(index) {
        // Ensure index is within bounds
        if (index < 0) {
            currentIndex = totalImages - 1;
        } else if (index >= totalImages) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }

        // Update image
        const currentImage = images[currentIndex];
        lightboxImg.src = currentImage.src;
        lightboxImg.alt = currentImage.alt;

        // Update caption
        if (lightboxCaption) {
            lightboxCaption.textContent = `${currentImage.alt} (${currentIndex + 1}/${totalImages})`;
        }

        // Update ARIA labels
        lightboxImg.setAttribute('aria-label', `Image ${currentIndex + 1} of ${totalImages}: ${currentImage.alt}`);
    }

    // Previous image
    lightboxPrev.addEventListener('click', function(e) {
        e.stopPropagation();
        showImage(currentIndex - 1);
    });

    // Next image
    lightboxNext.addEventListener('click', function(e) {
        e.stopPropagation();
        showImage(currentIndex + 1);
    });

    // ===================================
    // Keyboard Navigation
    // ===================================
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;

        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showImage(currentIndex - 1);
                break;
            case 'ArrowRight':
                showImage(currentIndex + 1);
                break;
            case 'Home':
                showImage(0);
                break;
            case 'End':
                showImage(totalImages - 1);
                break;
        }
    });

    // ===================================
    // Touch/Swipe Support for Mobile
    // ===================================
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - next image
                showImage(currentIndex + 1);
            } else {
                // Swiped right - previous image
                showImage(currentIndex - 1);
            }
        }
    }

    // ===================================
    // Preload Adjacent Images for Smooth Navigation
    // ===================================
    function preloadImage(index) {
        if (index >= 0 && index < totalImages) {
            const img = new Image();
            img.src = images[index].src;
        }
    }

    // Preload next and previous images when lightbox opens
    lightbox.addEventListener('transitionend', function() {
        if (lightbox.classList.contains('active')) {
            preloadImage(currentIndex + 1);
            preloadImage(currentIndex - 1);
        }
    });

    // ===================================
    // Gallery Hover Effects Enhancement
    // ===================================
    galleryItems.forEach(item => {
        const img = item.querySelector('img');

        item.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });

        item.addEventListener('mouseleave', function() {
            this.style.zIndex = '1';
        });
    });

    // ===================================
    // Lazy Loading for Gallery Images
    // ===================================
    if ('IntersectionObserver' in window) {
        const galleryObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target.querySelector('img');
                    if (img && img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        galleryObserver.unobserve(entry.target);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });

        galleryItems.forEach(item => {
            galleryObserver.observe(item);
        });
    }

    // ===================================
    // Prevent Right-Click on Gallery Images (Optional)
    // ===================================
    // Uncomment if you want to prevent image downloading
    /*
    galleryItems.forEach(item => {
        item.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    });

    lightboxImg.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    */

    // ===================================
    // Image Loading Animation
    // ===================================
    lightboxImg.addEventListener('load', function() {
        this.style.opacity = '0';
        setTimeout(() => {
            this.style.transition = 'opacity 0.3s ease';
            this.style.opacity = '1';
        }, 10);
    });

    // ===================================
    // Fullscreen API Support (Optional Enhancement)
    // ===================================
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            lightbox.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Double-click to toggle fullscreen
    lightboxImg.addEventListener('dblclick', function() {
        toggleFullscreen();
    });

});
