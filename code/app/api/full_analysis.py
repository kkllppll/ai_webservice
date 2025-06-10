from flask import Blueprint, request, jsonify, g
from app.utils.auth_decorator import auth_required
from app.services.sentiment_service import analyze_sentiment
from app.services.topic_service import classify_topic
from app.services.toxicity_service import detect_toxicity
from app.services.firebase_service import save_analysis
from app.utils.text_utils import get_preview_text
from app.services.openai_service import generate_summary  

full_analysis_bp = Blueprint('full_analysis', __name__)

@full_analysis_bp.route('/full-analysis', methods=['POST'])
@auth_required
def full_analysis():
    data = request.get_json() or {}
    user_id = g.user.get("uid")
    input_text = data.get("text", "").strip()
    language = data.get("language", "uk")

    if not input_text:
        return jsonify({"error": "Empty text"}), 400

    try:
        sentiment = analyze_sentiment(input_text)
        topics = classify_topic(input_text)
        toxicity = detect_toxicity(input_text)
        summary = generate_summary(input_text)
        preview = get_preview_text(input_text)

        results = {
            "sentiment": sentiment,
            "topics": topics,
            "toxicity": toxicity
        }

        payload = {
            "preview_text": preview,
            "summary": summary,
            "input_text": input_text,
            "language": language,
            "results": results
        }

        save_analysis(user_id, payload)

        return jsonify(payload), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
