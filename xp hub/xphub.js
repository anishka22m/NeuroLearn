// XP Hub Gamification Module 

class XPHub {
    constructor() {
        this.coinBalance = 1250;
        this.streakCount = 12;
        this.dailyChallenges = [
            {
                title: "Complete Math Module",
                description: "Finish today's math learning module",
                xpReward: 50,
                coinReward: 25,
                completed: false
            },
            {
                title: "Language Practice",
                description: "Spend 30 minutes in language learning",
                xpReward: 75,
                coinReward: 40,
                completed: false
            },
            {
                title: "Cognitive Exercise",
                description: "Complete 3 cognitive skill challenges",
                xpReward: 100,
                coinReward: 50,
                completed: false
            }
        ];

        this.leaderboardData = [
            { name: "Alex M.", xp: 2350, streak: 18, isCurrentUser: false },
            { name: "Sam K.", xp: 2000, streak: 14, isCurrentUser: false },
            { name: "You", xp: 1850, streak: 12, isCurrentUser: true },
            { name: "Jordan P.", xp: 1700, streak: 10, isCurrentUser: false },
            { name: "Riley S.", xp: 1500, streak: 8, isCurrentUser: false }
        ];

        this.loadState(); // Load saved state from localStorage
        this.checkChallengeReset(); // Check and reset challenges if needed
        this.initializeUI();
    }

    initializeUI() {
        this.updateCoinAndStreak();
        this.renderDailyChallenges();
        this.renderLeaderboard();
    }

    updateCoinAndStreak() {
        document.getElementById('coinBalance').textContent = this.coinBalance;
        document.getElementById('streakCount').textContent = this.streakCount;
    }

    renderDailyChallenges() {
        const challengesContainer = document.getElementById('dailyChallenges');
        challengesContainer.innerHTML = '';

        this.dailyChallenges.forEach((challenge, index) => {
            const challengeCard = document.createElement('div');
            challengeCard.className = `bg-white shadow-md rounded-lg p-4 transform transition hover:scale-105 ${challenge.completed ? 'opacity-50' : ''}`;
            challengeCard.innerHTML = `
                <h3 class="text-lg font-semibold text-indigo-700 mb-2">${challenge.title}</h3>
                <p class="text-gray-600 mb-4">${challenge.description}</p>
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                        <span class="material-icons text-yellow-500">monetization_on</span>
                        <span>${challenge.coinReward} Coins</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="material-icons text-purple-500">stars</span>
                        <span>${challenge.xpReward} XP</span>
                    </div>
                </div>
                <button data-challenge-index="${index}" class="challenge-btn mt-4 w-full bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600 ${challenge.completed ? 'cursor-not-allowed' : ''}" ${challenge.completed ? 'disabled' : ''}>
                    ${challenge.completed ? 'Completed' : 'Start Challenge'}
                </button>
            `;
            challengesContainer.appendChild(challengeCard);
        });

        this.attachChallengeListeners();
    }

    attachChallengeListeners() {
        const challengeButtons = document.querySelectorAll('.challenge-btn');
        challengeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-challenge-index');
                if (!this.dailyChallenges[index].completed) {
                    this.completeChallenge(index);
                }
            });
        });
    }

    completeChallenge(index) {
        const challenge = this.dailyChallenges[index];
        challenge.completed = true;
        this.coinBalance += challenge.coinReward;
        this.streakCount++;

        // Update current user's XP in leaderboard
        const user = this.leaderboardData.find(p => p.isCurrentUser);
        if (user) user.xp += challenge.xpReward;

        this.updateCoinAndStreak();
        this.renderDailyChallenges();
        this.renderLeaderboard();
        this.saveState();
    }

    renderLeaderboard() {
        const leaderboardBody = document.getElementById('leaderboardBody');
        leaderboardBody.innerHTML = '';

        this.leaderboardData
            .sort((a, b) => b.xp - a.xp)
            .forEach((player, index) => {
                const row = document.createElement('tr');
                row.className = `${player.isCurrentUser ? 'bg-green-50 font-bold' : ''} hover:bg-gray-100`;
                row.innerHTML = `
                    <td class="p-3">${index + 1}</td>
                    <td class="p-3">${player.name} ${player.isCurrentUser ? '(You)' : ''}</td>
                    <td class="p-3">${player.xp}</td>
                    <td class="p-3">${player.streak}</td>
                `;
                leaderboardBody.appendChild(row);
            });
    }

    // Save current challenge states and rewards to localStorage
    saveState() {
        const state = {
            dailyChallenges: this.dailyChallenges,
            coinBalance: this.coinBalance,
            streakCount: this.streakCount,
            leaderboardData: this.leaderboardData,
            lastResetDate: new Date().toDateString()
        };
        localStorage.setItem('xpHubState', JSON.stringify(state));
    }

    // Load saved state from localStorage if available
    loadState() {
        const saved = localStorage.getItem('xpHubState');
        if (saved) {
            const state = JSON.parse(saved);
            this.dailyChallenges = state.dailyChallenges || this.dailyChallenges;
            this.coinBalance = state.coinBalance;
            this.streakCount = state.streakCount;
            this.leaderboardData = state.leaderboardData || this.leaderboardData;
            this.lastResetDate = state.lastResetDate;
        }
    }

    // Reset challenges if it's a new day
    checkChallengeReset() {
        const today = new Date().toDateString();
        if (this.lastResetDate !== today) {
            this.dailyChallenges.forEach(ch => ch.completed = false);
            this.lastResetDate = today;
            this.saveState();
        }
    }
}

// Initialize XP Hub when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new XPHub();
});

// Navbar Functionality
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');

    // Mobile Menu Toggle
    mobileMenuButton.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('hidden');

        if (isOpen) {
            // Open menu
            mobileMenu.classList.remove('hidden');
            menuIcon.classList.replace('fa-bars', 'fa-times');
        } else {
            // Close menu
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

// Navigation Helper Functions
function navigateTo(page) {
    // Example navigation method
    window.location.href = page;
}
