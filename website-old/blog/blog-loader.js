// Dynamic Blog Post Loader
class BlogLoader {
    constructor() {
        this.currentPost = null;
        this.init();
    }

    init() {
        // Get the slug from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('post');
        
        if (!slug) {
            this.showError('No blog post specified');
            return;
        }

        this.loadBlogPost(slug);
    }

    async loadBlogPost(slug) {
        try {
            // Show loading indicator
            this.showLoading(true);

            // Load the markdown content
            const markdownUrl = `markdown/${slug}.md`;
            const response = await fetch(markdownUrl);
            
            if (!response.ok) {
                throw new Error(`Blog post not found: ${slug}`);
            }

            const markdownContent = await response.text();
            const { metadata, content } = this.parseFrontmatter(markdownContent);

            // Convert markdown to HTML
            const htmlContent = await this.convertMarkdownToHTML(content);

            // Display the blog post
            this.displayBlogPost(metadata, htmlContent, slug);

        } catch (error) {
            console.error('Error loading blog post:', error);
            this.showError(`Failed to load blog post: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }

    parseFrontmatter(content) {
        const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);
        
        if (!match) {
            return { metadata: {}, content: content.trim() };
        }
        
        const frontmatter = match[1];
        const body = match[2].trim();
        
        const metadata = {};
        frontmatter.split('\n').forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
                metadata[key] = value;
            }
        });
        
        return { metadata, content: body };
    }

    async convertMarkdownToHTML(markdown) {
        // Simple markdown to HTML conversion
        // For a more robust solution, you could load marked.js client-side
        let html = markdown;

        // Headers
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

        // Bold and italic
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Code blocks
        html = html.replace(/```(\w+)?\n([\s\S]+?)\n```/g, '<pre><code class="language-$1">$2</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');

        // Lists
        html = html.replace(/^\- (.+$)/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        html = html.replace(/^\d+\. (.+$)/gm, '<li>$1</li>');

        // Blockquotes
        html = html.replace(/^> (.+$)/gm, '<blockquote>$1</blockquote>');

        // Paragraphs
        html = html.split('\n\n').map(paragraph => {
            paragraph = paragraph.trim();
            if (paragraph && 
                !paragraph.startsWith('<h') && 
                !paragraph.startsWith('<ul') && 
                !paragraph.startsWith('<ol') && 
                !paragraph.startsWith('<pre') && 
                !paragraph.startsWith('<blockquote')) {
                return `<p>${paragraph}</p>`;
            }
            return paragraph;
        }).join('\n\n');

        return html;
    }

    displayBlogPost(metadata, htmlContent, slug) {
        // Update document title
        document.title = `${metadata.title || 'Blog Post'} | Hayden Prairie`;
        
        // Update meta description
        const existingMeta = document.querySelector('meta[name="description"]');
        if (existingMeta) {
            existingMeta.content = metadata.description || metadata.excerpt || 'Blog post by Hayden Prairie';
        }

        // Fill in the content
        document.getElementById('blogTitle').textContent = metadata.title || 'Untitled Post';
        document.getElementById('blogAuthor').textContent = `By ${metadata.author || 'Hayden Prairie'}`;
        
        // Format date
        if (metadata.date) {
            const date = new Date(metadata.date);
            document.getElementById('blogDate').textContent = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Display tags
        if (metadata.tags) {
            const tags = metadata.tags.split(',').map(tag => tag.trim());
            const tagsHTML = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            document.getElementById('blogTags').innerHTML = tagsHTML;
        }

        // Set content
        document.getElementById('blogContent').innerHTML = htmlContent;

        // Show the blog post
        document.getElementById('blogPost').style.display = 'block';
        
        // Store current post info
        this.currentPost = { metadata, slug };
    }

    showLoading(show) {
        document.getElementById('loadingIndicator').style.display = show ? 'block' : 'none';
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Hide loading and blog post
        this.showLoading(false);
        document.getElementById('blogPost').style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BlogLoader();
});

// Handle browser back/forward
window.addEventListener('popstate', () => {
    window.location.reload();
});
