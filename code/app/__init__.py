from flask import Flask
import os

def create_app():
    app = Flask(__name__,
                static_folder=os.path.join('..', 'frontend', 'static'),
                template_folder=os.path.join('..', 'frontend', 'templates'),
                instance_relative_config=True)
    

    # шлях до instance/config.py
    app.config.from_pyfile('config.py', silent=True)

    # реєстрація API-блюпрінт
    from .api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    from app.api.full_analysis import full_analysis_bp
    app.register_blueprint(full_analysis_bp, url_prefix="/api")

    # головна сторінка
    from flask import render_template

    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/login')
    def login():
        return render_template('login.html')

    @app.route('/analyze')
    def analyze():
        return render_template('analyze.html')

    @app.route('/account')
    def account():
        return render_template('account.html')

    @app.route("/history")
    def history_page():
        return render_template("history.html")

    return app

