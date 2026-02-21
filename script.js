// Global Variables
let currentUser = null;
let currentSection = 'overview';
let assessmentQuestions = [];
let currentQuestionIndex = 0;
let assessmentAnswers = {};
let moodEntries = [];
let chatHistory = {
    ai: [],
    therapist: []
};

// Sample assessment questions
const sampleQuestions = [
    {
        question: "How often have you been feeling down, depressed, or hopeless in the past two weeks?",
        options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
        type: "depression"
    },
    {
        question: "How often have you had little interest or pleasure in doing things?",
        options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
        type: "depression"
    },
    {
        question: "How often have you been feeling nervous, anxious, or on edge?",
        options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
        type: "anxiety"
    },
    {
        question: "How often have you been unable to stop or control worrying?",
        options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
        type: "anxiety"
    },
    {
        question: "How would you rate your sleep quality recently?",
        options: ["Very good", "Good", "Poor", "Very poor"],
        type: "general"
    },
    {
        question: "How often do you feel overwhelmed by daily responsibilities?",
        options: ["Never", "Sometimes", "Often", "Always"],
        type: "stress"
    },
    {
        question: "How satisfied are you with your social relationships?",
        options: ["Very satisfied", "Somewhat satisfied", "Somewhat dissatisfied", "Very dissatisfied"],
        type: "social"
    },
    {
        question: "How often do you engage in activities you enjoy?",
        options: ["Daily", "Several times a week", "Rarely", "Never"],
        type: "general"
    },
    {
        question: "How would you rate your overall energy levels?",
        options: ["Very high", "High", "Low", "Very low"],
        type: "general"
    },
    {
        question: "How confident do you feel about managing stress in your life?",
        options: ["Very confident", "Somewhat confident", "Not very confident", "Not at all confident"],
        type: "stress"
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadSampleData();
});

function initializeApp() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }
    
    // Initialize assessment questions
    assessmentQuestions = [...sampleQuestions];
    
    // Load saved data
    loadUserData();
    
    // Initialize smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

function loadSampleData() {
    // Sample mood entries for demonstration
    const sampleMoodEntries = [
        { date: '2024-01-15', mood: 'good', emoji: '😊', factors: ['sleep', 'work'], notes: 'Had a productive day at work' },
        { date: '2024-01-14', mood: 'okay', emoji: '😐', factors: ['relationships'], notes: 'Some stress from family' },
        { date: '2024-01-13', mood: 'excellent', emoji: '😄', factors: ['sleep', 'health'], notes: 'Great workout and good sleep' },
        { date: '2024-01-12', mood: 'low', emoji: '😔', factors: ['work', 'finances'], notes: 'Work pressure is getting high' },
        { date: '2024-01-11', mood: 'good', emoji: '😊', factors: ['relationships', 'sleep'], notes: 'Nice evening with friends' },
        { date: '2024-01-10', mood: 'okay', emoji: '😐', factors: ['health'], notes: 'Feeling a bit tired' },
        { date: '2024-01-09', mood: 'good', emoji: '😊', factors: ['work'], notes: 'Completed an important project' }
    ];
    
    // Only load sample data if no existing data
    if (!localStorage.getItem('moodEntries')) {
        moodEntries = sampleMoodEntries;
        localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
    }
}

