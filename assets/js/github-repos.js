// GitHub API integration for Open Source section
(function() {
    // Language color mapping using Kanagawa palette colors
    const languageColors = {
        'Python': '#7FB4CA', // springBlue - Blue fits Python
        'JavaScript': '#E6C384', // carpYellow - Yellow fits JS
        'TypeScript': '#7E9CD8', // crystalBlue - Blue
        'Java': '#DCA561', // autumnYellow - Orange/yellow
        'C++': '#C34043', // autumnRed - Red
        'C': '#727169', // fujiGray - Gray
        'Go': '#98BB6C', // springGreen - Green
        'Rust': '#FFA066', // surimiOrange - Orange/rust colored
        'Ruby': '#D27E99', // sakuraPink - Pink/red
        'PHP': '#938AA9', // springViolet1 - Purple
        'Swift': '#FFA066', // surimiOrange - Orange
        'Kotlin': '#957FB8', // oniViolet - Purple
        'Scala': '#E82424', // samuraiRed - Red
        'Shell': '#98BB6C', // springGreen - Green
        'HTML': '#E46876', // waveRed - Red
        'CSS': '#9CABCA', // springViolet2 - Purple/blue
        'Jupyter Notebook': '#CC6D00', // lotusOrange - Orange fits notebooks
        'R': '#7E9CD8', // crystalBlue - Blue
        'MATLAB': '#DCA561', // autumnYellow - Orange/yellow
        'Dart': '#7FB4CA', // springBlue - Blue
        'Vue': '#98BB6C', // springGreen - Green
        'React': '#7FB4CA', // springBlue - Blue
        'Angular': '#E82424', // samuraiRed - Red
        'Svelte': '#FF5D62', // peachRed - Red
        'Other': '#727169' // fujiGray - Gray
    };

    // Get language color
    function getLanguageColor(language) {
        return languageColors[language] || languageColors['Other'];
    }

    // Cache management
    function getCacheKey(repo) {
        return `github_repo_${repo.replace('/', '_')}`;
    }

    function getCachedRepo(repo) {
        try {
            const cacheKey = getCacheKey(repo);
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;

            const data = JSON.parse(cached);
            const now = Date.now();
            const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

            // Check if cache is less than 1 hour old
            if (now - data.timestamp < oneHour) {
                return data.repoData;
            }

            // Cache expired, remove it
            localStorage.removeItem(cacheKey);
            return null;
        } catch (error) {
            console.warn(`Error reading cache for ${repo}:`, error);
            return null;
        }
    }

    function setCachedRepo(repo, repoData) {
        try {
            const cacheKey = getCacheKey(repo);
            const data = {
                repoData: repoData,
                timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (error) {
            console.warn(`Error writing cache for ${repo}:`, error);
            // localStorage might be full or disabled, continue without caching
        }
    }

    // Fetch repository data from GitHub API
    async function fetchGitHubRepo(repo) {
        // Check cache first
        const cached = getCachedRepo(repo);
        if (cached) {
            console.log(`Using cached data for ${repo}`);
            return cached;
        }
        try {
            const response = await fetch(`https://api.github.com/repos/${repo}`);
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`Repository not found: ${repo}`);
                    return null;
                } else if (response.status === 403) {
                    // Rate limit or forbidden
                    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
                    if (rateLimitRemaining === '0') {
                        console.warn(`GitHub API rate limit exceeded for ${repo}`);
                        return null;
                    }
                    throw new Error(`Access forbidden for ${repo}`);
                }
                throw new Error(`Failed to fetch ${repo}: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            const repoData = {
                name: data.name,
                fullName: data.full_name,
                description: data.description || 'No description available',
                language: data.language || 'Other',
                languageColor: getLanguageColor(data.language || 'Other'),
                url: data.html_url,
                stars: data.stargazers_count,
                forks: data.forks_count,
                isPublic: !data.private
            };
            
            // Cache the result
            setCachedRepo(repo, repoData);
            
            return repoData;
        } catch (error) {
            console.error(`Error fetching ${repo}:`, error);
            return null;
        }
    }

    // Create card HTML
    function createCard(project) {
        if (!project) return '';
        
        return `
            <div class="opensource-card slide-in">
                <div class="opensource-card-header">
                    <div class="opensource-card-title-section">
                        <svg class="opensource-icon" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 1 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 0 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0 1 1h7.5Zm-6 4.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
                        </svg>
                        <a href="${project.url}" class="opensource-card-name" target="_blank">${project.name}</a>
                    </div>
                    ${project.isPublic ? '<span class="opensource-public-badge">Public</span>' : ''}
                </div>
                <div class="opensource-card-description">${project.description}</div>
                <div class="opensource-card-footer">
                    ${project.language ? `
                        <div class="opensource-language">
                            <span class="opensource-language-dot" style="background-color: ${project.languageColor}"></span>
                            <span>${project.language}</span>
                        </div>
                    ` : ''}
                    ${project.stars > 0 ? `
                        <div class="opensource-stats">
                            <svg class="opensource-star-icon" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"/>
                            </svg>
                            <span>${project.stars}</span>
                        </div>
                    ` : ''}
                    ${project.forks > 0 ? `
                        <div class="opensource-stats">
                            <svg class="opensource-fork-icon" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/>
                            </svg>
                            <span>${project.forks}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Load repositories from GitHub API
    async function loadRepositories() {
        const container = document.getElementById('opensourceContainer');
        if (!container) return;

        // Get repository list from JSON script tag
        const reposDataElement = document.getElementById('repos-data');
        let repos = [];
        
        if (reposDataElement) {
            try {
                // Get text content and clean it up
                let reposText = reposDataElement.textContent || reposDataElement.innerText || '';
                reposText = reposText.trim();
                
                // Remove any leading/trailing whitespace and newlines
                reposText = reposText.replace(/^\s+|\s+$/g, '');
                
                if (!reposText || reposText === '') {
                    throw new Error('Repository data is empty');
                }
                
                repos = JSON.parse(reposText);
                
                if (!Array.isArray(repos)) {
                    throw new Error('Repository data is not an array');
                }
            } catch (e) {
                console.error('Error parsing repository data:', e);
                console.error('Raw data:', reposDataElement.textContent);
                container.innerHTML = `
                    <div class="card">
                        <div class="update-content empty-state">
                            Error parsing repository data: ${e.message}. Check browser console for details.
                        </div>
                    </div>
                `;
                return;
            }
        } else {
            console.error('Repository data script tag not found');
            container.innerHTML = `
                <div class="card">
                    <div class="update-content empty-state">
                        Repository data not found. Make sure _data/opensource_repos.yml exists.
                    </div>
                </div>
            `;
            return;
        }

        if (repos.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <div class="update-content empty-state">
                        No repositories configured. Add repositories to _data/opensource_repos.yml
                    </div>
                </div>
            `;
            return;
        }

        // Show loading state
        container.innerHTML = `
            <div class="card">
                <div class="update-content empty-state">
                    Loading open source projects...
                </div>
            </div>
        `;

        try {
            // Fetch all repositories in parallel
            const projects = await Promise.all(repos.map(repo => fetchGitHubRepo(repo)));
            const validProjects = projects.filter(p => p !== null);

            if (validProjects.length === 0) {
                // Check if it's a rate limit issue
                const hasRateLimit = projects.some(p => p === null);
                const errorMessage = hasRateLimit 
                    ? 'GitHub API rate limit exceeded. Please wait a few minutes and refresh the page.'
                    : 'Failed to load repositories. Please check your repository names in _data/opensource_repos.yml';
                
                container.innerHTML = `
                    <div class="card">
                        <div class="update-content empty-state">
                            ${errorMessage}
                        </div>
                    </div>
                `;
                return;
            }

            // Render cards
            container.innerHTML = validProjects.map(createCard).join('');
        } catch (error) {
            console.error('Error loading repositories:', error);
            container.innerHTML = `
                <div class="card">
                    <div class="update-content empty-state">
                        Error loading repositories: ${error.message}. Please try again later.
                    </div>
                </div>
            `;
        }
    }

    // Load when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadRepositories);
    } else {
        loadRepositories();
    }
})();

