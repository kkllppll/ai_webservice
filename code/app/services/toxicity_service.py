from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F
from app.utils.text_chunker import chunk_text

MODEL_PATH = "app/models/toxicity_model"
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

labels = {0: "non-toxic", 1: "toxic"}

def detect_toxicity(text: str) -> dict:
    text = text.strip().replace("\n", " ")
    chunks = chunk_text(text, tokenizer)
    toxic_detected = False
    all_probs = []

    for chunk in chunks:
        inputs = tokenizer(chunk, return_tensors="pt", truncation=True)
        with torch.no_grad():
            outputs = model(**inputs)
            probs = F.softmax(outputs.logits, dim=1).squeeze()
            all_probs.append(probs)
            if torch.argmax(probs).item() == 1:
                toxic_detected = True

    avg_probs = torch.stack(all_probs).mean(dim=0)
    predicted = 1 if toxic_detected else 0

    return {
        "label": labels[predicted],
        "confidence": float(avg_probs[predicted]),
        "scores": {labels[i]: float(avg_probs[i]) for i in range(len(labels))}
    }