// Authentication Functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function hideLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.querySelector('.auth-toggle .auth-btn').classList.add('active');
    document.querySelectorAll('.auth-toggle .auth-btn')[1].classList.remove('active');
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.querySelector('.auth-toggle .auth-btn').classList.remove('active');
    document.querySelectorAll('.auth-toggle .auth-btn')[1].classList.add('active');
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple validation (in real app, this would be server-side)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        hideLoginModal();
        showDashboard();
        showNotification('Welcome back!', 'success');
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const age = parseInt(document.getElementById('registerAge').value);
    
    // Simple validation
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.some(u => u.email === email)) {
        showNotification('User with this email already exists', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password, // In real app, this would be hashed
        age: age,
        registrationDate: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    hideLoginModal();
    showDashboard();
    showNotification('Account created successfully! Welcome to MindCare!', 'success');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('dashboard').style.display = 'none';
    document.querySelector('.hero').style.display = 'flex';
    document.querySelector('.features').style.display = 'block';
    showNotification('Logged out successfully', 'success');
}

// Dashboard Functions
function showDashboard() {
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.features').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    
    // Update user name
    document.getElementById('userName').textContent = currentUser.name;
    
    // Load user data
    loadUserData();
    showSection('overview');
    updateOverviewData();
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.dash-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    currentSection = sectionName;
    
    // Special handling for different sections
    switch(sectionName) {
        case 'assessment':
            initializeAssessment();
            break;
        case 'progress':
            updateProgressSection();
            break;
        case 'mood':
            // Reset mood selection
            document.querySelectorAll('.mood-option').forEach(option => {
                option.classList.remove('selected');
            });
            document.getElementById('moodDetails').style.display = 'none';
            break;
    }
}

function updateOverviewData() {
    // Update today's mood
    const today = new Date().toISOString().split('T')[0];
    const todayMood = moodEntries.find(entry => entry.date === today);
    
    if (todayMood) {
        document.getElementById('todayMood').innerHTML = `
            <i class="fas fa-smile mood-icon"></i>
            <span>${todayMood.mood}</span>
        `;
    }
    
    // Update days tracked
    document.getElementById('daysTracked').innerHTML = `
        <span class="stat-number">${moodEntries.length}</span>
        <span class="stat-label">days</span>
    `;
}

// Assessment Functions
function initializeAssessment() {
    currentQuestionIndex = 0;
    assessmentAnswers = {};
    displayCurrentQuestion();
    updateAssessmentProgress();
}

function displayCurrentQuestion() {
    const question = assessmentQuestions[currentQuestionIndex];
    const container = document.getElementById('questionContainer');
    
    container.innerHTML = `
        <div class="question">
            <h3>${question.question}</h3>
            <div class="question-options">
                ${question.options.map((option, index) => `
                    <label class="option">
                        <input type="radio" name="q${currentQuestionIndex}" value="${index}">
                        <span>${option}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add event listeners
    container.querySelectorAll('input[type="radio"]').forEach(input => {
        input.addEventListener('change', function() {
            assessmentAnswers[currentQuestionIndex] = parseInt(this.value);
            document.getElementById('nextBtn').disabled = false;
        });
    });
    
    // Update button states
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').disabled = true;
    
    if (currentQuestionIndex === assessmentQuestions.length - 1) {
        document.getElementById('nextBtn').textContent = 'Complete Assessment';
    } else {
        document.getElementById('nextBtn').textContent = 'Next';
    }
}

function updateAssessmentProgress() {
    const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100;
    document.getElementById('assessmentProgress').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `Question ${currentQuestionIndex + 1} of ${assessmentQuestions.length}`;
}

function nextQuestion() {
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
        currentQuestionIndex++;
        displayCurrentQuestion();
        updateAssessmentProgress();
    } else {
        completeAssessment();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayCurrentQuestion();
        updateAssessmentProgress();
        
        // Restore previous answer if exists
        if (assessmentAnswers[currentQuestionIndex] !== undefined) {
            const radioInputs = document.querySelectorAll('input[type="radio"]');
            radioInputs[assessmentAnswers[currentQuestionIndex]].checked = true;
            document.getElementById('nextBtn').disabled = false;
        }
    }
}

