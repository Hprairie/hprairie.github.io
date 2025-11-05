# Hayden Prairie's Website

A personal academic website with an integrated blog system built with vanilla HTML, CSS, and JavaScript.

## Features

- 📄 **Dynamic Content Loading**: Publications, updates, and blog posts loaded from JSON data
- ✍️ **Markdown Blog System**: Write blog posts in Markdown and automatically convert to HTML
- 📱 **Responsive Design**: Mobile-friendly layout with smooth animations
- 🎨 **Dark Theme**: Modern dark theme with professional styling
- 🔗 **Individual Blog Pages**: Each blog post gets its own dedicated page
- 🏷️ **Blog Management**: Easy scripts for creating and building blog posts

## Quick Start

### Prerequisites

- Node.js (for blog building functionality)
- Python 3 (for local development server, optional)

### Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build existing blog posts:
   ```bash
   npm run build-blog
   ```

4. Serve locally (optional):
   ```bash
   npm run serve
   # Opens at http://localhost:8000
   ```

## Blog System

### Writing a New Blog Post

1. **Create a new post**:
   ```bash
   npm run new-post "Your Amazing Blog Post Title"
   ```

2. **Edit the generated Markdown file** in `blog/markdown/your-amazing-blog-post-title.md`:
   - Update the frontmatter (title, excerpt, tags, etc.)
   - Write your content in Markdown

3. **Build the blog**:
   ```bash
   npm run build-blog
   ```

4. **Commit and push** your changes

### Blog Post Structure

Each blog post is a Markdown file with frontmatter:

```markdown
---
title: Your Post Title
date: 2025-01-15
author: Hayden Prairie
excerpt: A brief summary that appears on the main page
description: Optional longer description for SEO
tags: machine learning, research, tutorial
slug: your-post-slug
---

# Your Post Title

Your content here using **Markdown** syntax!

## Sections

- Code blocks with syntax highlighting
- Lists and tables
- Images and links
- LaTeX math (if you add MathJax)

### Code Example

\`\`\`python
def hello_world():
    print("Hello from my blog!")
\`\`\`
```

### Directory Structure

```
website/
├── blog/
│   ├── markdown/           # Source Markdown files
│   ├── posts/             # Generated HTML pages
│   └── blog-styles.css    # Blog-specific styles
├── data/
│   ├── blog/              # Generated JSON metadata
│   ├── publications/      # Publication data
│   └── updates/          # Updates data
├── css/
│   └── styles.css        # Main styles
├── js/
│   ├── config.js         # Site configuration
│   ├── content-loader.js # Content loading system
│   └── main.js          # Main JavaScript
├── build-blog.js         # Blog building script
├── new-post.js          # New post creation script
└── index.html           # Main page
```

## Customization

### Site Configuration

Edit `js/config.js` to customize:
- Personal information
- Social links
- Content paths
- Display settings

### Styling

- Main styles: `css/styles.css`
- Blog-specific styles: `blog/blog-styles.css`
- CSS custom properties (variables) at the top of `styles.css`

### Adding Content

#### Publications
Add JSON files to `data/publications/`:
```json
{
    "title": "Paper Title",
    "authors": "Author Names",
    "year": "2025",
    "venue": "Conference Name",
    "description": "Paper description",
    "links": [
        {"name": "GitHub", "url": "https://github.com/..."},
        {"name": "arXiv", "url": "https://arxiv.org/..."}
    ]
}
```

#### Updates  
Add JSON files to `data/updates/`:
```json
{
    "date": "2025-01-15",
    "content": "Update text here"
}
```

## Blog Features

### Supported Markdown Features

- Headers (H1-H6)
- **Bold** and *italic* text
- `Inline code` and code blocks
- Links and images
- Lists (ordered and unordered)
- Tables
- Blockquotes
- Horizontal rules

### Future Enhancements

Consider adding:
- **Math support**: MathJax or KaTeX for LaTeX equations
- **Syntax highlighting**: Prism.js or highlight.js
- **Search functionality**: Client-side search
- **RSS feed**: Automated RSS generation
- **Comments**: Integration with services like Disqus
- **Analytics**: Google Analytics or similar

## Scripts

- `npm run new-post "Title"` - Create a new blog post
- `npm run build-blog` - Build all blog posts
- `npm run serve` - Start local development server
- `npm run dev` - Build blog and start server

## Deployment

This site is designed to work with GitHub Pages or any static hosting service:

1. Build your blog posts
2. Commit all files
3. Push to your repository
4. Configure your hosting service to serve from the root directory

## Technical Details

### Blog Building Process

1. Reads Markdown files from `blog/markdown/`
2. Parses frontmatter for metadata
3. Converts Markdown to HTML using `marked`
4. Generates individual HTML pages in `blog/posts/`
5. Creates JSON metadata files in `data/blog/`
6. Updates main page with new blog post listings

### Performance

- Minimal JavaScript bundle
- CSS-only animations
- Efficient content loading with caching
- Mobile-optimized responsive design

## Contributing

Feel free to:
- Report issues
- Suggest improvements
- Submit pull requests
- Fork for your own use

## License

MIT License - see LICENSE file for details.
