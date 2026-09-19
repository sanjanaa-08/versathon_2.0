
from flask import Flask, request
from flask_cors import CORS
from pypdf import PdfReader
from openai import OpenAI
import os
import json

app = Flask(__name__)

CORS(app)

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY")
)


@app.route("/")
def home():
    return "Buzzit backend is running!"


@app.route("/api/test")
def test():
    return {
        "message": "Buzzit frontend connected to backend!"
    }


# ===============================
# NOTES UPLOAD
# ===============================

@app.route("/api/upload", methods=["POST"])
def upload_notes():

    if "file" not in request.files:
        return {
            "error": "No file uploaded"
        }, 400

    file = request.files["file"]

    if file.filename.endswith(".txt"):

        content = file.read().decode("utf-8")

        return {
            "message": "File uploaded and read successfully!",
            "filename": file.filename,
            "content": content
        }

    elif file.filename.endswith(".pdf"):

        pdf_reader = PdfReader(file)

        content = ""

        for page in pdf_reader.pages:

            text = page.extract_text()

            if text:
                content += text + "\n"

        return {
            "message": "PDF uploaded and read successfully!",
            "filename": file.filename,
            "content": content
        }

    return {
        "message": "File uploaded successfully!",
        "filename": file.filename
    }


# ===============================
# AI PRACTICE QUIZ
# ===============================

@app.route("/api/generate-quiz", methods=["POST"])
def generate_quiz():

    data = request.get_json()

    if not data:
        return {
            "error": "No data received"
        }, 400

    notes = data.get("notes", "")

    if not notes.strip():
        return {
            "error": "No notes provided"
        }, 400

    prompt = f"""
You are an AI study assistant.

Read the student's notes below and create a practice quiz.

Create 10 multiple-choice questions.

Rules:
- Questions must be based ONLY on the notes.
- Test important concepts.
- Use student-friendly language.
- Each question must have exactly 4 options.
- Only one option should be correct.
- Include a short explanation for the correct answer.
- Cover different topics from the notes.

Return ONLY valid JSON in exactly this format:

{{
    "questions": [
        {{
            "question": "Question here",
            "options": [
                "Option A",
                "Option B",
                "Option C",
                "Option D"
            ],
            "correct_answer": 0,
            "explanation": "Explanation here",
            "topic": "Topic here"
        }}
    ]
}}

IMPORTANT:

correct_answer must be:

0 = first option
1 = second option
2 = third option
3 = fourth option

STUDENT NOTES:

{notes}
"""

    try:

        response = client.responses.create(
            model="gpt-5.6-luna",
            input=prompt
        )

        ai_text = response.output_text

        quiz_data = json.loads(ai_text)

        return quiz_data

    except json.JSONDecodeError:

        return {
            "error": "AI returned invalid quiz data"
        }, 500

    except Exception as error:

        return {
            "error": str(error)
        }, 500


# ===============================
# START SERVER
# ===============================

if __name__ == "__main__":
    app.run(debug=True)
    