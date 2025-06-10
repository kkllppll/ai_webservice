from app import create_app

print("Creating app...")  # DEBUG
app = create_app()
print("App created.")    # DEBUG

if __name__ == "__main__":
    print("Starting server...")  # DEBUG
    app.run(host="127.0.0.1", port=5000, debug=True, use_reloader=False)
