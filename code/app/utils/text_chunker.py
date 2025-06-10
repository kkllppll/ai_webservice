from transformers import PreTrainedTokenizer
from typing import List

def chunk_text(text: str, tokenizer: PreTrainedTokenizer, max_tokens: int = 480) -> List[str]:
    words = text.strip().split()
    chunks = []
    current_chunk = []

    for word in words:
        current_chunk.append(word)
        tokens = tokenizer(" ".join(current_chunk), truncation=False, add_special_tokens=False)["input_ids"]
        if len(tokens) > max_tokens:
            current_chunk.pop()
            chunks.append(" ".join(current_chunk))
            current_chunk = [word]

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks
