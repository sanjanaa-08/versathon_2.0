const flashcardBtn = document.getElementById("flashcardBtn");

const quizBtn = document.getElementById("quizBtn");

const notesFile = document.getElementById("notesFile");

// ===============================
// FLASHCARDS
// ===============================

flashcardBtn.addEventListener("click", function () {

const notesContent = localStorage.getItem("notesContent");  

if (!notesContent) {  
    alert("Please upload your notes first.");  
    return;  
}  

alert(  
    "Flashcard Question:\n\n" +  
    "What is the main topic of your notes?"  
);

});

// ===============================
// PRACTICE QUIZ
// ===============================

quizBtn.addEventListener("click", async () => {
    const notes = localStorage.getItem("notesContent");

    if (!notes) {
        alert("Please upload your notes first.");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:5000/api/generate-quiz", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                notes: notes
            })
        });

        const quiz = await response.json();

        if (quiz.error) {
            alert("Quiz error: " + quiz.error);
            return;
        }

        console.log("AI Quiz:", quiz);

        quizBtn.addEventListener("click", async () => {
    const notes = localStorage.getItem("notesContent");

    if (!notes) {
        alert("Please upload your notes first.");
        return;
    }

    const quizContainer = document.getElementById("quizContainer");

    quizContainer.innerHTML = "<p>Generating your AI quiz... ⏳</p>";

    try {
        const response = await fetch("http://127.0.0.1:5000/api/generate-quiz", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                notes: notes
            })
        });

        const quiz = await response.json();

        if (quiz.error) {
            quizContainer.innerHTML = `<p>Error: ${quiz.error}</p>`;
            return;
        }

        quizContainer.innerHTML = "";

        quiz.questions.forEach((item, index) => {
            const questionDiv = document.createElement("div");

            questionDiv.innerHTML = `
                <h3>Question ${index + 1}</h3>
                <p>${item.question}</p>

                ${item.options.map((option, optionIndex) => `
                    <button class="quiz-option"
                        data-question="${index}"
                        data-option="${optionIndex}">
                        ${option}
                    </button>
                `).join("")}

                <p class="explanation" id="explanation-${index}"></p>
            `;

            quizContainer.appendChild(questionDiv);

            const buttons = questionDiv.querySelectorAll(".quiz-option");

            buttons.forEach(button => {
                button.addEventListener("click", () => {
                    const selected = Number(button.dataset.option);
                    const explanation = document.getElementById(`explanation-${index}`);

                    if (selected === item.correct_answer) {
                        explanation.textContent =
                            "✅ Correct! " + item.explanation;
                    } else {
                        explanation.textContent =
                            "❌ Not quite. " + item.explanation;
                    }
                });
            });
        });

    } catch (error) {
        console.error(error);
        quizContainer.innerHTML =
            "<p>❌ Could not connect to the quiz server.</p>";
    }
});
    } catch (error) {
        console.error(error);
        alert("Could not connect to the quiz server.");
    }
});

// ===============================
// BACKEND CONNECTION TEST
// ===============================

fetch("http://127.0.0.1:5000/api/test")
.then(response => response.json())
.then(data => {

console.log(data.message);  

})  
.catch(error => {  

    console.error("Backend connection failed:", error);  

});

// ===============================
// NOTES UPLOAD
// ===============================

notesFile.addEventListener("change", function () {

console.log("File selected!");  

const file = notesFile.files[0];  

console.log("Selected file:", file);  

if (!file) {  
    return;  
}  

const formData = new FormData();  

console.log("FormData created");  

formData.append("file", file);  

console.log("Sending file to backend...");  

fetch("http://127.0.0.1:5000/api/upload", {  
    method: "POST",  
    body: formData  
})  

    .then(response => {  

        console.log("Backend response received");  

        return response.json();  

    })  

    .then(data => {  

        console.log(data.message);  

        console.log("Uploaded file:", data.filename);  

        console.log("Notes content:", data.content);  

        // Save uploaded notes  
        // so the Flashcards feature can use them  
        localStorage.setItem("notesContent", data.content);  

        console.log("Notes saved for Flashcards!");  

    })  

    .catch(error => {  

        console.error("Upload failed:", error);  

    });

});
});
// ===============================
// YOUR PROGRESS
// ===============================

let progress = {
    flashcardsCompleted: 0,
    quizzesCompleted: 0,
    questionsAnswered: 0,
    score:0
};

function updateProgress() {

    document.getElementById("flashcardsCompleted").textContent =
        "Flashcards Completed: " + progress.flashcardsCompleted;

    document.getElementById("quizzesCompleted").textContent =
        "Quizzes Completed: " + progress.quizzesCompleted;

    document.getElementById("questionsAnswered").textContent =
        "Questions Answered: " + progress.questionsAnswered;
    
    document.getElementById("score").textContent =
    "Score: " + progress.score;
}

updateProgress();
// ===============================
// TOPICS FROM YOUR NOTES
// ===============================

function showTopicsFromNotes(topics) {

    const topicsList = document.getElementById("topicsList");

    topicsList.innerHTML = "";

    if (!topics || topics.length === 0) {
        topicsList.innerHTML = "<p>No topics found yet.</p>";
        return;
    }

    topics.forEach(function(topic) {

        const topicElement = document.createElement("div");

        topicElement.className = "topic-item";

        topicElement.textContent = "📌 " + topic;

        topicsList.appendChild(topicElement);
    });
}

// Example topics
showTopicsFromNotes([
    "Francis Turbine",
    "Pelton Wheel",
    "Centrifugal Pump"
]);
// ===============================
// REVISION SUGGESTIONS
// ===============================

function showRevisionSuggestions(suggestions) {

    const revisionList = document.getElementById("revisionList");

    if (!revisionList) return;

    revisionList.innerHTML = "";

    if (!suggestions || suggestions.length === 0) {
        revisionList.innerHTML =
            "<p>No revision suggestions yet.</p>";
        return;
    }

    suggestions.forEach(function(suggestion) {

        const revisionItem = document.createElement("div");

        revisionItem.className = "revision-item";

        revisionItem.textContent = "📖 " + suggestion;

        revisionList.appendChild(revisionItem);
    });
}


// Test revision suggestions
showRevisionSuggestions([
    "Revise Francis Turbine principles",
    "Review Pelton Wheel",
    "Practice Centrifugal Pump questions"
]);
