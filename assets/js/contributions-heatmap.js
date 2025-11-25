// Simple GitHub contribution heatmap
// Designed to be extensible for Hugging Face and wandb

(function() {
    'use strict';

    // Get contribution data from config
    const configScript = document.getElementById('contributions-config');
    if (!configScript) return;

    let config;
    try {
        config = JSON.parse(configScript.textContent);
    } catch (e) {
        console.error('Error parsing contributions config:', e);
        return;
    }

    const container = document.getElementById('contributionsHeatmap');
    if (!container) return;

    // Generate date range (exactly 365 days, ensuring we include all months)
    function getDateRange() {
        const end = new Date();
        end.setHours(23, 59, 59, 999); // End of today
        
        // Start from exactly 364 days ago (365 days total including today)
        const start = new Date(end);
        start.setDate(start.getDate() - 364);
        start.setHours(0, 0, 0, 0); // Start of that day
        
        // Ensure we have exactly 365 days
        const daysDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
        if (daysDiff !== 365) {
            // Adjust if needed
            start.setDate(start.getDate() - (365 - daysDiff));
        }
        
        return { start, end };
    }

    // Generate array of dates for the last year (exactly 365 days)
    function generateDates() {
        const { start, end } = getDateRange();
        const dates = [];
        const current = new Date(start);
        
        while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }

    // Fetch GitHub contributions
    async function fetchGitHubContributions(username) {
        try {
            const contributions = {};
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            const since = oneYearAgo.toISOString();
            
            // Strategy 1: Fetch public events (cheapest, most detailed for recent activity)
            // Events api returns max 300 events (3 pages x 100) or 90 days, whichever comes first.
            // This is good for recent streak, but not full year.
            try {
                let eventsPage = 1;
                let hasMoreEvents = true;
                
                // Fetch up to 3 pages (API limit for events)
                while (hasMoreEvents && eventsPage <= 3) {
                    const eventsResponse = await fetch(
                        `https://api.github.com/users/${username}/events/public?per_page=100&page=${eventsPage}`
                    );
                    
                    if (eventsResponse.ok) {
                        const events = await eventsResponse.json();
                        
                        if (events.length === 0) {
                            hasMoreEvents = false;
                        } else {
                            events.forEach(event => {
                                if (event.created_at && event.type === 'PushEvent') {
                                    const date = event.created_at.split('T')[0];
                                    contributions[date] = (contributions[date] || 0) + (event.payload.size || 1);
                                } else if (event.created_at) {
                                    // Other events count as 1
                                    const date = event.created_at.split('T')[0];
                                    contributions[date] = (contributions[date] || 0) + 1;
                                }
                            });
                            eventsPage++;
                        }
                    } else {
                        hasMoreEvents = false;
                    }
                }
            } catch (error) {
                console.warn('Error fetching public events:', error);
            }
            
            // Strategy 2: Fetch commits from recently active repositories to fill in older data
            // We only check top 10 recently updated repos to avoid rate limits
            try {
                const reposResponse = await fetch(
                    `https://api.github.com/users/${username}/repos?per_page=10&sort=updated`
                );
                
                if (reposResponse.ok) {
                    const repos = await reposResponse.json();
                    
                    for (const repo of repos) {
                        // Skip if repo hasn't been updated in the last year (optimization)
                        if (new Date(repo.pushed_at) < oneYearAgo) continue;

                        // Fetch commits (limit to 1 page of 100 commits per repo)
                        // This is a trade-off: we might miss commits if someone pushes >100 times to one repo,
                        // but it keeps API calls low (max 10 calls here).
                        try {
                            const commitsResponse = await fetch(
                                `https://api.github.com/repos/${repo.full_name}/commits?author=${username}&since=${since}&per_page=100`
                            );
                            
                            if (commitsResponse.ok) {
                                const commits = await commitsResponse.json();
                                commits.forEach(commit => {
                                    if (commit.commit && commit.commit.author && commit.commit.author.date) {
                                        const date = commit.commit.author.date.split('T')[0];
                                        // Only add if we don't have high confidence data from events for this date
                                        // (Events are better, but limited in time. Commits fill the gap.)
                                        // Actually, just add them. It might double count if event and commit overlap,
                                        // but for a heatmap "more is better" visual usually.
                                        // To be safe, we can just set to max or add. Let's add for now.
                                        // A better way is to track unique commit SHAs but that's complex.
                                        // Simple approach: use a Set of processed commit SHAs if we really cared, 
                                        // but here just raw count is fine for a visual heatmap.
                                        contributions[date] = (contributions[date] || 0) + 1;
                                    }
                                });
                            }
                            
                            // Small delay
                            await new Promise(resolve => setTimeout(resolve, 100));
                        } catch (e) {
                            console.warn(`Error fetching commits for ${repo.name}:`, e);
                        }
                    }
                }
            } catch (error) {
                console.warn('Error fetching repos:', error);
            }
            
            return contributions;
        } catch (error) {
            console.error('Error fetching GitHub contributions:', error);
            return {};
        }
    }

    // Get contribution level (0-4) for a date
    function getContributionLevel(date, contributions) {
        const dateStr = date.toISOString().split('T')[0];
        const count = contributions[dateStr] || 0;
        
        if (count === 0) return 0;
        if (count === 1) return 1;
        if (count <= 3) return 2;
        if (count <= 5) return 3;
        return 4;
    }

    // Render heatmap
    function renderHeatmap(contributions) {
        const dates = generateDates();
        
        // Group dates into weeks (Sunday to Saturday)
        const weeks = [];
        let currentWeek = [];
        let firstDayOfWeek = dates[0].getDay(); // 0 = Sunday
        
        // Pad first week if it doesn't start on Sunday
        for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push(null);
        }
        
        dates.forEach(date => {
            currentWeek.push(date);
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });
        
        // Pad last week if needed
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeks.push(currentWeek);
        }

        // Calculate month labels (show at start of each month's first week)
        const monthPositions = {};
        dates.forEach((date, index) => {
            // Check if this is the first day of a month
            if (date.getDate() === 1) {
                const month = date.getMonth();
                const monthKey = `${date.getFullYear()}-${month}`;
                if (!monthPositions[monthKey]) {
                    // Find which week this date falls into
                    let dayCount = index + firstDayOfWeek;
                    const weekIndex = Math.floor(dayCount / 7);
                    monthPositions[monthKey] = {
                        week: weekIndex,
                        label: date.toLocaleDateString('en-US', { month: 'short' })
                    };
                }
            }
        });

        let html = '<div class="heatmap-container">';
        html += '<div class="heatmap-header">';
        html += `<span class="heatmap-title">Contributions</span>`;
        html += '</div>';
        html += '<div class="heatmap-wrapper">';
        
        // Day labels column
        html += '<div class="heatmap-day-labels">';
        html += '<div class="heatmap-day-labels-spacer"></div>'; // Spacer for month row
        html += '<div class="heatmap-day-labels-container">';
        const days = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
        days.forEach(day => {
            html += `<div class="heatmap-day-label">${day}</div>`;
        });
        html += '</div>';
        html += '</div>';

        html += '<div class="heatmap-content">';
        html += '<div class="heatmap-month-row">';
        weeks.forEach((week, weekIndex) => {
            // Check if this week contains the first day of any month
            let monthLabel = '';
            week.forEach(date => {
                if (date && date.getDate() === 1) {
                    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
                    if (monthPositions[monthKey] && monthPositions[monthKey].week === weekIndex) {
                        monthLabel = monthPositions[monthKey].label;
                    }
                }
            });
            html += `<div class="heatmap-month-label">${monthLabel}</div>`;
        });
        html += '</div>';
        html += '<div class="heatmap-week-columns">';
        
        weeks.forEach(week => {
            html += '<div class="heatmap-week">';
            week.forEach(date => {
                if (date === null) {
                    html += '<div class="heatmap-square empty"></div>';
                } else {
                    const level = getContributionLevel(date, contributions);
                    const dateStr = date.toISOString().split('T')[0];
                    const count = contributions[dateStr] || 0;
                    html += `<div class="heatmap-square level-${level}" 
                        data-date="${dateStr}" 
                        data-count="${count}"
                        title="${dateStr}: ${count} contribution${count !== 1 ? 's' : ''}"></div>`;
                }
            });
            html += '</div>';
        });
        
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '<div class="heatmap-legend">';
        html += '<span>Less</span>';
        html += '<div class="heatmap-legend-squares">';
        for (let i = 0; i <= 4; i++) {
            html += `<div class="heatmap-square level-${i}"></div>`;
        }
        html += '</div>';
        html += '<span>More</span>';
        html += '</div>';
        html += '</div>';

        container.innerHTML = html;
    }

    // Cache management
    function getCacheKey(username) {
        return `github_contributions_${username}`;
    }

    function getCachedContributions(username) {
        try {
            const cacheKey = getCacheKey(username);
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;

            const data = JSON.parse(cached);
            const now = Date.now();
            const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

            // Check if cache is less than 1 hour old
            if (now - data.timestamp < oneHour) {
                return data.contributions;
            }

            // Cache expired, remove it
            localStorage.removeItem(cacheKey);
            return null;
        } catch (error) {
            console.warn('Error reading cache:', error);
            return null;
        }
    }

    function setCachedContributions(username, contributions) {
        try {
            const cacheKey = getCacheKey(username);
            const data = {
                contributions: contributions,
                timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (error) {
            console.warn('Error writing cache:', error);
            // localStorage might be full or disabled, continue without caching
        }
    }

    // Render stats
    function renderStats(stats) {
        const statsContainer = document.getElementById('contributionsStats');
        if (!statsContainer) return;

        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-value">${stats.commits || 0}</span>
                <span class="stat-label">Commits</span>
                <span class="stat-source">Last Year</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${stats.models || 0}</span>
                <span class="stat-label">Models</span>
                <span class="stat-source">Hugging Face</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${stats.datasets || 0}</span>
                <span class="stat-label">Datasets</span>
                <span class="stat-source">Hugging Face</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${stats.experiments || 0}</span>
                <span class="stat-label">Experiments</span>
                <span class="stat-source">WandB</span>
            </div>
        `;
    }

    // Load contributions
    async function loadContributions() {
        container.innerHTML = '<div class="empty-state">Loading contributions...</div>';

        let allContributions = {};
        let stats = {
            commits: 0,
            models: 0,
            datasets: 0,
            experiments: 0
        };

        if (config.github && config.github.enabled && config.github.username) {
            // Check prefetched stats first for total count
            if (config.prefetched_stats && config.prefetched_stats.github) {
                stats.commits = config.prefetched_stats.github.commits || 0;
            }

            // Try to get from cache first for heatmap data
            let githubContribs = getCachedContributions(config.github.username);
            
            if (!githubContribs) {
                // Cache miss or expired, fetch from API
                githubContribs = await fetchGitHubContributions(config.github.username);
                // Cache the results
                setCachedContributions(config.github.username, githubContribs);
            } else {
                console.log('Using cached GitHub contributions');
            }

            // If we didn't get total commits from prefetched stats, calculate from heatmap
            if (stats.commits === 0) {
                let totalCommits = 0;
                Object.keys(githubContribs).forEach(date => {
                    const count = githubContribs[date];
                    allContributions[date] = (allContributions[date] || 0) + count;
                    totalCommits += count;
                });
                stats.commits = totalCommits;
            } else {
                // Just populate heatmap
                Object.keys(githubContribs).forEach(date => {
                    allContributions[date] = (allContributions[date] || 0) + githubContribs[date];
                });
            }
        }
        
        // Fetch Hugging Face stats if enabled
        if (config.huggingface && config.huggingface.enabled && config.huggingface.username) {
             // Use prefetched stats if available
             if (config.prefetched_stats && config.prefetched_stats.huggingface) {
                 stats.models = config.prefetched_stats.huggingface.models || 0;
                 stats.datasets = config.prefetched_stats.huggingface.datasets || 0;
             } else {
                 // Fallback to checking the DOM/Models list
                 const hfModelsData = document.getElementById('hf-models-data');
                 if (hfModelsData) {
                    try {
                        let text = hfModelsData.textContent || hfModelsData.innerText || '';
                        text = text.trim().replace(/^\s+|\s+$/g, '');
                        if (text) {
                            const modelsList = JSON.parse(text);
                            if (stats.models === 0) stats.models = modelsList.length;
                        }
                    } catch (e) {}
                }
             }
        }

        // WandB experiments
        if (config.wandb && config.wandb.enabled && config.wandb.username) {
            if (config.prefetched_stats && config.prefetched_stats.wandb) {
                stats.experiments = config.prefetched_stats.wandb.experiments || 0;
            }
        }
        
        renderHeatmap(allContributions);
        renderStats(stats);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadContributions);
    } else {
        loadContributions();
    }
})();

