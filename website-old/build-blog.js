#!/usr/bin/env node

/**
 * Blog Build Script
 * 
 * This script converts Markdown blog posts to HTML pages and updates the blog data.
 * 
 * Usage:
 * - node build-blog.js           # Build all blog posts
 * - node build-blog.js <slug>    # Build specific blog post
 * 
 * Directory Structure:
 * - blog/markdown/           # Markdown source files
 * - blog/posts/             # Generated HTML pages
 * - data/blog/              # JSON metadata files
 */

const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
    markdownDir: './blog/markdown',
    dataDir: './data/blog'
};

// Parse frontmatter from markdown file
function parseFrontmatter(content) {
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

// Generate slug from title
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with single
        .trim();
}

// Create blog post JSON metadata
async function createBlogData(slug, metadata, index) {
    const excerpt = metadata.excerpt || 
                   metadata.description || 
                   `Read "${metadata.title}" - a blog post by ${metadata.author || 'Hayden Prairie'}`;
    
    const jsonData = {
        title: metadata.title,
        slug: slug,
        date: metadata.date,
        author: metadata.author || 'Hayden Prairie',
        excerpt: excerpt,
        description: metadata.description || excerpt,
        tags: metadata.tags ? metadata.tags.split(',').map(t => t.trim()) : []
    };
    
    const outputPath = path.join(CONFIG.dataDir, `post${index + 1}.json`);
    await fs.writeFile(outputPath, JSON.stringify(jsonData, null, 2));
    console.log(`✓ Generated blog data: ${outputPath}`);
    
    return jsonData;
}

// Main build function
async function buildBlog(specificSlug = null) {
    try {
        // Ensure directories exist
        await fs.mkdir(CONFIG.dataDir, { recursive: true });
        
        // Read all markdown files
        const markdownFiles = await fs.readdir(CONFIG.markdownDir);
        const mdFiles = markdownFiles.filter(file => file.endsWith('.md'));
        
        if (mdFiles.length === 0) {
            console.log('No markdown files found in', CONFIG.markdownDir);
            return;
        }
        
        const blogPosts = [];
        
        for (let i = 0; i < mdFiles.length; i++) {
            const filename = mdFiles[i];
            const filePath = path.join(CONFIG.markdownDir, filename);
            
            // Read markdown file
            const content = await fs.readFile(filePath, 'utf-8');
            const { metadata, content: markdownContent } = parseFrontmatter(content);
            
            // Generate slug
            const slug = metadata.slug || generateSlug(metadata.title || path.basename(filename, '.md'));
            
            // Skip if building specific slug and this isn't it
            if (specificSlug && slug !== specificSlug) {
                continue;
            }
            
            // Create JSON data (no HTML files needed now)
            const blogData = await createBlogData(slug, metadata, i);
            blogPosts.push(blogData);
        }
        
        // Sort blog posts by date (newest first)
        blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        console.log(`\\n✓ Built ${blogPosts.length} blog post(s)`);
        console.log('\\nBlog posts:');
        blogPosts.forEach(post => {
            console.log(`  - ${post.title} (${post.slug})`);
        });
        
    } catch (error) {
        console.error('Error building blog:', error);
        process.exit(1);
    }
}

// CLI interface
if (require.main === module) {
    const specificSlug = process.argv[2];
    
    if (specificSlug) {
        console.log(`Building specific blog post: ${specificSlug}`);
    } else {
        console.log('Building all blog posts...');
    }
    
    buildBlog(specificSlug);
}

module.exports = { buildBlog };
