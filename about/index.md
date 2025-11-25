---
layout: full-width
title: About
nav_exclude: true
---

<div class="container">
    <!-- About Section -->
    <section id="about" class="section fade-in">
        <div class="profile-section">
            {% if site.data.profile.profile_image %}
            <img src="{{ site.data.profile.profile_image | prepend: site.baseurl }}" alt="Profile" class="profile-image">
            {% endif %}
            
            <div class="profile-info">
                <h1>{{ site.data.profile.name }}</h1>
                <div class="title">{{ site.data.profile.title }}</div>
                <p>{{ site.data.profile.bio | markdownify }}</p>
                <p>{{ site.data.profile.research | markdownify }}</p>
                <p>{{ site.data.profile.work | markdownify }}</p>
            </div>
        </div>

        <div class="social-links">
            {% for link in site.data.social %}
            <a href="{% if link.isExternal %}{{ link.url }}{% else %}{{ link.url | prepend: site.baseurl }}{% endif %}" 
               class="social-link" 
               {% if link.isExternal %}target="_blank"{% endif %}
               title="{{ link.description }}">
                <span class="svg-icon {{ link.iconClass }}"></span> {{ link.name }}
            </a>
            {% endfor %}
        </div>
    </section>

    <!-- Updates Section -->
    <section id="updates" class="section fade-in">
        <h2>Updates</h2>
        <div id="updatesContainer">
            {% assign sorted_updates = site.data.updates | sort: 'date' | reverse %}
            {% if sorted_updates.size > 0 %}
                {% for update in sorted_updates limit: 10 %}
                <div class="card slide-in">
                    <div class="update-item">
                        <div class="update-date">{{ update.date | date: "%b %Y" }}</div>
                        <div class="update-content">{{ update.content }}</div>
                    </div>
                </div>
                {% endfor %}
            {% else %}
                <div class="card">
                    <div class="update-content empty-state">
                        No updates available yet.
                    </div>
                </div>
            {% endif %}
        </div>
    </section>

    <!-- Publications Section -->
    <section id="publications" class="section fade-in">
        <h2>Publications</h2>
        <div id="publicationsContainer">
            {% assign sorted_pubs = site.data.publications | sort: 'year' | reverse %}
            {% if sorted_pubs.size > 0 %}
                {% for pub in sorted_pubs %}
                <div class="card slide-in">
                    <div class="paper-title">{{ pub.title }}</div>
                    <div class="paper-authors">{{ pub.authors }}</div>
                    <div class="paper-authors">{{ pub.venue }}</div>
                    <div class="paper-description">{{ pub.description }}</div>
                    {% if pub.links %}
                    <div class="paper-links">
                        {% for link in pub.links %}
                        <a href="{{ link.url }}" class="paper-link" target="_blank">{{ link.name }}</a>
                        {% endfor %}
                    </div>
                    {% endif %}
                </div>
                {% endfor %}
            {% else %}
                <div class="card">
                    <div class="update-content empty-state">
                        No publications available yet.
                    </div>
                </div>
            {% endif %}
        </div>
    </section>

    <!-- Open Source Section -->
    <section id="opensource" class="section fade-in">
        <h2>Open Source</h2>
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
                    Loading open source projects...
                </div>
            </div>
        </div>
        
        <!-- Contribution Heatmap -->
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
                }
            }
            </script>
            <div id="contributionsHeatmap"></div>
        </div>
    </section>

    <!-- Blog Section -->
    <section id="blog" class="section fade-in">
        <h2>Blog Posts</h2>
        <div id="blogContainer">
            {% assign sorted_posts = site.posts | sort: 'date' | reverse %}
            {% if sorted_posts.size > 0 %}
                {% for post in sorted_posts limit: 5 %}
                <div class="card slide-in">
                    <a href="{{ post.url | prepend: site.baseurl }}" class="blog-title-link">{{ post.title }}</a>
                    <div class="blog-date">{{ post.date | date: "%B %-d, %Y" }}</div>
                    <div class="blog-excerpt">{{ post.excerpt | strip_html | truncatewords: 30 }}</div>
                </div>
                {% endfor %}
            {% else %}
                <div class="card">
                    <div class="update-content empty-state">
                        No blog posts available yet.
                    </div>
                </div>
            {% endif %}
        </div>
    </section>
</div>
