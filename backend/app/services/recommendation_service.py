from typing import List, Dict, Any
from app.services.article_service import get_all_articles
from app.services.marketplace_service import get_all_marketplace_prompts

def get_related_articles(article_id_or_slug: str, limit: int = 3) -> List[Dict[str, Any]]:
    """
    Get articles related to the given article by comparing tag overlap and categories.
    """
    articles_data = get_all_articles()
    articles = articles_data.get("articles", [])
    
    # Find the target article
    target_article = None
    for a in articles:
        if a.get("id") == article_id_or_slug or a.get("slug") == article_id_or_slug:
            target_article = a
            break
            
    if not target_article:
        return []
        
    target_tags = set([t.lower() for t in target_article.get("tags", [])])
    target_category = target_article.get("category", "")
    target_id = target_article.get("id")
    
    scored_articles = []
    for a in articles:
        if a.get("id") == target_id:
            continue
            
        score = 0
        # Category match
        if a.get("category") == target_category:
            score += 3
            
        # Tag overlap
        a_tags = set([t.lower() for t in a.get("tags", [])])
        overlap = len(target_tags.intersection(a_tags))
        score += overlap * 2
        
        if score > 0:
            scored_articles.append((score, a))
            
    # Sort by score descending
    scored_articles.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in scored_articles[:limit]]


def get_recommended_templates_for_article(article_id_or_slug: str, limit: int = 3) -> List[Dict[str, Any]]:
    """
    Get prompt templates related to the given article by matching tags/keywords.
    """
    articles_data = get_all_articles()
    articles = articles_data.get("articles", [])
    
    target_article = None
    for a in articles:
        if a.get("id") == article_id_or_slug or a.get("slug") == article_id_or_slug:
            target_article = a
            break
            
    if not target_article:
        return []
        
    target_tags = set([t.lower() for t in target_article.get("tags", [])])
    
    prompts_data = get_all_marketplace_prompts()
    # prompts_data is either a dict or list depending on implementation. Let's handle both.
    prompts = []
    if isinstance(prompts_data, dict):
        prompts = prompts_data.get("prompts", [])
    elif isinstance(prompts_data, list):
        prompts = prompts_data
        
    scored_prompts = []
    for p in prompts:
        score = 0
        p_tags = set([t.lower() for t in p.get("tags", [])])
        overlap = len(target_tags.intersection(p_tags))
        score += overlap * 3
        
        # Check text match in title/description
        title_lower = p.get("title", "").lower()
        description_lower = p.get("description", "").lower()
        for tag in target_tags:
            if tag in title_lower:
                score += 2
            if tag in description_lower:
                score += 1
                
        if score > 0:
            scored_prompts.append((score, p))
            
    scored_prompts.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in scored_prompts[:limit]]
