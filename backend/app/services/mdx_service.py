"""
MDX parsing, extraction, and validation utility service.

Used to parse files containing YAML frontmatter and MDX content, automatically
populating database records and validating syntax.
"""

import re
from typing import Tuple, Dict, Any, List

def slugify(text: str) -> str:
    """
    Converts a string to a URL-friendly slug.
    Example: "Zero-Shot vs Few-Shot Prompting!" -> "zero-shot-vs-few-shot-prompting"
    """
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)  # Remove non-alphanumeric/spaces/hyphens
    text = re.sub(r'[-\s]+', '-', text)   # Replace spaces/hyphens with single hyphens
    return text.strip("-")

def parse_frontmatter(raw_text: str) -> Tuple[Dict[str, Any], str]:
    """
    Extracts YAML-like frontmatter enclosed by '---' from the top of an MDX text.
    Returns (metadata_dict, body_content).
    """
    metadata = {}
    body = raw_text.strip()
    
    if body.startswith("---"):
        # Split by the first two occurrences of '---'
        parts = body.split("---", 2)
        if len(parts) >= 3:
            frontmatter_text = parts[1]
            body = parts[2].strip()
            
            # Line by line key-value parsing
            for line in frontmatter_text.splitlines():
                line = line.strip()
                if not line or ":" not in line or line.startswith("#"):
                    continue
                
                key, val = line.split(":", 1)
                key = key.strip()
                val = val.strip()
                
                # Clean strings wrapped in single or double quotes
                if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                    val = val[1:-1]
                
                # Parse list structures like [tag1, tag2]
                if val.startswith("[") and val.endswith("]"):
                    val = [item.strip().strip('"').strip("'") for item in val[1:-1].split(",") if item.strip()]
                # Parse list structures by comma (fallback for tags)
                elif key == "tags" and "," in val:
                    val = [item.strip() for item in val.split(",") if item.strip()]
                elif key == "tags" and val:
                    val = [val]
                
                # Boolean conversion
                if val in ("true", "True", "TRUE"):
                    val = True
                elif val in ("false", "False", "FALSE"):
                    val = False
                
                metadata[key] = val
                
    return metadata, body

def validate_mdx_syntax(body: str) -> List[str]:
    """
    Checks the structural integrity of MDX content to ensure it is safe to serve.
    Detects unclosed code blocks and unclosed custom JSX/HTML tags.
    """
    errors = []
    
    # 1. Validate matching code blocks
    code_blocks = body.count("```")
    if code_blocks % 2 != 0:
        errors.append("Unclosed code block found (odd number of triple-backticks '```').")
        
    # 2. Validate matching custom JSX tags commonly used in our Next.js UI
    common_jsx_tags = ["<Card>", "<Accordion>", "<Steps>", "<Tabs>", "<InfoBox>"]
    for tag in common_jsx_tags:
        open_count = body.count(tag)
        close_tag = tag.replace("<", "</")
        close_count = body.count(close_tag)
        
        # Count tags that are self-closing (e.g. <Card />)
        self_closing = body.count(tag.replace(">", " />")) + body.count(tag.replace(">", "/>"))
        
        if (open_count - self_closing) != close_count:
            errors.append(
                f"Imbalanced JSX component: {tag} was opened {open_count} times "
                f"but closed {close_count} times."
            )
            
    return errors

def parse_mdx_article(raw_mdx: str) -> Dict[str, Any]:
    """
    Parses, cleans, and validates a raw MDX string for DB insertion.
    Generates metadata fallbacks and extracts excerpts if missing.
    """
    metadata, body = parse_frontmatter(raw_mdx)
    errors = validate_mdx_syntax(body)
    
    # Defaults and Slug Extraction
    title = metadata.get("title", "Untitled Article")
    slug = metadata.get("slug") or slugify(title)
    category = metadata.get("category", "fundamentals")
    difficulty = metadata.get("difficulty", "beginner")
    published = metadata.get("published", False)
    
    # Clean and validate tags list
    tags = metadata.get("tags", [])
    if isinstance(tags, str):
        tags = [tags]
    tags = [tag.strip() for tag in tags if tag.strip()]
    
    # Excerpt Generation if omitted
    excerpt = metadata.get("excerpt", "")
    if not excerpt and len(body) > 0:
        # Strip out headers and Markdown links to get plain text
        clean_text = re.sub(r'#+\s+.*', '', body)
        clean_text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', clean_text)
        clean_text = re.sub(r'[*_`]', '', clean_text)
        excerpt = clean_text.strip()[:150].strip()
        if len(clean_text) > 150:
            excerpt += "..."
            
    return {
        "title": title,
        "slug": slug,
        "category": category,
        "difficulty": difficulty,
        "tags": tags,
        "excerpt": excerpt,
        "content": body,
        "published": published,
        "is_valid": len(errors) == 0,
        "errors": errors
    }
