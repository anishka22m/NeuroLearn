document.addEventListener('DOMContentLoaded', () => {
    // Carousel Functionality
    const carouselItems = document.querySelectorAll('.carousel-item');
    const prevButton = document.getElementById('prevCarousel');
    const nextButton = document.getElementById('nextCarousel');
    let currentSlide = 0;

    function showSlide(index) {
        carouselItems.forEach((item, i) => {
            item.style.transform = `translateX(${100 * (i - index)}%)`;
        });
    }

    nextButton.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % carouselItems.length;
        showSlide(currentSlide);
    });

    prevButton.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + carouselItems.length) % carouselItems.length;
        showSlide(currentSlide);
    });

    // Chatbot Functionality
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotModal = document.getElementById('chatbot-modal'); // ✅ Fix: Toggle modal, not container
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotSend = document.getElementById('chatbot-send');

    if (chatbotToggle && chatbotModal && chatbotClose && chatbotInput && chatbotMessages && chatbotSend) {
        // Toggle chatbot modal correctly
        chatbotToggle.addEventListener('click', () => {
            chatbotModal.classList.toggle('hidden'); // ✅ FIX: Show/hide only modal
        });

        // Close chatbot modal
        chatbotClose.addEventListener('click', () => {
            chatbotModal.classList.add('hidden'); // ✅ FIX: Only close modal, not container
        });

        // Add message to chat
        function addMessage(content, sender = 'assistant') {
            const messageElement = document.createElement('div');
            messageElement.classList.add(
                'mb-2',
                'p-2',
                'rounded-lg',
                sender === 'user' ? 'user' : 'assistant'
            );
            messageElement.innerHTML = `<strong>${sender === 'user' ? 'You' : 'NeuroLearn Assistant'}:</strong> ${content}`;
            chatbotMessages.appendChild(messageElement);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }

        // OpenAI API Configuration
        const GROQ_API_KEY = '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'; 
        const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

        async function sendMessageToGroq(message) {
            if (!GROQ_API_KEY) {
                addMessage('API key is missing. Please configure it.', 'assistant');
                return;
            }

            try {
                addMessage('Thinking...', 'assistant');

                const response = await fetch(GROQ_API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [{ role: "user", content: message }],
                        max_tokens: 150,
                        temperature: 0.7
                    })
                });

                chatbotMessages.lastChild.remove(); // ✅ Remove 'Thinking...' message
                const data = await response.json();
                
if (data.choices && data.choices.length > 0) {
    addMessage(data.choices[0].message.content.trim(), 'assistant');
} else if (data.error) {
    addMessage(`Error from API: ${data.error.message}`, 'assistant');
} else {
    addMessage('Unexpected error occurred. Please try again later.', 'assistant');
}


            } catch (error) {
                chatbotMessages.lastChild.remove();
                addMessage(`Error: ${error.message}`, 'assistant');
            }
        }

        // Handle user input
        function handleUserInput() {
            const userMessage = chatbotInput.value.trim();
            if (userMessage) {
                addMessage(userMessage, 'user');
                chatbotInput.value = '';

                sendMessageToGroq(userMessage);
            }
        }

        chatbotSend.addEventListener('click', handleUserInput);
        chatbotInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                handleUserInput();
            }
        });
    }

    // Auto-start carousel
    setInterval(() => {
        currentSlide = (currentSlide + 1) % carouselItems.length;
        showSlide(currentSlide);
    }, 5000);

    // Navbar Functionality
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

    // Active Page Highlighting
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('text-indigo-700', 'bg-indigo-100');
        }
    });

    // Scroll-based Navbar Styling
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
