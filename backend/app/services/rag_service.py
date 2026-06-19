from typing import Optional
import json
import httpx
from app.core.config import settings

def retrieve_relevant_context(query: str, limit: int = 2) -> str:
    """
    Search articles for relevant snippets matching query terms.
    """
    from app.services.article_service import get_all_articles
    articles_data = get_all_articles()
    articles = articles_data.get("articles", [])
    
    scored_articles = []
    query_words = set(query.lower().split())
    
    for art in articles:
        score = 0
        title = art.get("title", "").lower()
        content = art.get("content", "").lower()
        tags = [t.lower() for t in art.get("tags", [])]
        
        for word in query_words:
            if word in title:
                score += 10
            if word in tags:
                score += 5
            if word in content:
                score += content.count(word)
                
        if score > 0:
            scored_articles.append((score, art))
            
    scored_articles.sort(key=lambda x: x[0], reverse=True)
    
    context_parts = []
    for score, art in scored_articles[:limit]:
        context_parts.append(
            f"Article Title: {art['title']}\n"
            f"Content:\n{art['content']}"
        )
        
    return "\n\n---\n\n".join(context_parts)


async def query_rag_pipeline(query: str) -> dict:
    """
    Answer query using retrieved context and OpenRouter.
    """
    context = retrieve_relevant_context(query)
    has_source = bool(context)
    
    if not context:
        context = "No specific article matched your query. Please answer using your general knowledge."
        
    system_prompt = (
        "You are Prompt Diary's AI Q&A Assistant. Your task is to answer user queries using the provided articles context.\n"
        "Be helpful, technical, and refer directly to concepts from the context. If the context is not sufficient, answer using your general knowledge, but note that it is outside Prompt Diary's database.\n\n"
        f"Context:\n{context}"
    )
    
    if getattr(settings, "OPENROUTER_API_KEY", None):
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Prompt Diary",
        }
        payload = {
            "model": "liquid/lfm-2.5-1.2b-instruct:free",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query}
            ],
            "temperature": 0.3,
        }
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                choices = response.json().get("choices", [])
                if choices:
                    answer = choices[0].get("message", {}).get("content", "").strip()
                    return {"answer": answer, "sourced": has_source}
        except Exception as e:
            print(f"RAG OpenRouter call failed: {e}")
            
    return {
        "answer": f"No OpenRouter key configured. Simulating RAG response. Based on our articles, you asked about: '{query}'. Context retrieved: {has_source}",
        "sourced": has_source
    }
