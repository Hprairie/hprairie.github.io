#!/usr/bin/env node

/**
 * New Blog Post Creator
 * 
 * Usage: node new-post.js "My New Post Title"
 * 
 * This script creates a new Markdown file with frontmatter template
 */

const fs = require('fs').promises;
const path = require('path');

function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with single
        .trim();
}

function getCurrentDate() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
}

function createBlogPostTemplate(title, slug, date) {
    return `---
title: ${title}
date: ${date}
author: Hayden Prairie
excerpt: Write a brief excerpt or summary of your blog post here (this appears on the main page).
description: A longer description for SEO purposes (optional, defaults to excerpt).
tags: tag1, tag2, tag3
slug: ${slug}
---

# ${title}

Write your blog post content here using Markdown syntax.

## Sections

You can use all standard Markdown features:

- **Bold text**
- *Italic text*  
- \`Inline code\`
- [Links](https://example.com)

### Code Blocks

\`\`\`javascript
console.log("Hello, world!");
\`\`\`

### Lists

1. Numbered lists
2. Work great
3. For tutorials

### Quotes

> This is a blockquote for important information or quotes.

## Conclusion

Don't forget to update the excerpt and tags in the frontmatter above!

---

*Thanks for reading! Feel free to reach out with questions or comments.*`;
}

async function createNewPost(title) {
    if (!title) {
        console.error('Please provide a title for your blog post.');
        console.log('Usage: node new-post.js "Your Blog Post Title"');
        process.exit(1);
    }

    const slug = generateSlug(title);
    const date = getCurrentDate();
    const filename = `${slug}.md`;
    const filepath = path.join('./blog/markdown', filename);

    try {
        // Check if file already exists
        try {
            await fs.access(filepath);
            console.error(`A blog post with the slug "${slug}" already exists.`);
            console.log(`File: ${filepath}`);
            process.exit(1);
        } catch (error) {
            // File doesn't exist, which is what we want
        }

        // Create the blog post
        const template = createBlogPostTemplate(title, slug, date);
        await fs.writeFile(filepath, template);

        console.log(`✓ Created new blog post: ${filepath}`);
        console.log(`  Title: ${title}`);
        console.log(`  Slug: ${slug}`);
        console.log(`  Date: ${date}`);
        console.log('\\nNext steps:');
        console.log('1. Edit the markdown file with your content');
        console.log('2. Update the excerpt and tags in the frontmatter');
        console.log('3. Run "npm run build-blog" to generate the HTML page');
        console.log('4. Commit and push your changes');

    } catch (error) {
        console.error('Error creating blog post:', error);
        process.exit(1);
    }
}

// CLI interface
if (require.main === module) {
    const title = process.argv.slice(2).join(' ');
    createNewPost(title);
}

module.exports = { createNewPost };
