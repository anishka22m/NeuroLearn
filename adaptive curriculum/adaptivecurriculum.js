// API Configuration and Syllabus Processing
const GROQ_API_KEY = "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"; 
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Navbar Functionality
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');

    mobileMenuButton.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('hidden');
        if (isOpen) {
            mobileMenu.classList.remove('hidden');
            menuIcon.classList.replace('fa-bars', 'fa-times');
        } else {
            mobileMenu.classList.add('hidden');
            menuIcon.classList.replace('fa-times', 'fa-bars');
        }
    });

    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (window.scrollY > 50) {
            nav.classList.add('shadow-lg');
            nav.classList.remove('shadow-md');
        } else {
            nav.classList.remove('shadow-lg');
            nav.classList.add('shadow-md');
        }
    });
});

// Syllabus Processing Function
async function processSyllabus() {
    const subject = document.getElementById('subject').value;
    const mode = document.getElementById('mode').value;
    const marks = document.getElementById('marks').value;
    const syllabusFile = document.getElementById('syllabus').files[0];
    const progressElement = document.getElementById('progress');

    progressElement.innerHTML = '<i class="fas fa-spinner animate-spin mr-2"></i>Generating Study Plan...';

    if (!syllabusFile || !marks) {
        progressElement.innerHTML = '<i class="fas fa-exclamation-circle text-red-500 mr-2"></i>Please upload a syllabus file and enter your marks.';
        return;
    }

    let syllabusText = "";
    if (syllabusFile.type.includes("text")) {
        syllabusText = await syllabusFile.text();
    } else {
        try {
            syllabusText = await extractTextFromImage(syllabusFile);
        } catch (error) {
            console.error("Error extracting text from image:", error);
            progressElement.innerHTML = '<i class="fas fa-exclamation-circle text-red-500 mr-2"></i>Failed to extract text from image.';
            return;
        }
    }

    fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "You are an AI assistant that creates adaptive study plans based on syllabus, marks, and learning mode."
                },
                {
                    role: "user",
                    content: `Syllabus: ${syllabusText}\nMarks: ${marks}\nSubject: ${subject}\nMode: ${mode}`
                }
            ]
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.choices && data.choices.length > 0) {
            progressElement.innerHTML = `
                <div class="text-left">
                    <h3 class="font-bold text-lg mb-2">Generated Study Plan:</h3>
                    <p class="whitespace-pre-wrap">${data.choices[0].message.content}</p>
                </div>
            `;
        } else {
            progressElement.innerHTML = '<i class="fas fa-exclamation-circle text-red-500 mr-2"></i>Failed to generate study plan. No response from API.';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        progressElement.innerHTML = '<i class="fas fa-exclamation-circle text-red-500 mr-2"></i>Failed to generate study plan.';
    });
}

// Text Extraction from Image
async function extractTextFromImage(file) {
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();
    return text;
}
