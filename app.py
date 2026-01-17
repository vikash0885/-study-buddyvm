import os
import json
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import datetime
from groq import Groq

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Groq API
client = Groq(
    api_key=os.getenv("GROQ_API_KEY"),
)

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

# Simple User Storage (JSON file)
USERS_FILE = 'users.json'
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
        pass

def get_groq_response(prompt, json_mode=False):
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"} if json_mode else None,
    )
    return chat_completion.choices[0].message.content

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
2. Include examples appropriate for the subject.
3. Summarize key points in bullet format.
4. Output should be clear, readable, and structured with markdown headings and bullet points.
"""
    
    try:
        response_text = get_groq_response(prompt)
        username = data.get('username')
        add_history(username, 'explain', f"{topic} ({level})", response_text)
        return jsonify({"explanation": response_text})
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
        response_text = get_groq_response(prompt)
        username = data.get('username')
        add_history(username, 'summarize', notes[:50] + "...", response_text)
        return jsonify({"summary": response_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/quiz', methods=['POST'])
def generate_quiz():
    data = request.json
    topic = data.get('topic')
    count = data.get('count', 5)
    
    if not topic:
        return jsonify({"error": "Topic is required"}), 400
    
    prompt = f"Generate a multiple-choice quiz with {count} questions on the topic '{topic}'. Provide the output in valid JSON format only, following this structure: {{\"quiz\": [{{'question': '...', 'options': ['A', 'B', 'C', 'D'], 'answer': '...'}}]}}. Do not include any markdown formatting or extra text outside the JSON."
    
    try:
        response_text = get_groq_response(prompt, json_mode=True)
        quiz_data = json.loads(response_text).get('quiz', [])
        
        username = data.get('username')
        add_history(username, 'quiz', topic, quiz_data)
        
        return jsonify({"quiz": quiz_data})
    except Exception as e:
        return jsonify({"error": "Failed to generate quiz. " + str(e)}), 500

@app.route('/api/flashcards', methods=['POST'])
def generate_flashcards():
    data = request.json
    topic = data.get('topic')
    
    if not topic:
        return jsonify({"error": "Topic is required"}), 400
    
    prompt = f"Generate 5 question-answer flashcards for the topic '{topic}'. Provide the output in valid JSON format only, following this structure: {{\"flashcards\": [{{'question': '...', 'answer': '...'}}]}}. Do not include any markdown formatting or extra text outside the JSON."
    
    try:
        response_text = get_groq_response(prompt, json_mode=True)
        flashcards = json.loads(response_text).get('flashcards', [])
        
        username = data.get('username')
        add_history(username, 'flashcards', topic, flashcards)
        
        return jsonify({"flashcards": flashcards})
    except Exception as e:
        return jsonify({"error": "Failed to generate flashcards. " + str(e)}), 500

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
