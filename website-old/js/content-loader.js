// Content Loading System
class ContentLoader {
    constructor() {
        this.cache = new Map();
    }

    // Load JSON content from a file
    async loadJSON(filepath, bypassCache = false) {
        const cacheKey = filepath;
        
        // Check internal cache unless bypassing
        if (!bypassCache && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            // Add cache-busting parameter to prevent browser caching
            const cacheBuster = new Date().getTime();
            const urlWithCacheBuster = `${filepath}?_t=${cacheBuster}`;
            
            const response = await fetch(urlWithCacheBuster, {
                cache: 'no-cache', // Disable browser caching
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to load ${filepath}: ${response.status}`);
            }
            const data = await response.json();
            
            // Always update cache with fresh data
            this.cache.set(cacheKey, data);
            return data;
        } catch (error) {
            console.error(`Error loading ${filepath}:`, error);
            return null;
        }
    }

    // Clear the internal cache
    clearCache() {
        this.cache.clear();
    }

    // Load all files from a directory by trying common filenames
    async loadDirectory(basePath, fileList, bypassCache = false) {
        const contents = [];
        
        for (const filename of fileList) {
            const content = await this.loadJSON(`${basePath}${filename}`, bypassCache);
            if (content) {
                contents.push(content);
            }
        }
        
        return contents;
    }

    // Auto-discover content files (GitHub Pages friendly)
    async loadContentFromManifest(manifestPath) {
        try {
            const manifest = await this.loadJSON(manifestPath);
            return manifest ? manifest.files : [];
        } catch (error) {
            console.warn(`No manifest found at ${manifestPath}, using fallback discovery`);
            return [];
        }
    }

    // Load publications
    async loadPublications(bypassCache = true) {
        const publicationFiles = [
            'paper1.json',
            'paper2.json',
            'paper3.json',
            'paper4.json',
            'paper5.json'
        ];

        const publications = await this.loadDirectory(
            SITE_CONFIG.contentPaths.publications, 
            publicationFiles,
            bypassCache
        );

        return publications.sort((a, b) => {
            const dateA = new Date(a.year || a.date || '1900');
            const dateB = new Date(b.year || b.date || '1900');
            return SITE_CONFIG.displaySettings.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }

    // Load blog posts
    async loadBlogPosts(bypassCache = true) {
        const blogFiles = [
            'post1.json',
            'post2.json',
            'post3.json',
            'post4.json',
            'post5.json'
        ];

        const posts = await this.loadDirectory(
            SITE_CONFIG.contentPaths.blog, 
            blogFiles,
            bypassCache
        );

        return posts
            .sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return SITE_CONFIG.displaySettings.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            })
            .slice(0, SITE_CONFIG.displaySettings.maxBlogPosts);
    }

    // Load updates
    async loadUpdates(bypassCache = true) {
        const updateFiles = [
            'update1.json',
            'update2.json',
            'update3.json',
            'update4.json',
            'update5.json',
            'update6.json',
            'update7.json',
            'update8.json',
            'update9.json',
            'update10.json'
        ];

        const updates = await this.loadDirectory(
            SITE_CONFIG.contentPaths.updates, 
            updateFiles,
            bypassCache
        );

        return updates
            .sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return SITE_CONFIG.displaySettings.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            })
            .slice(0, SITE_CONFIG.displaySettings.maxUpdates);
    }
}

// Content rendering functions
const ContentRenderer = {
    renderPublication(pub) {
        const linksHtml = pub.links ? pub.links.map(link => 
            `<a href="${link.url}" class="paper-link" target="_blank">${link.name}</a>`
        ).join('') : '';

        return `
            <div class="card slide-in">
                <div class="paper-title">${pub.title}</div>
                <div class="paper-authors">${pub.authors}</div>
                <div class="paper-authors">${pub.venue}</div>
                <div class="paper-description">${pub.description}</div>
                <div class="paper-links">${linksHtml}</div>
            </div>
        `;
    },

    renderBlogPost(post) {
        const date = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Create the main blog post link
        const blogUrl = post.slug ? `blog/post.html?post=${post.slug}` : '#';
        const titleElement = post.slug ? 
            `<a href="${blogUrl}" class="blog-title-link">${post.title}</a>` : 
            `<div class="paper-title">${post.title}</div>`;

        // Filter out the "Read Full Post" link since we're making the title clickable
        const otherLinks = post.links ? 
            post.links.filter(link => link.name !== "Read Full Post") : [];
        
        const linksHtml = otherLinks.length > 0 ? 
            otherLinks.map(link => `<a href="${link.url}" class="paper-link" target="_blank">${link.name}</a>`).join('') : '';

        return `
            <div class="card slide-in">
                <div class="paper-title">${titleElement}</div>
                <div class="blog-date">${date}</div>
                <div class="blog-excerpt">${post.excerpt}</div>
                <div class="paper-links">${linksHtml}</div>
            </div>
        `;
    },

    renderUpdate(update) {
        const date = new Date(update.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });

        return `
            <div class="card slide-in">
                <div class="update-item">
                    <div class="update-date">${date}</div>
                    <div class="update-content">${update.content}</div>
                </div>
            </div>
        `;
    },

    renderError(section, error) {
        return `
            <div class="error">
                <strong>Error loading ${section}:</strong> ${error.message}
                <br><small>Check the console for more details.</small>
            </div>
        `;
    },

    renderEmpty(section) {
        return `
            <div class="card">
                <div class="update-content" style="text-align: center; color: var(--text-muted);">
                    No ${section} available yet.
                </div>
            </div>
        `;
    }
};

// Initialize the content loader
const contentLoader = new ContentLoader();
