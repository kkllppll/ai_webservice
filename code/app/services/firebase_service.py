import firebase_admin
from firebase_admin import credentials, auth, firestore
import os
from datetime import datetime
from firebase_admin import firestore
from google.cloud.firestore import SERVER_TIMESTAMP

# ініціалізація тільки один раз
if not firebase_admin._apps:
    cred = credentials.Certificate("instance/nlp-project-ai-firebase-adminsdk-fbsvc-bf5453db79.json")  #  service account JSON
    firebase_admin.initialize_app(cred)

# токен перевірки
def verify_id_token(id_token):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print("Token verification failed:", e)
        return None

# firestore клієнт
db = firestore.client()

#  збереження аналізу
def save_analysis(user_id, analysis_data):
    doc_ref = db.collection("users").document(user_id).collection("analyses").document()
    doc_ref.set({
        "timestamp": firestore.SERVER_TIMESTAMP,
        **analysis_data
    })

def get_analyses(user_id):
    docs = db.collection("users").document(user_id).collection("analyses")\
        .order_by("timestamp", direction=firestore.Query.DESCENDING).stream()

    return [{**doc.to_dict(), "id": doc.id} for doc in docs]



def delete_user_analyses(user_id):
    analysis_ref = db.collection("users").document(user_id).collection("analyses")
    docs = analysis_ref.stream()

    for doc in docs:
        doc.reference.delete()


        
def delete_analysis(user_id, analysis_id):
    try:
        doc_ref = db.collection("analyses").document(analysis_id)
        doc = doc_ref.get()

        if doc.exists and doc.to_dict().get("user_id") == user_id:
            doc_ref.delete()
            return True
        return False
    except Exception as e:
        print(f"Помилка при видаленні аналізу: {e}")
        return False
    

def delete_user_analysis_by_id(user_id, analysis_id):
    try:
        doc_ref = db.collection("users").document(user_id).collection("analyses").document(analysis_id)
        doc = doc_ref.get()

        if doc.exists:
            doc_ref.delete()
            return True
        return False
    except Exception as e:
        print(f"Помилка при видаленні аналізу користувача: {e}")
        return False
