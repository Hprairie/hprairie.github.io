// Content Loading System
class ContentLoader {
    constructor() {
        this.cache = new Map();
    }

    // Load JSON content from a file
    async loadJSON(filepath) {
        if (this.cache.has(filepath)) {
            return this.cache.get(filepath);
        }

        try {
            const response = await fetch(filepath);
            if (!response.ok) {
                throw new Error(`Failed to load ${filepath}: ${response.status}`);
            }
            const data = await response.json();
            this.cache.set(filepath, data);
            return data;
        } catch (error) {
            console.error(`Error loading ${filepath}:`, error);
            return null;
        }
    }

    // Load all files from a directory by trying common filenames
    async loadDirectory(basePath, fileList) {
        const contents = [];
        
        for (const filename of fileList) {
            const content = await this.loadJSON(`${basePath}${filename}`);
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
    async loadPublications() {
        const publicationFiles = [
            'paper1.json',
            'paper2.json',
            'paper3.json',
            'paper4.json',
            'paper5.json'
        ];

        const publications = await this.loadDirectory(
            SITE_CONFIG.contentPaths.publications, 
            publicationFiles
        );

        return publications.sort((a, b) => {
            const dateA = new Date(a.year || a.date || '1900');
            const dateB = new Date(b.year || b.date || '1900');
            return SITE_CONFIG.displaySettings.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }

    // Load blog posts
    async loadBlogPosts() {
        const blogFiles = [
            'post1.json',
            'post2.json',
            'post3.json',
            'post4.json',
            'post5.json'
        ];

        const posts = await this.loadDirectory(
            SITE_CONFIG.contentPaths.blog, 
            blogFiles
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
    async loadUpdates() {
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
            updateFiles
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

        const linksHtml = post.links ? post.links.map(link => 
            `<a href="${link.url}" class="paper-link" target="_blank">${link.name}</a>`
        ).join('') : '';

        return `
            <div class="card slide-in">
                <div class="paper-title">${post.title}</div>
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
