def get_preview_text(text: str, max_chars: int = 200) -> str:
    if not text:
        return ""
    first_sentence = text.strip().split('.')[0]
    if len(first_sentence) > max_chars:
        return first_sentence[:max_chars] + '...'
    return first_sentence
