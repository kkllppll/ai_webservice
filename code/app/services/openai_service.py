import os
from openai import OpenAI
from dotenv import load_dotenv

os.environ.pop("HTTP_PROXY", None)
os.environ.pop("HTTPS_PROXY", None)
os.environ.pop("proxies", None)

load_dotenv()

#  OpenAI клієнт
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_summary(text: str, model="gpt-3.5-turbo") -> str:
    prompt = f"Сформуй коротке, чітке та змістовне резюме для наступного тексту українською мовою:\n\n{text}"

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "Ти — асистент, який створює стислі та точні резюме текстів."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.5,
        max_tokens=300
    )

    return response.choices[0].message.content.strip()