function completeAssessment() {
    // Calculate assessment score
    let totalScore = 0;
    let maxScore = 0;
    
    for (let i = 0; i < assessmentQuestions.length; i++) {
        if (assessmentAnswers[i] !== undefined) {
            totalScore += assessmentAnswers[i];
        }
        maxScore += assessmentQuestions[i].options.length - 1;
    }
    
    const percentageScore = Math.round((totalScore / maxScore) * 100);
    let riskLevel = 'Low';
    
    if (percentageScore > 70) {
        riskLevel = 'High';
    } else if (percentageScore > 40) {
        riskLevel = 'Moderate';
    }
    
    // Save assessment result
    const assessmentResult = {
        date: new Date().toISOString(),
        score: percentageScore,
        riskLevel: riskLevel,
        answers: assessmentAnswers
    };
    
    const assessments = JSON.parse(localStorage.getItem('assessments') || '[]');
    assessments.push(assessmentResult);
    localStorage.setItem('assessments', JSON.stringify(assessments));
    
    // Update overview
    document.getElementById('assessmentScore').innerHTML = `
        <span class="score">${percentageScore}</span>
        <span class="score-label">${riskLevel} Risk</span>
    `;
    
    // Show results
    showAssessmentResults(assessmentResult);
}

function showAssessmentResults(result) {
    const container = document.getElementById('questionContainer');
    let recommendations = [];
    
    if (result.riskLevel === 'High') {
        recommendations = [
            'Consider speaking with a mental health professional',
            'Use our crisis support resources if needed',
            'Connect with our therapist chat feature',
            'Practice daily mood tracking',
            'Reach out to trusted friends or family'
        ];
    } else if (result.riskLevel === 'Moderate') {
        recommendations = [
            'Continue using our AI support chatbot',
            'Track your mood daily',
            'Practice stress management techniques',
            'Consider lifestyle changes for better mental health',
            'Connect with our peer support community'
        ];
    } else {
        recommendations = [
            'Keep up the good work!',
            'Continue daily mood tracking',
            'Use our resources for maintaining good mental health',
            'Support others in our community',
            'Practice preventive mental health strategies'
        ];
    }
    
    container.innerHTML = `
        <div class="assessment-results">
            <h3>Assessment Complete</h3>
            <div class="result-summary">
                <div class="result-score">
                    <span class="score">${result.score}</span>
                    <span class="score-label">${result.riskLevel} Risk Level</span>
                </div>
            </div>
            <div class="recommendations">
                <h4>Personalized Recommendations:</h4>
                <ul>
                    ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            <div class="result-actions">
                <button class="assessment-btn primary" onclick="showSection('chatbot')">
                    Talk to AI Counselor
                </button>
                <button class="assessment-btn" onclick="showSection('therapist')">
                    Connect with Therapist
                </button>
            </div>
        </div>
    `;
    
    // Hide controls
    document.querySelector('.assessment-controls').style.display = 'none';
    
    showNotification(`Assessment completed! Risk level: ${result.riskLevel}`, 'success');
}

// AI Chatbot Functions
function sendAIMessage() {
    const input = document.getElementById('aiChatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessageToChat('aiChatMessages', message, 'user');
    
    // Clear input
    input.value = '';
    
    // Generate AI response
    setTimeout(() => {
        const response = generateAIResponse(message);
        addMessageToChat('aiChatMessages', response, 'bot');
    }, 1000);
}

function handleAIChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendAIMessage();
    }
}

