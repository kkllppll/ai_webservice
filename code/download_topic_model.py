from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_NAME = "cardiffnlp/tweet-topic-21-multi"
TARGET_DIR = "app/models/topic_model"

print(f"⬇Downloading model: {MODEL_NAME}")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

print(f"Saving model to: {TARGET_DIR}")
tokenizer.save_pretrained(TARGET_DIR)
model.save_pretrained(TARGET_DIR)

print("Done. You can now run your Flask app.")
