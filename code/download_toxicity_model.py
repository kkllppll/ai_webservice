from transformers import AutoTokenizer, AutoModelForSequenceClassification

model_name = "textdetox/xlmr-large-toxicity-classifier-v2"
tokenizer_name = "xlm-roberta-large"
save_dir = "app/models/toxicity_model"

# завантаження
tokenizer = AutoTokenizer.from_pretrained(tokenizer_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# збереження локально
tokenizer.save_pretrained(save_dir)
model.save_pretrained(save_dir)

print(f"Модель токсичності збережена у: {save_dir}")