function addMessageToChat(containerId, message, sender) {
    const container = document.getElementById(containerId);
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = `<p>${message}</p>`;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    container.appendChild(messageDiv);
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
    
    // Save to chat history
    chatHistory.ai.push({ sender, message, timestamp: new Date().toISOString() });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Simple keyword-based responses (in real app, this would use actual AI)
    const responses = {
        greeting: [
            "Hello! I'm here to support you. How are you feeling today?",
            "Hi there! It's good to connect with you. What's on your mind?",
            "Welcome! I'm glad you reached out. How can I help you today?"
        ],
        sad: [
            "I hear that you're feeling sad. That's completely valid - sadness is a natural human emotion. Would you like to talk about what's contributing to these feelings?",
            "Thank you for sharing that you're feeling sad. It takes courage to acknowledge difficult emotions. What do you think might help you feel a bit better right now?",
            "I'm sorry you're going through a difficult time. Sadness can feel overwhelming, but you're not alone. What's been the hardest part of your day?"
        ],
        anxious: [
            "Anxiety can be really challenging to deal with. You're brave for reaching out. Have you tried any breathing exercises or grounding techniques that help you feel more centered?",
            "I understand that anxiety can feel overwhelming. Let's try a quick grounding exercise: Can you name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste?",
            "Anxiety is your mind's way of trying to protect you, but sometimes it can be too much. What situations or thoughts tend to trigger your anxiety the most?"
        ],
        stressed: [
            "Stress is something many people experience, especially in today's world. What are the main sources of stress in your life right now?",
            "It sounds like you're dealing with a lot of pressure. Sometimes breaking things down into smaller, manageable steps can help. What's one small thing you could do today to reduce your stress?",
            "Chronic stress can really impact both your mental and physical health. Have you been able to take any breaks or do activities you enjoy recently?"
        ],
        sleep: [
            "Sleep issues are very common and can significantly impact mental health. How many hours of sleep are you typically getting, and what's your bedtime routine like?",
            "Good sleep is crucial for mental wellness. Have you noticed any patterns in what helps you sleep better or what keeps you awake?",
            "Sleep and mental health are closely connected. Creating a consistent bedtime routine and limiting screen time before bed can really help. What's your biggest sleep challenge?"
        ],
        help: [
            "I'm here to provide support and listen to whatever you're going through. You can talk to me about your feelings, ask for coping strategies, or just share what's on your mind.",
            "There are many ways I can help: we can discuss coping strategies, work through difficult emotions, practice mindfulness exercises, or I can simply listen. What feels most helpful to you right now?",
            "Remember that seeking help is a sign of strength, not weakness. I'm here to support you, and if you need additional resources, I can help connect you with professional services."
        ],
        default: [
            "Thank you for sharing that with me. Can you tell me more about how you're feeling?",
            "I appreciate you opening up. What emotions are you experiencing right now?",
            "It's important that you're taking time to focus on your mental health. What would be most helpful for you to talk about?",
            "I'm here to listen and support you. How has your day been affecting your mood?",
            "Everyone's mental health journey is unique. What strategies have helped you cope with difficult times in the past?"
        ]
    };
    
    let responseType = 'default';
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        responseType = 'greeting';
    } else if (message.includes('sad') || message.includes('depressed') || message.includes('down')) {
        responseType = 'sad';
    } else if (message.includes('anxious') || message.includes('anxiety') || message.includes('worried') || message.includes('nervous')) {
        responseType = 'anxious';
    } else if (message.includes('stress') || message.includes('overwhelmed') || message.includes('pressure')) {
        responseType = 'stressed';
    } else if (message.includes('sleep') || message.includes('tired') || message.includes('insomnia')) {
        responseType = 'sleep';
    } else if (message.includes('help') || message.includes('support')) {
        responseType = 'help';
    }
    
    const responseArray = responses[responseType];
    return responseArray[Math.floor(Math.random() * responseArray.length)];
}

// Therapist Functions
function selectTherapist(therapistId) {
    const therapists = {
        'dr-smith': { name: 'Dr. Sarah Smith', specialty: 'Anxiety & Depression' },
        'dr-johnson': { name: 'Dr. Michael Johnson', specialty: 'Trauma & PTSD' }
    };
    
    const therapist = therapists[therapistId];
    document.getElementById('selectedTherapistName').textContent = therapist.name;
    
    // Hide selection and show chat
    document.querySelector('.therapist-selection').style.display = 'none';
    document.getElementById('therapistChat').style.display = 'block';
    
    // Initialize chat with therapist greeting
    const chatMessages = document.getElementById('therapistChatMessages');
    chatMessages.innerHTML = '';
    
    addMessageToTherapistChat(`Hello! I'm ${therapist.name}, specializing in ${therapist.specialty}. I'm here to provide professional support and guidance. How are you feeling today?`, 'therapist');
}

