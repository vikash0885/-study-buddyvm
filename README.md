# 🎓 StudyBuddy AI

StudyBuddy AI is a powerful, AI-driven learning assistant built with Python and Flask. It leverages the **Google Gemini API** to help students simplify complex topics, summarize notes, generate quizzes, and create flashcards.

## 🚀 Features

- **Explain Topic**: Get simple, student-friendly explanations with analogies.
- **Notes Summarizer**: Convert long, boring notes into concise bullet points.
- **Quiz Generator**: Instantly generate MCQ quizzes to test your knowledge.
- **Flashcard Generator**: Create interactive digital flashcards for quick revision.
- **Premium UI**: Modern, responsive design with glassmorphism and smooth animations.

## 🛠 Tech Stack

- **Backend**: Python (Flask)
- **Frontend**: HTML5, CSS3, JavaScript
- **AI Engine**: Google Gemini Pro (1.5 Flash)
- **Configuration**: Dotenv for secure environment variables

## 📋 Prerequisites

- Python 3.8 or higher
- A Google Gemini API Key (Get one from [Google AI Studio](https://aistudio.google.com/))

## ⚙️ Installation & Setup

1. **Clone the project** or navigate to the project directory.

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   - Create a `.env` file in the root directory (one has been provided as a template).
   - Add your Gemini API Key:
     ```env
     GEMINI_API_KEY=your_actual_api_key_here
     ```

4. **Run the Application**:
   ```bash
   python app.py
   ```

5. **Access the App**:
   Open your browser and go to `http://127.0.0.1:5000`

## 📁 Project Structure

```
AI-Study-Buddy/
├── app.py              # Main Flask server
├── .env                # Environment variables (API Keys)
├── requirements.txt    # Python dependencies
├── templates/
│   └── index.html      # Main frontend structure
├── static/
│   ├── style.css       # Premium styling
│   └── script.js       # Frontend interactivity
└── README.md           # Documentation
```

## 🔒 Security

- Your API key is stored in the `.env` file and is never hardcoded.
- Ensure you do not commit your `.env` file to public repositories (like GitHub).

---
Developed with ❤️ by **Antigravity AI**
