# Quick Blog Tutorial

## Creating a New Blog Post

### Step 1: Create the Post
```bash
npm run new-post "Your Amazing Blog Title"
```

### Step 2: Edit the Markdown File
Open `blog/markdown/your-amazing-blog-title.md` and:

1. **Update the frontmatter** (the stuff between `---` at the top):
   ```yaml
   ---
   title: Your Amazing Blog Title
   date: 2025-01-15
   author: Hayden Prairie
   excerpt: Write a compelling summary here - this shows up on the main page!
   description: Optional SEO description
   tags: machine learning, tutorial, research
   slug: your-amazing-blog-title
   ---
   ```

2. **Write your content** using Markdown:
   ```markdown
   # Your Amazing Blog Title
   
   Write your introduction here...
   
   ## Main Section
   
   - Use **bold** and *italic* text
   - Add [links](https://example.com)
   - Include `code snippets`
   
   ### Code Blocks
   
   \`\`\`python
   def awesome_function():
       return "This will be syntax highlighted!"
   \`\`\`
   
   ### Math (if you add MathJax)
   
   $$E = mc^2$$
   
   ## Conclusion
   
   Wrap up your thoughts...
   ```

### Step 3: Build and Deploy
```bash
npm run build-blog
```

### Step 4: Test Locally (Optional)
```bash
npm run serve
# Visit http://localhost:8000
```

### Step 5: Commit and Push
```bash
git add .
git commit -m "Add new blog post: Your Amazing Blog Title"
git push
```

## Tips

- **Keep excerpts engaging** - they appear on your main page
- **Use descriptive tags** - helps with organization
- **Include images** by adding them to `assets/images/` and linking: `![Alt text](../../assets/images/your-image.jpg)`
- **Link to your code** by adding GitHub links in the frontmatter or content
- **Preview before publishing** using the local server

## Markdown Cheatsheet

| Element | Syntax |
|---------|---------|
| Headers | `# H1`, `## H2`, `### H3` |
| Bold | `**bold text**` |
| Italic | `*italic text*` |
| Code | `\`code\`` |
| Links | `[text](URL)` |
| Images | `![alt](URL)` |
| Lists | `- item` or `1. item` |
| Quotes | `> quote text` |
| Tables | `\| col1 \| col2 \|` |

## File Structure
```
blog/
├── markdown/           # Your source files (edit these)
│   ├── welcome.md
│   └── new-post.md
├── posts/             # Generated HTML (don't edit)
│   ├── welcome.html
│   └── new-post.html
└── blog-styles.css    # Blog styling
```

That's it! Your blog post will automatically appear on your main page with a clickable title that leads to the full post.