function endTherapistChat() {
    document.querySelector('.therapist-selection').style.display = 'block';
    document.getElementById('therapistChat').style.display = 'none';
    document.getElementById('therapistChatMessages').innerHTML = '';
}

function sendTherapistMessage() {
    const input = document.getElementById('therapistChatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addMessageToTherapistChat(message, 'user');
    input.value = '';
    
    // Generate therapist response
    setTimeout(() => {
        const response = generateTherapistResponse(message);
        addMessageToTherapistChat(response, 'therapist');
    }, 2000);
}

function handleTherapistChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendTherapistMessage();
    }
}

function addMessageToTherapistChat(message, sender) {
    const container = document.getElementById('therapistChatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'therapist' ? '<i class="fas fa-user-doctor"></i>' : '<i class="fas fa-user"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = `<p>${message}</p>`;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    container.appendChild(messageDiv);
    
    container.scrollTop = container.scrollHeight;
    
    // Save to chat history
    chatHistory.therapist.push({ sender, message, timestamp: new Date().toISOString() });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function generateTherapistResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Professional therapist responses
    const responses = {
        greeting: [
            "Thank you for sharing that with me. In therapy, we create a safe space to explore your thoughts and feelings. What brought you here today?",
            "I appreciate you taking this step to seek support. Let's start by understanding what you're experiencing. Can you tell me about your current situation?",
            "It's courageous of you to reach out. I'm here to listen without judgment and help you work through whatever you're facing. What's been on your mind lately?"
        ],
        emotions: [
            "Those are significant feelings you're describing. It's important to acknowledge and validate these emotions rather than dismiss them. Have you been experiencing these feelings for a while?",
            "I hear you expressing some complex emotions. In therapy, we often explore not just what we're feeling, but what might be underneath those feelings. What do you think might be contributing to this?",
            "Thank you for being so open about your emotional experience. These feelings are telling us something important. How are these emotions impacting your daily life?"
        ],
        coping: [
            "It sounds like you're looking for some healthy coping strategies. Let's explore what's worked for you in the past and identify some new tools you might find helpful. What have you tried before?",
            "Developing effective coping mechanisms is a key part of mental wellness. I'd like to help you build a toolkit of strategies that work specifically for you. What situations feel most challenging to handle?",
            "Coping skills are very personal - what works for one person may not work for another. Let's identify your strengths and build from there. How do you typically handle stress?"
        ],
        default: [
            "I want to make sure I understand your perspective fully. Can you help me understand more about what this experience has been like for you?",
            "What you're describing sounds challenging. I'm wondering how this has been affecting different areas of your life - your relationships, work, sleep, or daily activities?",
            "I hear you, and I want you to know that what you're experiencing is valid. Many people face similar challenges. What feels most important for us to focus on today?",
            "That takes strength to share. In our work together, we'll go at your pace and focus on what feels most helpful to you. What would you like to explore further?"
        ]
    };
    
    let responseType = 'default';
    
    if (message.includes('hello') || message.includes('hi') || message.includes('good') || message.includes('fine')) {
        responseType = 'greeting';
    } else if (message.includes('feel') || message.includes('emotion') || message.includes('sad') || message.includes('angry') || message.includes('scared')) {
        responseType = 'emotions';
    } else if (message.includes('cope') || message.includes('help') || message.includes('manage') || message.includes('deal')) {
        responseType = 'coping';
    }
    
    const responseArray = responses[responseType];
    return responseArray[Math.floor(Math.random() * responseArray.length)];
}

// Mood Tracking Functions
function selectMood(mood, emoji) {
    // Remove previous selection
    document.querySelectorAll('.mood-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to clicked option
    event.target.classList.add('selected');
    
    // Show mood details
    document.getElementById('moodDetails').style.display = 'block';
    
    // Store selected mood
    document.getElementById('moodDetails').dataset.selectedMood = mood;
    document.getElementById('moodDetails').dataset.selectedEmoji = emoji;
}

function saveMood() {
    const selectedMood = document.getElementById('moodDetails').dataset.selectedMood;
    const selectedEmoji = document.getElementById('moodDetails').dataset.selectedEmoji;
    const notes = document.getElementById('moodNotes').value;
    const factors = Array.from(document.querySelectorAll('.factor-option input:checked')).map(cb => cb.value);
    
    if (!selectedMood) {
        showNotification('Please select a mood first', 'error');
        return;
    }
    
    const moodEntry = {
        date: new Date().toISOString().split('T')[0],
        mood: selectedMood,
        emoji: selectedEmoji,
        notes: notes,
        factors: factors,
        timestamp: new Date().toISOString()
    };
    
    // Remove existing entry for today if exists
    moodEntries = moodEntries.filter(entry => entry.date !== moodEntry.date);
    
    // Add new entry
    moodEntries.push(moodEntry);
    moodEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Save to localStorage
    localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
    
    // Update overview
    updateOverviewData();
    
    // Reset form
    document.querySelectorAll('.mood-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.getElementById('moodDetails').style.display = 'none';
    document.getElementById('moodNotes').value = '';
    document.querySelectorAll('.factor-option input:checked').forEach(cb => cb.checked = false);
    
    showNotification('Mood entry saved successfully!', 'success');
    
    // Show analysis based on mood
    if (selectedMood === 'terrible' || selectedMood === 'low') {
        showMoodAnalysis('concern');
    } else if (selectedMood === 'excellent' || selectedMood === 'good') {
        showMoodAnalysis('positive');
    }
}

function showMoodAnalysis(type) {
    let message, suggestions;
    
    if (type === 'concern') {
        message = "I notice you're going through a difficult time. It's important to take care of yourself.";
        suggestions = [
            "Consider talking to someone you trust",
            "Try some relaxation techniques like deep breathing",
            "Engage in a small activity you usually enjoy",
            "Make sure you're getting enough sleep and nutrition",
            "Don't hesitate to reach out for professional help if needed"
        ];
    } else {
        message = "It's wonderful that you're feeling good! Let's maintain this positive momentum.";
        suggestions = [
            "Take note of what contributed to your good mood",
            "Share your positive energy with others",
            "Continue the activities that make you feel good",
            "Use this time to build resilience for tougher days",
            "Consider how you can support others in your community"
        ];
    }
    
    setTimeout(() => {
        showNotification(`${message} Here are some suggestions: ${suggestions.join(', ')}`, 'info');
    }, 2000);
}

// Progress Functions
function updateProgressSection() {
    // Calculate statistics
    const totalEntries = moodEntries.length;
    const recentEntries = moodEntries.slice(0, 7);
    
    // Calculate average mood (convert mood to numbers)
    const moodValues = { terrible: 1, low: 2, okay: 3, good: 4, excellent: 5 };
    let totalMoodValue = 0;
    let moodCount = 0;
    
    recentEntries.forEach(entry => {
        if (moodValues[entry.mood]) {
            totalMoodValue += moodValues[entry.mood];
            moodCount++;
        }
    });
    
    const averageMood = moodCount > 0 ? (totalMoodValue / moodCount).toFixed(1) : 0;
    
    // Update stats
    document.querySelector('.progress-stats .stat-value').textContent = `${averageMood}/5`;
    
    // Update recent entries
    updateRecentEntries();
    
    // Draw mood chart
    drawMoodChart();
}

function updateRecentEntries() {
    const container = document.getElementById('recentEntries');
    const recentEntries = moodEntries.slice(0, 5);
    
    container.innerHTML = recentEntries.map(entry => `
        <div class="entry-item">
            <div class="entry-mood">
                <span class="emoji">${entry.emoji}</span>
                <span>${entry.mood}</span>
            </div>
            <div class="entry-date">${formatDate(entry.date)}</div>
        </div>
    `).join('');
}

function drawMoodChart() {
    const canvas = document.getElementById('moodChart');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get last 7 days of data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const entry = moodEntries.find(e => e.date === dateStr);
        last7Days.push({
            date: dateStr,
            mood: entry ? entry.mood : null
        });
    }
    
    // Mood to value mapping
    const moodValues = { terrible: 1, low: 2, okay: 3, good: 4, excellent: 5 };
    
    // Chart dimensions
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    // Draw axes
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 2;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw grid lines
    ctx.strokeStyle = '#f8f9fa';
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= 5; i++) {
        const y = canvas.height - padding - (i * chartHeight / 5);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }
    
    // Draw mood line
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    let firstPoint = true;
    last7Days.forEach((day, index) => {
        if (day.mood) {
            const x = padding + (index * chartWidth / 6);
            const y = canvas.height - padding - ((moodValues[day.mood] - 1) * chartHeight / 4);
            
            if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                ctx.lineTo(x, y);
            }
            
            // Draw point
            ctx.save();
            ctx.fillStyle = '#667eea';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        }
    });
    
    ctx.stroke();
    
    // Add labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // X-axis labels (days)
    last7Days.forEach((day, index) => {
        const x = padding + (index * chartWidth / 6);
        const label = new Date(day.date).toLocaleDateString('en', { weekday: 'short' });
        ctx.fillText(label, x, canvas.height - 10);
    });
    
    // Y-axis labels (mood levels)
    const moodLabels = ['Terrible', 'Low', 'Okay', 'Good', 'Excellent'];
    moodLabels.forEach((label, index) => {
        const y = canvas.height - padding - (index * chartHeight / 4) + 4;
        ctx.save();
        ctx.textAlign = 'right';
        ctx.fillText(label, padding - 10, y);
        ctx.restore();
    });
}

