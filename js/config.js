// Site Configuration
// Edit this file to customize your website content
const SITE_CONFIG = {
    // Personal Information
    name: "Your Name",
    title: "PhD Student in Computer Science",
    bio: "Hi, I'm [Your Name]! I am currently an undergraduate at [University] studying [Field]. I am originally from [Location]. My primary interests are in [research areas].",
    research: "My research interests have spanned several niches of [field], including [specific areas]. I am broadly interested in developing an understanding of [research focus] to inform new insights into [application areas].",
    work: "Please check out my GitHub to see what I am currently working on and the projects I have contributed towards. On top of my research, I enjoy [hobbies/interests].",
    
    // Profile Image
    profileImage: "assets/images/profile.jpg", // Update this path to your actual photo
    
    // Social Links
    socialLinks: [
        {
            name: "CV",
            icon: "📄",
            url: "#", // Replace with your CV link
            description: "Download my CV"
        },
        {
            name: "LinkedIn",
            icon: "💼",
            url: "#", // Replace with your LinkedIn URL
            description: "Connect on LinkedIn"
        },
        {
            name: "GitHub",
            icon: "💻",
            url: "#", // Replace with your GitHub URL
            description: "View my code"
        },
        {
            name: "Twitter",
            icon: "🐦",
            url: "#", // Replace with your Twitter URL
            description: "Follow me on Twitter"
        }
    ],
    
    // Content directories - these tell the system where to find your content files
    contentPaths: {
        publications: "data/publications/",
        blog: "data/blog/",
        updates: "data/updates/"
    },
    
    // Display settings
    displaySettings: {
        maxUpdates: 10, // Maximum number of updates to show
        maxBlogPosts: 20, // Maximum number of blog posts to show
        sortOrder: "desc" // "desc" for newest first, "asc" for oldest first
    }
};
