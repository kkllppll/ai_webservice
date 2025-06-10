from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F
from app.utils.text_chunker import chunk_text

MODEL_PATH = "app/models/sentiment_model"
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

label_map = {0: "negative", 1: "neutral", 2: "positive"}

def analyze_sentiment(text: str) -> dict:
    text = text.replace('\n', ' ').strip()
    chunks = chunk_text(text, tokenizer)
    scores = []

    for chunk in chunks:
        inputs = tokenizer(chunk, return_tensors="pt", truncation=True)
        with torch.no_grad():
            outputs = model(**inputs)
            probs = F.softmax(outputs.logits, dim=1).squeeze()
        scores.append(probs)

    avg_probs = torch.stack(scores).mean(dim=0)
    predicted_label = torch.argmax(avg_probs).item()

    return {
        "label": label_map[predicted_label],
        "scores": {label_map[i]: float(avg_probs[i]) for i in range(len(label_map))}
    }
