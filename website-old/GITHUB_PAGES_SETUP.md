# GitHub Pages Setup Guide

This website is fully compatible with GitHub Pages! Here's how to set it up:

## Method 1: Direct Repository Deployment (Recommended)

### 1. Repository Setup
Your repository should be named `username.github.io` (e.g., `hprairie.github.io`) for the main site, or any name for a project site.

### 2. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar)
4. Under **Source**, select:
   - **Deploy from a branch**
   - Branch: **main** (or **master**)
   - Folder: **/ (root)**
5. Click **Save**

### 3. Build and Deploy Workflow
```bash
# After making changes or writing new blog posts:
npm run build-blog          # Build your blog posts
git add .                    # Stage all changes
git commit -m "Add new blog post"
git push origin main         # Deploy to GitHub Pages
```

Your site will be available at:
- **Main site**: `https://username.github.io`  
- **Project site**: `https://username.github.io/repository-name`

## Method 2: GitHub Actions (Automated Building)

For automatic building when you push Markdown files:

### 1. Create `.github/workflows/build-blog.yml`:
```yaml
name: Build Blog and Deploy

on:
  push:
    branches: [ main ]
    paths:
      - 'blog/markdown/**'
      - 'build-blog.js'
      - 'package.json'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build blog
      run: npm run build-blog
      
    - name: Commit and push if changes
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add blog/posts/ data/blog/
        git diff --staged --quiet || git commit -m "Auto-build blog posts [skip ci]"
        git push
```

## File Structure for GitHub Pages

```
your-repo/
├── index.html              # Main page (required)
├── _config.yml            # GitHub Pages config
├── blog/
│   ├── posts/             # Generated HTML pages ✓
│   └── blog-styles.css    # Blog styles ✓
├── data/
│   ├── blog/              # Generated JSON ✓
│   ├── publications/      # Your publications ✓
│   └── updates/          # Your updates ✓
├── css/
│   └── styles.css        # Main styles ✓
├── js/
│   ├── config.js         # Site config ✓
│   ├── content-loader.js # Content system ✓
│   └── main.js          # Main JS ✓
├── assets/
│   ├── images/           # Your images ✓
│   └── documents/        # Your CV, etc. ✓
├── package.json          # For building (optional)
├── build-blog.js         # Build script (optional)
└── new-post.js          # New post script (optional)
```

## Important Notes for GitHub Pages

### ✅ **What Works**
- All HTML, CSS, and JavaScript files
- Static assets (images, PDFs, etc.)
- JSON data files
- Relative paths (now fixed!)
- Mobile responsiveness
- SEO meta tags

### ⚠️ **Build Process Options**

**Option A: Build Locally (Simpler)**
```bash
# Write your posts, then:
npm run build-blog
git add .
git commit -m "New blog post"
git push
```

**Option B: Auto-Build with GitHub Actions**  
- Push Markdown files directly
- GitHub automatically builds HTML
- Requires the workflow file above

### 🔧 **Troubleshooting**

**Links not working?**
- Make sure you rebuilt the blog after the path fixes
- Check that file paths are relative (no leading `/`)

**Blog posts not showing?**
- Verify JSON files exist in `data/blog/`
- Check browser console for errors
- Ensure dates are in YYYY-MM-DD format

**Styles not loading?**
- Confirm CSS files are committed to the repository
- Check that paths in HTML are relative

## Custom Domain (Optional)

To use a custom domain:
1. Add a `CNAME` file to your repository root containing your domain
2. Configure DNS records with your domain provider
3. Enable HTTPS in GitHub Pages settings

## Testing Before Deployment

Always test locally before pushing:
```bash
npm run build-blog    # Build the blog
npm run serve        # Test at http://localhost:8000
```

## Performance on GitHub Pages

Your site is optimized for GitHub Pages:
- ✅ Static files only (fast loading)
- ✅ No server-side processing required
- ✅ CDN distribution included
- ✅ HTTPS by default
- ✅ Mobile-friendly

## Quick Deployment Checklist

- [ ] Repository named correctly (`username.github.io` or project name)
- [ ] GitHub Pages enabled in repository settings  
- [ ] All blog posts built (`npm run build-blog`)
- [ ] All files committed and pushed
- [ ] Site accessible at your GitHub Pages URL
- [ ] Links working correctly
- [ ] Mobile layout responsive

Your site should be live within a few minutes of pushing to GitHub!
