// Hugging Face API integration for Open Source section
(function() {
    // Hugging Face API base URL
    const HF_API_BASE = 'https://huggingface.co/api';

    // Fetch model/dataset data from Hugging Face API
    async function fetchHFModel(modelId) {
        try {
            // Check cache first
            const cached = getCachedModel(modelId);
            if (cached) {
                return cached;
            }

            // Try fetching as model first
            let response = await fetch(`${HF_API_BASE}/models/${modelId}`);
            let type = 'model';
            
            if (!response.ok) {
                // If not found as model, try dataset
                response = await fetch(`${HF_API_BASE}/datasets/${modelId}`);
                type = 'dataset';
                
                if (!response.ok) {
                     console.warn(`Hugging Face model/dataset not found: ${modelId}`);
                     return null;
                }
            }

            const data = await response.json();
            
            const modelData = {
                id: data.id,
                name: data.id.split('/').pop(), // Get the name part after slash
                fullName: data.id,
                type: type,
                description: type === 'model' ? (data.pipeline_tag || 'Model') : 'Dataset',
                likes: data.likes,
                downloads: data.downloads,
                url: `https://huggingface.co/${type === 'dataset' ? 'datasets/' : ''}${data.id}`,
                lastModified: data.lastModified
            };

            // Cache the result
            setCachedModel(modelId, modelData);
            
            return modelData;
        } catch (error) {
            console.error(`Error fetching Hugging Face data for ${modelId}:`, error);
            return null;
        }
    }

    // Cache management
    function getCacheKey(modelId) {
        return `hf_model_${modelId.replace('/', '_')}`;
    }

    function getCachedModel(modelId) {
        try {
            const cacheKey = getCacheKey(modelId);
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;

            const data = JSON.parse(cached);
            const now = Date.now();
            const oneHour = 60 * 60 * 1000;

            if (now - data.timestamp < oneHour) {
                return data.modelData;
            }

            localStorage.removeItem(cacheKey);
            return null;
        } catch (error) {
            return null;
        }
    }

    function setCachedModel(modelId, modelData) {
        try {
            const cacheKey = getCacheKey(modelId);
            const data = {
                modelData: modelData,
                timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (error) {
            // Ignore storage errors
        }
    }

    // Create card HTML
    function createHFCard(project) {
        if (!project) return '';
        
        const icon = project.type === 'dataset' 
            ? '<svg class="opensource-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.22-7.52-3.22 7.52 3.22z"/></svg>' // Placeholder icon
            : '<svg class="opensource-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19.56 11.32c.37-1.13.2-2.43-.56-3.41-.77-1-1.97-1.51-3.19-1.39l-1.2.12c-.31.03-.58.19-.76.44-.18.25-.24.56-.17.86l.29 1.3c.18.81-.33 1.63-1.14 1.81-.81.18-1.63-.33-1.81-1.14l-.29-1.3c-.18-.81.33-1.63 1.14-1.81.18-.04.35-.05.52-.03l1.2-.12c2.44-.24 4.84.78 6.38 2.78 1.54 2 1.89 4.61.97 6.88-.92 2.27-3.11 3.75-5.55 3.75h-1.3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5h1.3c1.22 0 2.32-.74 2.78-1.88zM5 12a1 1 0 0 0 1 1h1a1 1 0 0 0 0-2H6a1 1 0 0 0-1 1zm0 4a1 1 0 0 0 1 1h1a1 1 0 0 0 0-2H6a1 1 0 0 0-1 1z"/></svg>'; // Placeholder icon (emoji-like) - replaced with better SVGs below

        // Hugging Face Icon (simulated)
        const hfIcon = `<svg class="opensource-icon" viewBox="0 0 24 24" fill="currentColor" style="color: #FFD21E;">
            <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm2 0c0 4.41 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8-8 3.59-8 8z"/>
            <path d="M8 14h8v2H8zm2-5h1.5v3H10zm4.5 0H16v3h-1.5z"/>
        </svg>`;

        return `
            <div class="opensource-card slide-in">
                <div class="opensource-card-header">
                    <div class="opensource-card-title-section">
                        ${hfIcon}
                        <a href="${project.url}" class="opensource-card-name" target="_blank">${project.fullName}</a>
                    </div>
                </div>
                <div class="opensource-card-description">${project.description}</div>
                <div class="opensource-card-footer">
                     <div class="opensource-language">
                        <span class="opensource-language-dot" style="background-color: ${project.type === 'model' ? '#FFD21E' : '#4F46E5'}"></span>
                        <span>${project.type === 'model' ? 'Model' : 'Dataset'}</span>
                    </div>
                    ${project.likes > 0 ? `
                        <div class="opensource-stats">
                            <svg class="opensource-star-icon" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            <span>${project.likes}</span>
                        </div>
                    ` : ''}
                    ${project.downloads > 0 ? `
                         <div class="opensource-stats">
                            <svg class="opensource-fork-icon" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                            </svg>
                            <span>${project.downloads}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Load Hugging Face models
    async function loadHFModels() {
        const container = document.getElementById('hfContainer');
        if (!container) return;

        const dataElement = document.getElementById('hf-models-data');
        let models = [];
        
        if (dataElement) {
            try {
                let text = dataElement.textContent || dataElement.innerText || '';
                text = text.trim().replace(/^\s+|\s+$/g, '');
                if (text) {
                    models = JSON.parse(text);
                }
            } catch (e) {
                console.error('Error parsing HF models data:', e);
                container.innerHTML = `<div class="card"><div class="update-content empty-state">Error parsing configuration.</div></div>`;
                return;
            }
        }

        if (models.length === 0) {
            // Keep the default message from HTML if empty
            return;
        }

        container.innerHTML = `
            <div class="card">
                <div class="update-content empty-state">
                    Loading Hugging Face models...
                </div>
            </div>
        `;

        try {
            const projects = await Promise.all(models.map(id => fetchHFModel(id)));
            const validProjects = projects.filter(p => p !== null);

            if (validProjects.length === 0) {
                container.innerHTML = `
                    <div class="card">
                        <div class="update-content empty-state">
                            Failed to load Hugging Face models.
                        </div>
                    </div>
                `;
                return;
            }

            container.innerHTML = validProjects.map(createHFCard).join('');
        } catch (error) {
            console.error('Error loading HF models:', error);
            container.innerHTML = `
                <div class="card">
                    <div class="update-content empty-state">
                        Error loading Hugging Face models.
                    </div>
                </div>
            `;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadHFModels);
    } else {
        loadHFModels();
    }
})();


