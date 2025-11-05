// Main JavaScript file
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize the site
    await initializeSite();
    
    // Set up navigation
    setupNavigation();
    
    // Load all content
    await loadAllContent();
});

// Initialize basic site information
function initializeSite() {
    // Update page title
    document.title = `${SITE_CONFIG.name} - ${SITE_CONFIG.title}`;
    
    // Update profile information
    document.getElementById('profileName').textContent = SITE_CONFIG.name;
    document.getElementById('profileTitle').textContent = SITE_CONFIG.title;
    document.getElementById('profileBio').textContent = SITE_CONFIG.bio;
    document.getElementById('profileResearch').textContent = SITE_CONFIG.research;
    document.getElementById('profileWork').textContent = SITE_CONFIG.work;
    
    // Update profile image
    const profileImg = document.getElementById('profileImage');
    profileImg.src = SITE_CONFIG.profileImage;
    profileImg.alt = SITE_CONFIG.name;
    
    // Handle image load error (fallback to placeholder)
    profileImg.onerror = function() {
        this.src = 'https://via.placeholder.com/180x180/4a9eff/ffffff?text=' + 
                   encodeURIComponent(SITE_CONFIG.name.charAt(0));
    };
    
    // Generate social links
    const socialLinksContainer = document.getElementById('socialLinks');
    socialLinksContainer.innerHTML = SITE_CONFIG.socialLinks.map(link => {
        // Determine the final URL based on isExternal flag
        const finalUrl = link.isExternal ? link.url : window.location.origin + link.url;
        
        return `
            <a href="${finalUrl}" class="social-link" target="_blank" title="${link.description}">
                ${link.icon} ${link.name}
            </a>
        `;
    }).join('');
}

// Set up smooth scrolling navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Smooth scroll to section with offset for sticky navigation
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // For the about section, scroll to the very top
                if (targetId === 'about') {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                } else {
                    // For other sections, use scrollIntoView which respects scroll-margin-top
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Update active nav link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

// Update active navigation link based on scroll position
function updateActiveNavLink() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Get the sticky nav height for proper offset calculation
    const nav = document.querySelector('.nav');
    const navHeight = nav ? nav.offsetHeight : 0;
    
    let current = '';
    
    // Special case: if we're near the top, always select "about"
    if (window.pageYOffset <= 50) {
        current = 'about';
    } else {
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            // Check if section is in view, accounting for the larger scroll margin
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
    }
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Load all content sections
async function loadAllContent() {
    // Clear cache on page load to get fresh data
    contentLoader.clearCache();
    
    // Load content in parallel for better performance
    const [publications, blogPosts, updates] = await Promise.allSettled([
        loadPublications(),
        loadBlogPosts(),
        loadUpdates()
    ]);

    // Handle results
    if (publications.status === 'fulfilled') {
        console.log('Publications loaded successfully');
    } else {
        console.error('Failed to load publications:', publications.reason);
    }

    if (blogPosts.status === 'fulfilled') {
        console.log('Blog posts loaded successfully');
    } else {
        console.error('Failed to load blog posts:', blogPosts.reason);
    }

    if (updates.status === 'fulfilled') {
        console.log('Updates loaded successfully');
    } else {
        console.error('Failed to load updates:', updates.reason);
    }
}

// Load and render publications
async function loadPublications() {
    const container = document.getElementById('publicationsContainer');
    
    try {
        const publications = await contentLoader.loadPublications();
        
        if (publications.length === 0) {
            container.innerHTML = ContentRenderer.renderEmpty('publications');
            return;
        }
        
        container.innerHTML = publications
            .map(pub => ContentRenderer.renderPublication(pub))
            .join('');
            
        // Add staggered animation
        animateCards(container);
        
    } catch (error) {
        container.innerHTML = ContentRenderer.renderError('publications', error);
    }
}

// Load and render blog posts
async function loadBlogPosts() {
    const container = document.getElementById('blogContainer');
    
    try {
        const posts = await contentLoader.loadBlogPosts();
        
        if (posts.length === 0) {
            container.innerHTML = ContentRenderer.renderEmpty('blog posts');
            return;
        }
        
        container.innerHTML = posts
            .map(post => ContentRenderer.renderBlogPost(post))
            .join('');
            
        // Add staggered animation
        animateCards(container);
        
    } catch (error) {
        container.innerHTML = ContentRenderer.renderError('blog posts', error);
    }
}

// Load and render updates
async function loadUpdates() {
    const container = document.getElementById('updatesContainer');
    
    try {
        const updates = await contentLoader.loadUpdates();
        
        if (updates.length === 0) {
            container.innerHTML = ContentRenderer.renderEmpty('updates');
            return;
        }
        
        container.innerHTML = updates
            .map(update => ContentRenderer.renderUpdate(update))
            .join('');
            
        // Add staggered animation
        animateCards(container);
        
    } catch (error) {
        container.innerHTML = ContentRenderer.renderError('updates', error);
    }
}

// Add staggered animation to cards
function animateCards(container) {
    const cards = container.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

// Utility function to format dates
function formatDate(dateString, format = 'long') {
    const date = new Date(dateString);
    const options = {
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        short: { year: 'numeric', month: 'short' },
        year: { year: 'numeric' }
    };
    
    return date.toLocaleDateString('en-US', options[format] || options.long);
}

// Add some visual feedback for loading states
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="loading">Loading...</div>';
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

// Add intersection observer for better animations
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all sections
    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
};

// Initialize intersection observer after DOM is loaded
document.addEventListener('DOMContentLoaded', observeElements);