// Emergency Functions
function showEmergencyHelp() {
    document.getElementById('emergencyModal').style.display = 'block';
}

function hideEmergencyModal() {
    document.getElementById('emergencyModal').style.display = 'none';
}

function connectEmergencyTherapist() {
    hideEmergencyModal();
    showSection('therapist');
    
    // Automatically select emergency therapist
    setTimeout(() => {
        selectTherapist('dr-smith');
        addMessageToTherapistChat("I understand you're going through a crisis right now. I'm here to provide immediate support. Please know that you're not alone and that there are people who care about you. Can you tell me what's happening right now?", 'therapist');
    }, 1000);
}

// Utility Functions
function loadUserData() {
    // Load mood entries
    const savedMoodEntries = localStorage.getItem('moodEntries');
    if (savedMoodEntries) {
        moodEntries = JSON.parse(savedMoodEntries);
    }
    
    // Load chat history
    const savedChatHistory = localStorage.getItem('chatHistory');
    if (savedChatHistory) {
        chatHistory = JSON.parse(savedChatHistory);
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        max-width: 350px;
        word-wrap: break-word;
    `;
    
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
            break;
        case 'info':
            notification.style.background = 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .notification {
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .notification:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }
`;
document.head.appendChild(notificationStyles);

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const loginModal = document.getElementById('loginModal');
    const emergencyModal = document.getElementById('emergencyModal');
    
    if (event.target === loginModal) {
        hideLoginModal();
    }
    
    if (event.target === emergencyModal) {
        hideEmergencyModal();
    }
});

// Prevent form submission on Enter in chat inputs
document.addEventListener('keypress', function(event) {
    if (event.target.matches('#aiChatInput, #therapistChatInput') && event.key === 'Enter') {
        event.preventDefault();
    }
});

console.log('MindCare Mental Health Platform loaded successfully!');
