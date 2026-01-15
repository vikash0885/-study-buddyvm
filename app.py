import os
import json
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import datetime
import google.generativeai as genai

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)


# Helper to save history
def add_history(username, activity_type, input_text, result):
    if not username:
        return
    users = load_users()
    if username in users:
        if 'history' not in users[username]:
            users[username]['history'] = []
        
        users[username]['history'].insert(0, {
            "type": activity_type,
            "input": input_text,
            "result": result,
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
        # Keep only last 20 items
        users[username]['history'] = users[username]['history'][:20]
        save_users(users)

# Configure Gemini API
API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-3-flash-preview')


# Simple User Storage (JSON file)
USERS_FILE = 'users.json'
# For Vercel/Serverless: Use /tmp if main dir is read-only
if os.access('.', os.W_OK) is False:
    USERS_FILE = '/tmp/users.json'

def load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}

def save_users(users):
    try:
        with open(USERS_FILE, 'w') as f:
            json.dump(users, f, indent=4)
    except OSError:
        # Fallback for read-only systems if /tmp check failed logic
        pass

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"success": False, "error": "Username and password required"}), 400
    
    users = load_users()
    user = users.get(username)
    
    if user and user['password'] == password:
        return jsonify({"success": True, "username": username})
    
    return jsonify({"success": False, "error": "Invalid username or password"}), 401

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"success": False, "error": "Username and password required"}), 400
    
    users = load_users()
    if username in users:
        return jsonify({"success": False, "error": "Username already exists"}), 400
    
    users[username] = {"password": password, "history": []}
    save_users(users)
    
    return jsonify({"success": True, "message": "Account created successfully. Please login."})

@app.route('/api/explain', methods=['POST'])
def explain_topic():
    data = request.json
    subject = data.get('subject')
    topic = data.get('topic')
    level = data.get('level', 'High School (Detailed)')
    
    if not subject or not topic:
        return jsonify({"error": "Subject and topic are required"}), 400
    
    prompt = f"""You are an AI Study Assistant.

Input:
- Subject: {subject}
- Topic: {topic}
- Learning Level: {level}

Task:
1. Explain the topic in a way suitable for the selected learning level.
2. Include examples appropriate for the subject:
   - For Science: simple analogies and experiments
   - For History: events, dates, and cause-effect
   - For Programming: code snippets, outputs, and logic
3. Summarize key points in bullet format.
4. Optionally generate:
   - 3 Quiz questions (MCQs) with answers at the bottom
   - 3 Flashcard style key-value pairs
5. Output should be clear, readable, and structured with headings, bullet points, and proper spacing.

Rules:
- Always tailor explanations to the selected learning level.
- Use simple language for school, technical depth for college, short points for competitive.
- Include programming examples when subject is Programming, C++, Python, or Data Structures.
"""
    
    try:
        response = model.generate_content(prompt)
        # Save to history
        username = data.get('username')
        add_history(username, 'explain', f"{topic} ({level})", response.text)
        return jsonify({"explanation": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/summarize', methods=['POST'])
def summarize_notes():
    data = request.json
    notes = data.get('notes')
    
    if not notes:
        return jsonify({"error": "Notes are required"}), 400
    
    prompt = f"Summarize the following study notes into short, easy-to-understand bullet points:\n\n{notes}"
    
    try:
        response = model.generate_content(prompt)
        # Save to history
        username = data.get('username')
        add_history(username, 'summarize', notes[:50] + "...", response.text)
        return jsonify({"summary": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/quiz', methods=['POST'])
def generate_quiz():
    data = request.json
    topic = data.get('topic')
    count = data.get('count', 5)
    
    if not topic:
        return jsonify({"error": "Topic is required"}), 400
    
    prompt = f"Generate a multiple-choice quiz with {count} questions on the topic '{topic}'. Provide the output in valid JSON format only, following this structure: [{{'question': '...', 'options': ['A', 'B', 'C', 'D'], 'answer': '...'}}]. Do not include any markdown formatting or extra text outside the JSON."
    
    try:
        response = model.generate_content(prompt)
        # Clean response text in case AI adds markdown code blocks
        content = response.text.replace('```json', '').replace('```', '').strip()
        quiz_data = json.loads(content)
        
        # Save to history
        username = data.get('username')
        add_history(username, 'quiz', topic, quiz_data)
        
        return jsonify({"quiz": quiz_data})
    except Exception as e:
        return jsonify({"error": "Failed to generate quiz JSON. Error: " + str(e)}), 500

@app.route('/api/flashcards', methods=['POST'])
def generate_flashcards():
    data = request.json
    topic = data.get('topic')
    
    if not topic:
        return jsonify({"error": "Topic is required"}), 400
    
    prompt = f"Generate 5 question-answer flashcards for the topic '{topic}'. Provide the output in valid JSON format only, following this structure: [{{'question': '...', 'answer': '...'}}]. Do not include any markdown formatting or extra text outside the JSON."
    
    try:
        response = model.generate_content(prompt)
        content = response.text.replace('```json', '').replace('```', '').strip()
        flashcards = json.loads(content)
        
        # Save to history
        username = data.get('username')
        add_history(username, 'flashcards', topic, flashcards)
        
        return jsonify({"flashcards": flashcards})
    except Exception as e:
        return jsonify({"error": "Failed to generate flashcards JSON. Error: " + str(e)}), 500

@app.route('/api/history', methods=['POST'])
def get_user_history():
    data = request.json
    username = data.get('username')
    
    if not username:
        return jsonify({"error": "Username required"}), 400
        
    users = load_users()
    if username in users:
        return jsonify({"history": users[username].get('history', [])})
    return jsonify({"history": []})

if __name__ == '__main__':
    app.run(debug=True, port=int(os.getenv("PORT", 5000)))
