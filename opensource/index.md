---
layout: full-width
title: Open-Source
---

<div class="container">
    <!-- Contributions Section -->
    <section id="contributions" class="section fade-in">
        <h2>Contributions</h2>
        <div class="contribution-heatmap-section">
            <script type="application/json" id="contributions-config">
            {
                "github": {
                    "username": "{{ site.data.contributions.github.username }}",
                    "enabled": {{ site.data.contributions.github.enabled }}
                },
                "huggingface": {
                    "username": "{{ site.data.contributions.huggingface.username }}",
                    "enabled": {{ site.data.contributions.huggingface.enabled }}
                },
                "wandb": {
                    "username": "{{ site.data.contributions.wandb.username }}",
                    "enabled": {{ site.data.contributions.wandb.enabled }}
                },
                "prefetched_stats": {{ site.data.stats | jsonify }}
            }
            </script>
            <div id="contributionsHeatmap"></div>
            <div id="contributionsStats" class="contributions-stats-grid">
                <!-- Stats will be injected here by JS -->
            </div>
        </div>
    </section>

    <!-- GitHub Repositories Section -->
    <section id="github-repos" class="section fade-in">
        <h2>GitHub Repositories</h2>
        <script type="application/json" id="repos-data">
        [
            {% for repo in site.data.opensource_repos.repositories %}
            "{{ repo }}"{% unless forloop.last %},{% endunless %}
            {% endfor %}
        ]
        </script>
        <div id="opensourceContainer" class="opensource-grid">
            <div class="card">
                <div class="update-content empty-state">
                    Loading GitHub projects...
                </div>
            </div>
        </div>
    </section>

    <!-- Hugging Face Section -->
    <section id="huggingface-models" class="section fade-in">
        <h2>Hugging Face Models & Datasets</h2>
        <script type="application/json" id="hf-models-data">
        [
            {% if site.data.opensource_repos.huggingface_models %}
                {% for model in site.data.opensource_repos.huggingface_models %}
                "{{ model }}"{% unless forloop.last %},{% endunless %}
                {% endfor %}
            {% endif %}
        ]
        </script>
        <div id="hfContainer" class="opensource-grid">
            <div class="card">
                <div class="update-content empty-state">
                    {% if site.data.opensource_repos.huggingface_models %}
                    Loading Hugging Face models...
                    {% else %}
                    No Hugging Face models configured. Add to _data/opensource_repos.yml
                    {% endif %}
                </div>
            </div>
        </div>
    </section>
</div>
