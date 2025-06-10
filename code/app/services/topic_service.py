from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from app.utils.text_chunker import chunk_text

MODEL_PATH = "app/models/topic_model"
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

label_list = [
    'arts_&_culture', 'business_&_entrepreneurs', 'celebrity_&_pop_culture',
    'diaries_&_daily_life', 'family', 'fashion_&_style', 'film_tv_&_video',
    'fitness_&_health', 'food_&_dining', 'gaming', 'learning_&_educational',
    'music', 'news_&_social_concern', 'other_hobbies', 'relationships',
    'science_&_technology', 'sports', 'travel_&_adventure', 'youth_&_student_life'
]

ukr_topic_labels = {
    "arts_&_culture": "Мистецтво та культура",
    "business_&_entrepreneurs": "Бізнес і підприємництво",
    "celebrity_&_pop_culture": "Знаменитості та поп-культура",
    "diaries_&_daily_life": "Щоденники та повсякденне життя",
    "family": "Сім'я",
    "fashion_&_style": "Мода та стиль",
    "film_tv_&_video": "Фільми, телебачення та відео",
    "fitness_&_health": "Фітнес і здоров'я",
    "food_&_dining": "Їжа та харчування",
    "gaming": "Ігри",
    "learning_&_educational": "Освіта та навчання",
    "music": "Музика",
    "news_&_social_concern": "Новини та соціальні проблеми",
    "other_hobbies": "Інші хобі",
    "relationships": "Стосунки",
    "science_&_technology": "Наука і технології",
    "sports": "Спорт",
    "travel_&_adventure": "Подорожі та пригоди",
    "youth_&_student_life": "Студентське життя та молодь"
}

def classify_topic(text):
    if not isinstance(text, str) or not text.strip():
        return ["INVALID_INPUT"]

    try:
        chunks = chunk_text(text, tokenizer)
        all_probs = []

        for chunk in chunks:
            inputs = tokenizer(chunk, return_tensors="pt", truncation=True, padding=True, max_length=512)
            with torch.no_grad():
                outputs = model(**inputs)
                probs = torch.softmax(outputs.logits, dim=1)
                all_probs.append(probs.squeeze())

        avg_probs = torch.stack(all_probs).mean(dim=0)
        top_indices = torch.topk(avg_probs, k=3).indices.tolist()
        top_labels = [label_list[i] for i in top_indices]
        return [ukr_topic_labels.get(label, label) for label in top_labels]

    except Exception as e:
        print("classify_topic ERROR:", str(e))
        return ["ERROR"]
