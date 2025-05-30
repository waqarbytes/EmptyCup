from flask import Flask

app = Flask(__name__)

@app.before_first_request
def setup():
    print("Before first request hook works!")

@app.route("/")
def home():
    return "Hello"

if __name__ == "__main__":
    app.run(debug=True)
