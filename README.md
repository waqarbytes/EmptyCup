# Designer Listings Flask App

This is a simple Flask web application to manage designer listings with CRUD functionality, filtering, and a Bootstrap-styled frontend.

---

## 🧰 Features

- Add new designer entries
- Edit existing entries
- Delete designers
- Search/filter by name, rating, or price
- REST API + HTML frontend

---

## 🚀 Deployment on Render

### 🔧 Prerequisites

- Python 3.x installed
- GitHub account
- Render.com account

---

### 📁 Project Structure

```
your-app/
├── app.py
├── requirements.txt
├── render.yaml
├── templates/
│   └── index.html
└── static/
```

---

### 🔌 Local Setup Instructions

1. **Clone the repo**:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the app**:
   ```bash
   flask run
   ```

5. Open browser at: [http://localhost:5000](http://localhost:5000)

---

### 🌐 Deploy to Render

1. Push the project to GitHub
2. Go to [https://render.com](https://render.com)
3. Click “New Web Service”
4. Select your repo and deploy
5. Render uses `render.yaml` to auto-start the app

---

### 📦 API Endpoints

- `GET /designers`
- `POST /designers`
- `PUT /designers/<id>`
- `DELETE /designers/<id>`
- `GET /designers/search?q=...`

---

### ✨ Credits

Built with Flask & Bootstrap.
