from transformers import AutoTokenizer, AutoModelForSequenceClassification

model_name = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
tokenizer_name = "xlm-roberta-base"  

save_dir = "app/models/sentiment_model"

# завантаження токенізатора окремо
tokenizer = AutoTokenizer.from_pretrained(tokenizer_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# збереження
tokenizer.save_pretrained(save_dir)
model.save_pretrained(save_dir)

print(f"Модель збережено локально в: {save_dir}")
