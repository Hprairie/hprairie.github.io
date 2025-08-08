// Site Configuration
// Edit this file to customize your website content
const SITE_CONFIG = {
    // Personal Information
    name: "Hayden Prairie",
    title: "CSE PhD @ University of California, San Diego",
    bio: "Hi, I'm Hayden! I am currently an PhD student at UCSD studying Computer Science and Engineering. I am originally from Austin, Texas and previously did by undergraduate at University of Texas at Austin. My primary interests are core machine learning and computer systems!",
    research: "My research mostly covers the intersection of ML and systems, including SSMs, structured sparsity, and all things GPU. I am broadly interested in developing an understanding of how we can better interpret and exploit sparsity to improve into the efficiency of expressivity of large models.",
    work: "Please check out my GitHub to see what I am currently working on and the projects I have contributed to!",
    
    // Profile Image
    profileImage: "assets/images/profile.jpg", // Update this path to your actual photo
    
    // Social Links
    socialLinks: [
        {
            name: "CV",
            icon: "📄",
            url: "/assets/documents/cv.pdf", // Replace with your CV link
            description: "Download my CV",
            isExternal: false // This will be appended to hostname
        },
        {
            name: "LinkedIn",
            icon: "💼",
            url: "https://www.linkedin.com/in/haydenprairie", // Replace with your LinkedIn URL
            description: "Connect on LinkedIn",
            isExternal: true // This will be used as-is
        },
        {
            name: "GitHub",
            icon: "💻",
            url: "https://github.com/Hprairie", // Replace with your GitHub URL
            description: "View my code",
            isExternal: true // This will be used as-is
        },
        {
            name: "Twitter",
            icon: "🐦",
            url: "https://twitter.com/hayden_prairie", // Replace with your Twitter URL
            description: "Follow me on Twitter",
            isExternal: true // This will be used as-is
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
