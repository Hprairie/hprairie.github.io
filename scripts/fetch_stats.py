import os
import json
import requests
import yaml
from datetime import datetime

def fetch_hf_stats(username, token=None):
    """Fetch Hugging Face stats for a user."""
    if not username:
        return {"models": 0, "datasets": 0, "likes": 0}
    
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    stats = {"models": 0, "datasets": 0, "likes": 0}
    
    try:
        # Fetch models
        params = {"author": username, "limit": 100}
        response = requests.get("https://huggingface.co/api/models", params=params, headers=headers)
        if response.status_code == 200:
            models = response.json()
            stats["models"] = len(models)
            stats["likes"] += sum(m.get("likes", 0) for m in models)
            
        # Fetch datasets
        response = requests.get("https://huggingface.co/api/datasets", params=params, headers=headers)
        if response.status_code == 200:
            datasets = response.json()
            stats["datasets"] = len(datasets)
            stats["likes"] += sum(d.get("likes", 0) for d in datasets)
            
    except Exception as e:
        print(f"Error fetching HF stats: {e}")
        
    return stats

def fetch_github_stats(username, token=None):
    """Fetch GitHub stats (exact contributions in last year)."""
    if not username or not token:
        return {"commits": 0}
        
    query = """
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
    """
    
    try:
        response = requests.post(
            "https://api.github.com/graphql",
            json={"query": query, "variables": {"username": username}},
            headers={"Authorization": f"bearer {token}"}
        )
        if response.status_code == 200:
            data = response.json()
            if "data" in data and "user" in data["data"]:
                total = data["data"]["user"]["contributionsCollection"]["contributionCalendar"]["totalContributions"]
                return {"commits": total}
    except Exception as e:
        print(f"Error fetching GitHub stats: {e}")
        
    return {"commits": 0}

def fetch_wandb_stats(username, token=None):
    """Fetch WandB stats (total runs/experiments)."""
    if not username or not token:
        return {"experiments": 0}
    
    query = """
    query UserStats($entity: String!) {
        user(name: $entity) {
            projects {
                edges {
                    node {
                        runCount
                    }
                }
            }
        }
    }
    """
    
    try:
        response = requests.post(
            "https://api.wandb.ai/graphql",
            json={"query": query, "variables": {"entity": username}},
            auth=("api", token)
        )
        if response.status_code == 200:
            data = response.json()
            total_runs = 0
            if "data" in data and "user" in data["data"] and data["data"]["user"]:
                projects = data["data"]["user"]["projects"]["edges"]
                for edge in projects:
                    total_runs += edge["node"]["runCount"]
            return {"experiments": total_runs}
    except Exception as e:
        print(f"Error fetching WandB stats: {e}")
        
    return {"experiments": 0}

def main():
    # Load configuration
    config_path = "_data/contributions.yml"
    if not os.path.exists(config_path):
        print("Config file not found.")
        return

    with open(config_path, "r") as f:
        config = yaml.safe_load(f)
        
    hf_username = config.get("huggingface", {}).get("username")
    github_username = config.get("github", {}).get("username")
    wandb_username = config.get("wandb", {}).get("username")
    
    # Get tokens from environment
    hf_token = os.environ.get("HF_TOKEN")
    github_token = os.environ.get("GITHUB_TOKEN")
    wandb_key = os.environ.get("WANDB_API_KEY")
    
    # Fetch stats
    print(f"Fetching stats for {github_username}, {hf_username}, {wandb_username}...")
    
    hf_stats = fetch_hf_stats(hf_username, hf_token)
    print(f"HF Stats: {hf_stats}")
    
    github_stats = fetch_github_stats(github_username, github_token)
    print(f"GitHub Stats: {github_stats}")
    
    wandb_stats = fetch_wandb_stats(wandb_username, wandb_key)
    print(f"WandB Stats: {wandb_stats}")
    
    # Prepare output
    output = {
        "huggingface": hf_stats,
        "github": github_stats,
        "wandb": wandb_stats,
        "last_updated": datetime.now().isoformat()
    }
    
    # Save to _data/stats.json
    with open("_data/stats.json", "w") as f:
        json.dump(output, f, indent=2)
    
    print("Stats updated successfully.")

if __name__ == "__main__":
    main()
