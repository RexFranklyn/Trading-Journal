// =============================================
// Firebase Configuration and Initialization
// =============================================
const firebaseConfig = {
    apiKey: "AIzaSyAEWXEQSDS5fE9PWVWgqExT82vXUIbhYr4",
    authDomain: "rex-trading-journal.firebaseapp.com",
    projectId: "rex-trading-journal",
    storageBucket: "rex-trading-journal.firebasestorage.app",
    messagingSenderId: "712464396453",
    appId: "1:712464396453:web:f0abfc8b96dd46e6f95d4c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// =============================================
// Dark Mode Toggle Functionality
// =============================================
const darkModeToggle = document.getElementById('darkModeToggle');
const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

// Initialize dark mode based on saved preference or system settings
function initDarkMode() {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled' || (savedMode === null && darkModeMediaQuery.matches)) {
        enableDarkMode();
    }
}

// Toggle between light/dark modes
function toggleDarkMode() {
    if (document.body.classList.contains('dark-mode')) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
}

// Enable dark mode and update UI
function enableDarkMode() {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    darkModeToggle.setAttribute('title', 'Switch to Light Mode');
}

// Disable dark mode and update UI
function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    darkModeToggle.setAttribute('title', 'Switch to Dark Mode');
}

// Event Listeners
darkModeToggle.addEventListener('click', toggleDarkMode);
darkModeMediaQuery.addListener((e) => {
    if (localStorage.getItem('darkMode') === null) {
        e.matches ? enableDarkMode() : disableDarkMode();
    }
});

// Initialize dark mode on page load
initDarkMode();

// =============================================
// Global Variables
// =============================================
let trades = [];
let currentUser = null;

// =============================================
// DOM Elements
// =============================================
// Login Page Elements
const loginPage = document.getElementById('loginPage');
const tradingJournal = document.getElementById('tradingJournal');
const emailLoginForm = document.getElementById('emailLoginForm');
const emailSignUpForm = document.getElementById('emailSignUpForm');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const showSignUp = document.getElementById('showSignUp');
const showLogin = document.getElementById('showLogin');
const signUpForm = document.getElementById('signUpForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// Trading Journal Elements
const menuToggle = document.getElementById('menuToggle');
const navContainer = document.getElementById('navContainer');
const addTradeBtn = document.getElementById('addTradeBtn');
const tradeModal = document.getElementById('tradeModal');
const detailsModal = document.getElementById('detailsModal');
const modalTitle = document.getElementById('modalTitle');
const tradeForm = document.getElementById('tradeForm');
const closeButtons = document.querySelectorAll('.close');
const tabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');
const userProfile = document.getElementById('userProfile');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const userMenu = document.getElementById('userMenu');
const signOutBtn = document.getElementById('signOutBtn');

// =============================================
// Event Listeners
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    setupAuthEventListeners();
});

function setupAuthEventListeners() {
    // Show/hide login/signup forms
    showSignUp.addEventListener('click', (e) => {
        e.preventDefault();
        emailLoginForm.closest('.login-form').style.display = 'none';
        signUpForm.style.display = 'block';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signUpForm.style.display = 'none';
        emailLoginForm.closest('.login-form').style.display = 'block';
    });

    // Email/password login
    emailLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        showLoading(emailLoginForm);
        
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                hideError();
                showSuccess('Login successful!');
                setTimeout(() => {
                    loginSuccess(userCredential.user);
                }, 1000);
            })
            .catch((error) => {
                hideLoading(emailLoginForm);
                showError(error.message);
            });
    });

    // Email/password signup
    emailSignUpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        
        showLoading(emailSignUpForm);
        
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed up
                hideError();
                showSuccess('Account created successfully!');
                setTimeout(() => {
                    loginSuccess(userCredential.user);
                }, 1000);
            })
            .catch((error) => {
                hideLoading(emailSignUpForm);
                showError(error.message);
            });
    });

    // Google login
    googleLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const provider = new firebase.auth.GoogleAuthProvider();
        
        showLoading(googleLoginBtn);
        
        auth.signInWithPopup(provider)
            .then((result) => {
                // Signed in with Google
                hideError();
                showSuccess('Login successful!');
                setTimeout(() => {
                    loginSuccess(result.user);
                }, 1000);
            })
            .catch((error) => {
                hideLoading(googleLoginBtn);
                showError(error.message);
            });
    });

    // Auth state listener
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            loginSuccess(user);
        } else {
            // User is signed out
            loginPage.style.display = 'flex';
            tradingJournal.style.display = 'none';
        }
    });
}

function setupTradingJournalEventListeners() {
    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        navContainer.classList.toggle('open');
        menuToggle.innerHTML = navContainer.classList.contains('open') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
    
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = tab.getAttribute('data-tab');
            switchTab(tabId);
            
            // Close mobile menu when selecting a tab
            navContainer.classList.remove('open');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
    
    // Modal events
    addTradeBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Add New Trade';
        tradeForm.reset();
        document.getElementById('tradeId').value = '';
        document.getElementById('tradeDate').valueAsDate = new Date();
        openModal(tradeModal);
    });
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Form submission
    tradeForm.addEventListener('submit', handleTradeFormSubmit);
    
    // Filter events
    document.getElementById('timeframeFilter').addEventListener('change', loadAnalysisData);
    document.getElementById('symbolFilter').addEventListener('change', loadAnalysisData);
    document.getElementById('historySymbolFilter').addEventListener('input', loadTradeHistory);
    document.getElementById('historyTypeFilter').addEventListener('change', loadTradeHistory);
    document.getElementById('historyResultFilter').addEventListener('change', loadTradeHistory);
    
    // Calendar navigation
    document.getElementById('monthSelect').addEventListener('change', updateCalendar);
    document.getElementById('yearSelect').addEventListener('change', updateCalendar);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === tradeModal) {
            closeModal(tradeModal);
        }
        if (e.target === detailsModal) {
            closeModal(detailsModal);
        }
    });

    // User profile menu
    userProfile.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('active');
    });

    // Close user menu when clicking elsewhere
    document.addEventListener('click', () => {
        userMenu.classList.remove('active');
    });

    // Sign out
    signOutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            // Sign-out successful.
            showSuccess('Signed out successfully');
        }).catch((error) => {
            // An error happened.
            showError(error.message);
        });
    });
}

// =============================================
// Authentication Functions
// =============================================
function loginSuccess(user) {
    currentUser = user;
    loginPage.style.display = 'none';
    tradingJournal.style.display = 'block';
    
    // Update user profile
    updateUserProfile(user);
    
    // Initialize trading journal
    initTradingJournal();
}

function updateUserProfile(user) {
    // Set user name and avatar
    const displayName = user.displayName || user.email.split('@')[0];
    userName.textContent = displayName;
    
    // Set avatar with first letter of name
    userAvatar.textContent = displayName.charAt(0).toUpperCase();
    
    // If user has photo URL, use it
    if (user.photoURL) {
        userAvatar.style.backgroundImage = `url(${user.photoURL})`;
        userAvatar.textContent = '';
    }
}

// =============================================
// Trading Journal Functions
// =============================================
function initTradingJournal() {
    setupTradingJournalEventListeners();
    loadTabs();
    loadTradesFromFirebase();
    setupCalendar();
}

function loadTabs() {
    // Activate the first tab by default
    switchTab('dashboard');
}

function switchTab(tabId) {
    // Update tab navigation
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === tabId) {
            tab.classList.add('active');
        }
    });
    
    // Update tab content
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId) {
            content.classList.add('active');
        }
    });
}

function openModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function loadTradesFromFirebase() {
    if (!currentUser) return;
    
    const userId = currentUser.uid;
    const tradesRef = database.ref(`users/${userId}/trades`);
    
    tradesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        trades = data ? Object.values(data) : [];
        
        // Update all views
        loadDashboardData();
        loadAnalysisData();
        updateCalendar();
        loadTradeHistory();
    });
}

function saveTradeToFirebase(trade) {
    if (!currentUser) return;
    
    const userId = currentUser.uid;
    const tradesRef = database.ref(`users/${userId}/trades`);
    
    if (trade.id) {
        // Update existing trade
        tradesRef.child(trade.id).set(trade);
    } else {
        // Add new trade
        const newTradeRef = tradesRef.push();
        trade.id = newTradeRef.key;
        newTradeRef.set(trade);
    }
}

function deleteTradeFromFirebase(tradeId) {
    if (!currentUser) return;
    
    const userId = currentUser.uid;
    const tradeRef = database.ref(`users/${userId}/trades/${tradeId}`);
    tradeRef.remove();
}

function handleTradeFormSubmit(e) {
    e.preventDefault();
    
    const tradeId = document.getElementById('tradeId').value;
    const trade = {
        id: tradeId || Date.now().toString(),
        date: document.getElementById('tradeDate').value,
        symbol: document.getElementById('tradeSymbol').value.toUpperCase(),
        type: document.getElementById('tradeType').value,
        strategy: document.getElementById('tradeStrategy').value,
        entry: parseFloat(document.getElementById('tradeEntry').value),
        exit: parseFloat(document.getElementById('tradeExit').value),
        size: parseFloat(document.getElementById('tradeSize').value),
        notes: document.getElementById('tradeNotes').value
    };
    
    // Calculate P/L
    if (trade.type === 'buy') {
        trade.pl = (trade.exit - trade.entry) * trade.size;
    } else {
        trade.pl = (trade.entry - trade.exit) * trade.size;
    }
    
    // Determine result
    if (trade.pl > 0.5) {
        trade.result = 'win';
    } else if (trade.pl < -0.5) {
        trade.result = 'loss';
    } else {
        trade.result = 'breakeven';
    }
    
    // Save to Firebase
    saveTradeToFirebase(trade);
    
    // Close modal
    closeModal(tradeModal);
}

function loadDashboardData() {
    if (trades.length === 0) {
        return;
    }
    
    // Calculate statistics
    const totalTrades = trades.length;
    const wins = trades.filter(t => t.result === 'win').length;
    const losses = trades.filter(t => t.result === 'loss').length;
    const breakeven = trades.filter(t => t.result === 'breakeven').length;
    
    const winRate = (wins / totalTrades) * 100;
    const totalPL = trades.reduce((sum, trade) => sum + trade.pl, 0);
    const avgTrade = totalPL / totalTrades;
    
    const grossProfit = trades.filter(t => t.pl > 0).reduce((sum, t) => sum + t.pl, 0);
    const grossLoss = Math.abs(trades.filter(t => t.pl < 0).reduce((sum, t) => sum + t.pl, 0));
    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
    
    // Calculate drawdown
    let maxBalance = 0;
    let maxDrawdown = 0;
    let balance = 0;
    
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedTrades.forEach(trade => {
        balance += trade.pl;
        if (balance > maxBalance) {
            maxBalance = balance;
        }
        const drawdown = maxBalance - balance;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    });
    
    // Calculate streaks
    let currentStreak = 0;
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let tempWinStreak = 0;
    let tempLossStreak = 0;
    
    for (let i = sortedTrades.length - 1; i >= 0; i--) {
        const trade = sortedTrades[i];
        
        if (trade.result === 'win') {
            tempWinStreak++;
            tempLossStreak = 0;
            
            if (i === sortedTrades.length - 1) {
                currentStreak = tempWinStreak;
            }
            
            if (tempWinStreak > longestWinStreak) {
                longestWinStreak = tempWinStreak;
            }
        } else if (trade.result === 'loss') {
            tempLossStreak++;
            tempWinStreak = 0;
            
            if (i === sortedTrades.length - 1) {
                currentStreak = -tempLossStreak;
            }
            
            if (tempLossStreak > longestLossStreak) {
                longestLossStreak = tempLossStreak;
            }
        } else {
            tempWinStreak = 0;
            tempLossStreak = 0;
            
            if (i === sortedTrades.length - 1) {
                currentStreak = 0;
            }
        }
    }
    
    // Calculate monthly P/L
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyPL = trades.filter(trade => {
        const tradeDate = new Date(trade.date);
        return tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear;
    }).reduce((sum, trade) => sum + trade.pl, 0);
    
    // Calculate average win and loss
    const winTrades = trades.filter(t => t.result === 'win');
    const lossTrades = trades.filter(t => t.result === 'loss');
    
    const avgWin = winTrades.length > 0 ? winTrades.reduce((sum, t) => sum + t.pl, 0) / winTrades.length : 0;
    const avgLoss = lossTrades.length > 0 ? lossTrades.reduce((sum, t) => sum + t.pl, 0) / lossTrades.length : 0;
    
    const riskRewardRatio = Math.abs(avgLoss) > 0 ? avgWin / Math.abs(avgLoss) : 0;
    
    // Update DOM
    document.getElementById('totalProfitLoss').textContent = formatCurrency(totalPL);
    document.getElementById('totalProfitLoss').className = 'stats-value ' + (totalPL >= 0 ? 'positive' : 'negative');
    
    document.getElementById('winRate').textContent = winRate.toFixed(1) + '%';
    document.getElementById('totalTrades').textContent = totalTrades;
    
    document.getElementById('avgTrade').textContent = formatCurrency(avgTrade);
    document.getElementById('avgTrade').className = 'stats-value ' + (avgTrade >= 0 ? 'positive' : 'negative');
    
    document.getElementById('profitFactor').textContent = profitFactor.toFixed(2);
    document.getElementById('riskRewardRatio').textContent = riskRewardRatio.toFixed(2);
    document.getElementById('maxDrawdown').textContent = formatCurrency(maxDrawdown);
    
    document.getElementById('monthlyPL').textContent = formatCurrency(monthlyPL);
    document.getElementById('monthlyPL').className = 'stats-value ' + (monthlyPL >= 0 ? 'positive' : 'negative');
    
    // Update win rate chart
    document.getElementById('winSegment').style.width = winRate + '%';
    document.getElementById('lossSegment').style.width = (100 - winRate) + '%';
    
    // Update streak indicators
    document.getElementById('currentStreak').textContent = Math.abs(currentStreak);
    document.getElementById('currentStreak').className = 'streak-value ' + (currentStreak >= 0 ? 'positive' : 'negative');
    
    document.getElementById('longestWinStreak').textContent = longestWinStreak;
    document.getElementById('longestLossStreak').textContent = longestLossStreak;
    
    // Load recent trades
    const recentTrades = [...trades].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    const recentTradesBody = document.getElementById('recentTradesBody');
    
    if (recentTrades.length > 0) {
        recentTradesBody.innerHTML = '';
        
        recentTrades.forEach(trade => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(trade.date)}</td>
                <td>${trade.symbol}</td>
                <td>${capitalize(trade.type)}</td>
                <td>${trade.entry.toFixed(2)}</td>
                <td class="${trade.result === 'win' ? 'positive' : trade.result === 'loss' ? 'negative' : 'neutral'}">${capitalize(trade.result)}</td>
                <td class="${trade.pl >= 0 ? 'positive' : 'negative'}">${formatCurrency(trade.pl)}</td>
            `;
            recentTradesBody.appendChild(row);
        });
    } else {
        recentTradesBody.innerHTML = '<tr><td colspan="6" class="text-center">No trades yet</td></tr>';
    }
}

function loadAnalysisData() {
    if (trades.length === 0) {
        return;
    }
    
    // Get filter values
    const timeframe = document.getElementById('timeframeFilter').value;
    const symbolFilter = document.getElementById('symbolFilter').value;
    
    // Apply filters
    let filteredTrades = [...trades];
    
    if (timeframe !== 'all') {
        const now = new Date();
        const startDate = new Date();
        
        if (timeframe === 'month') {
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
        } else if (timeframe === 'week') {
            const day = startDate.getDay();
            startDate.setDate(startDate.getDate() - day);
            startDate.setHours(0, 0, 0, 0);
        }
        
        filteredTrades = filteredTrades.filter(trade => new Date(trade.date) >= startDate);
    }
    
    if (symbolFilter !== 'all') {
        filteredTrades = filteredTrades.filter(trade => trade.symbol === symbolFilter);
    }
    
    // Best and worst trades
    const bestTrade = [...filteredTrades].sort((a, b) => b.pl - a.pl)[0];
    const worstTrade = [...filteredTrades].sort((a, b) => a.pl - b.pl)[0];
    
    // Average win and loss
    const winTrades = filteredTrades.filter(t => t.result === 'win');
    const lossTrades = filteredTrades.filter(t => t.result === 'loss');
    
    const avgWin = winTrades.length > 0 ? winTrades.reduce((sum, t) => sum + t.pl, 0) / winTrades.length : 0;
    const avgLoss = lossTrades.length > 0 ? lossTrades.reduce((sum, t) => sum + t.pl, 0) / lossTrades.length : 0;
    
    // Update DOM
    document.getElementById('bestTrade').textContent = bestTrade ? formatCurrency(bestTrade.pl) : '$0.00';
    document.getElementById('worstTrade').textContent = worstTrade ? formatCurrency(worstTrade.pl) : '$0.00';
    document.getElementById('avgWin').textContent = formatCurrency(avgWin);
    document.getElementById('avgLoss').textContent = formatCurrency(avgLoss);
    
    // Update strategy analysis
    const strategies = {};
    filteredTrades.forEach(trade => {
        const strategy = trade.strategy || 'Undefined';
        
        if (!strategies[strategy]) {
            strategies[strategy] = {
                name: strategy,
                trades: 0,
                wins: 0,
                pl: 0
            };
        }
        
        strategies[strategy].trades++;
        strategies[strategy].pl += trade.pl;
        
        if (trade.result === 'win') {
            strategies[strategy].wins++;
        }
    });
    
    const strategyData = Object.values(strategies).sort((a, b) => b.pl - a.pl);
    const strategyAnalysisBody = document.getElementById('strategyAnalysisBody');
    
    if (strategyData.length > 0) {
        strategyAnalysisBody.innerHTML = '';
        
        strategyData.forEach(strategy => {
            const winRate = (strategy.wins / strategy.trades) * 100;
            const avgPL = strategy.pl / strategy.trades;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${strategy.name}</td>
                <td>${strategy.trades}</td>
                <td>${winRate.toFixed(1)}%</td>
                <td class="${strategy.pl >= 0 ? 'positive' : 'negative'}">${formatCurrency(strategy.pl)}</td>
                <td class="${avgPL >= 0 ? 'positive' : 'negative'}">${formatCurrency(avgPL)}</td>
            `;
            strategyAnalysisBody.appendChild(row);
        });
    } else {
        strategyAnalysisBody.innerHTML = '<tr><td colspan="5" class="text-center">No data available</td></tr>';
    }
    
    // Update symbol analysis
    const symbols = {};
    filteredTrades.forEach(trade => {
        const symbol = trade.symbol;
        
        if (!symbols[symbol]) {
            symbols[symbol] = {
                name: symbol,
                trades: 0,
                wins: 0,
                pl: 0
            };
        }
        
        symbols[symbol].trades++;
        symbols[symbol].pl += trade.pl;
        
        if (trade.result === 'win') {
            symbols[symbol].wins++;
        }
    });
    
    const symbolData = Object.values(symbols).sort((a, b) => b.pl - a.pl);
    const symbolAnalysisBody = document.getElementById('symbolAnalysisBody');
    
    if (symbolData.length > 0) {
        symbolAnalysisBody.innerHTML = '';
        
        symbolData.forEach(symbol => {
            const winRate = (symbol.wins / symbol.trades) * 100;
            const avgPL = symbol.pl / symbol.trades;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${symbol.name}</td>
                <td>${symbol.trades}</td>
                <td>${winRate.toFixed(1)}%</td>
                <td class="${symbol.pl >= 0 ? 'positive' : 'negative'}">${formatCurrency(symbol.pl)}</td>
                <td class="${avgPL >= 0 ? 'positive' : 'negative'}">${formatCurrency(avgPL)}</td>
            `;
            symbolAnalysisBody.appendChild(row);
        });
        
        // Update symbol filter options
        const symbolFilterSelect = document.getElementById('symbolFilter');
        const currentSelection = symbolFilterSelect.value;
        
        // Clear options except 'All Symbols'
        while (symbolFilterSelect.options.length > 1) {
            symbolFilterSelect.remove(1);
        }
        
        // Add symbol options
        symbolData.forEach(symbol => {
            const option = document.createElement('option');
            option.value = symbol.name;
            option.textContent = symbol.name;
            symbolFilterSelect.appendChild(option);
        });
        
        // Try to restore previous selection
        if (currentSelection !== 'all') {
            for (let i = 0; i < symbolFilterSelect.options.length; i++) {
                if (symbolFilterSelect.options[i].value === currentSelection) {
                    symbolFilterSelect.selectedIndex = i;
                    break;
                }
            }
        }
    } else {
        symbolAnalysisBody.innerHTML = '<tr><td colspan="5" class="text-center">No data available</td></tr>';
    }
    
    // Update day of week analysis
    const days = {
        0: { name: 'Sunday', trades: 0, wins: 0, pl: 0 },
        1: { name: 'Monday', trades: 0, wins: 0, pl: 0 },
        2: { name: 'Tuesday', trades: 0, wins: 0, pl: 0 },
        3: { name: 'Wednesday', trades: 0, wins: 0, pl: 0 },
        4: { name: 'Thursday', trades: 0, wins: 0, pl: 0 },
        5: { name: 'Friday', trades: 0, wins: 0, pl: 0 },
        6: { name: 'Saturday', trades: 0, wins: 0, pl: 0 }
    };
    
    filteredTrades.forEach(trade => {
        const day = new Date(trade.date).getDay();
        
        days[day].trades++;
        days[day].pl += trade.pl;
        
        if (trade.result === 'win') {
            days[day].wins++;
        }
    });
    
    const dayData = Object.values(days);
    const dayAnalysisBody = document.getElementById('dayAnalysisBody');
    
    if (filteredTrades.length > 0) {
        dayAnalysisBody.innerHTML = '';
        
        dayData.forEach(day => {
            if (day.trades === 0) return;
            
            const winRate = (day.wins / day.trades) * 100;
            const avgPL = day.pl / day.trades;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${day.name}</td>
                <td>${day.trades}</td>
                <td>${winRate.toFixed(1)}%</td>
                <td class="${day.pl >= 0 ? 'positive' : 'negative'}">${formatCurrency(day.pl)}</td>
                <td class="${avgPL >= 0 ? 'positive' : 'negative'}">${formatCurrency(avgPL)}</td>
            `;
            dayAnalysisBody.appendChild(row);
        });
    } else {
        dayAnalysisBody.innerHTML = '<tr><td colspan="5" class="text-center">No data available</td></tr>';
    }
}

function setupCalendar() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    
    // Populate month select
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
    
    // Populate year select
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 2; year <= currentYear + 2; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    
    // Set current month and year
    const currentDate = new Date();
    monthSelect.value = currentDate.getMonth();
    yearSelect.value = currentDate.getFullYear();
    
    // Generate calendar
    updateCalendar();
}

function updateCalendar() {
    const month = parseInt(document.getElementById('monthSelect').value);
    const year = parseInt(document.getElementById('yearSelect').value);
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const calendarBody = document.getElementById('calendarBody');
    calendarBody.innerHTML = '';
    
    let day = 1;
    for (let i = 0; i < 6; i++) {
        if (day > daysInMonth) break;
        
        const row = document.createElement('tr');
        
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            
            if ((i === 0 && j < startingDay) || day > daysInMonth) {
                cell.innerHTML = '';
            } else {
                const currentDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const dayTrades = trades.filter(trade => trade.date === currentDate);
                
                if (dayTrades.length > 0) {
                    const dayPL = dayTrades.reduce((sum, trade) => sum + trade.pl, 0);
                    
                    let cellClass = 'breakeven-day';
                    if (dayPL > 0.5) {
                        cellClass = 'win-day';
                    } else if (dayPL < -0.5) {
                        cellClass = 'loss-day';
                    }
                    
                    cell.className = cellClass;
                    cell.innerHTML = `
                        <div>${day}</div>
                        <div class="${dayPL >= 0 ? 'positive' : 'negative'}" style="font-size: 0.75rem;">${formatCurrency(dayPL, true)}</div>
                    `;
                } else {
                    cell.className = 'no-trades';
                    cell.innerHTML = `<div>${day}</div>`;
                }
                
                day++;
            }
            
            row.appendChild(cell);
        }
        
        calendarBody.appendChild(row);
    }
}

function loadTradeHistory() {
    const symbolFilter = document.getElementById('historySymbolFilter').value.toUpperCase();
    const typeFilter = document.getElementById('historyTypeFilter').value;
    const resultFilter = document.getElementById('historyResultFilter').value;
    
    // Apply filters
    let filteredTrades = [...trades];
    
    if (symbolFilter) {
        filteredTrades = filteredTrades.filter(trade => trade.symbol.includes(symbolFilter));
    }
    
    if (typeFilter !== 'all') {
        filteredTrades = filteredTrades.filter(trade => trade.type === typeFilter);
    }
    
    if (resultFilter !== 'all') {
        filteredTrades = filteredTrades.filter(trade => trade.result === resultFilter);
    }
    
    // Sort by date (newest first)
    filteredTrades.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const tradeHistoryBody = document.getElementById('tradeHistoryBody');
    
    if (filteredTrades.length > 0) {
        tradeHistoryBody.innerHTML = '';
        
        filteredTrades.forEach(trade => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(trade.date)}</td>
                <td>${trade.symbol}</td>
                <td>${capitalize(trade.type)}</td>
                <td>${trade.strategy || '-'}</td>
                <td>${trade.entry.toFixed(2)}</td>
                <td>${trade.exit.toFixed(2)}</td>
                <td>${trade.size}</td>
                <td class="${trade.pl >= 0 ? 'positive' : 'negative'}">${formatCurrency(trade.pl)}</td>
                <td class="${trade.result === 'win' ? 'positive' : trade.result === 'loss' ? 'negative' : 'neutral'}">${capitalize(trade.result)}</td>
                <td>
                    <button class="btn btn-primary btn-sm view-trade" data-id="${trade.id}"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-primary btn-sm edit-trade" data-id="${trade.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-primary btn-sm delete-trade" data-id="${trade.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tradeHistoryBody.appendChild(row);
        });
        
        // Add event listeners for action buttons
        document.querySelectorAll('.view-trade').forEach(btn => {
            btn.addEventListener('click', () => viewTrade(btn.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.edit-trade').forEach(btn => {
            btn.addEventListener('click', () => editTrade(btn.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.delete-trade').forEach(btn => {
            btn.addEventListener('click', () => deleteTrade(btn.getAttribute('data-id')));
        });
    } else {
        tradeHistoryBody.innerHTML = '<tr><td colspan="10" class="text-center">No trades found</td></tr>';
    }
}

function viewTrade(id) {
    const trade = trades.find(t => t.id === id);
    
    if (trade) {
        const tradeDetails = document.getElementById('tradeDetails');
        
        const result = trade.result === 'win' ? 'positive' : trade.result === 'loss' ? 'negative' : 'neutral';
        const plClass = trade.pl >= 0 ? 'positive' : 'negative';
        
        tradeDetails.innerHTML = `
            <h4>${trade.symbol} - ${capitalize(trade.type)} Trade</h4>
            <p><strong>Date:</strong> ${formatDate(trade.date)}</p>
            <p><strong>Strategy:</strong> ${trade.strategy || 'Not specified'}</p>
            <p><strong>Entry Price:</strong> ${trade.entry.toFixed(2)}</p>
            <p><strong>Exit Price:</strong> ${trade.exit.toFixed(2)}</p>
            <p><strong>Position Size:</strong> ${trade.size}</p>
            <p><strong>Result:</strong> <span class="${result}">${capitalize(trade.result)}</span></p>
            <p><strong>Profit/Loss:</strong> <span class="${plClass}">${formatCurrency(trade.pl)}</span></p>
            
            <h5 class="mt-4">Notes:</h5>
            <p>${trade.notes || 'No notes added.'}</p>
        `;
        
        openModal(detailsModal);
    }
}

function editTrade(id) {
    const trade = trades.find(t => t.id === id);
    
    if (trade) {
        modalTitle.textContent = 'Edit Trade';
        document.getElementById('tradeId').value = trade.id;
        document.getElementById('tradeDate').value = trade.date;
        document.getElementById('tradeSymbol').value = trade.symbol;
        document.getElementById('tradeType').value = trade.type;
        document.getElementById('tradeStrategy').value = trade.strategy || '';
        document.getElementById('tradeEntry').value = trade.entry;
        document.getElementById('tradeExit').value = trade.exit;
        document.getElementById('tradeSize').value = trade.size;
        document.getElementById('tradeNotes').value = trade.notes || '';
        
        openModal(tradeModal);
    }
}

function deleteTrade(id) {
    if (confirm('Are you sure you want to delete this trade?')) {
        deleteTradeFromFirebase(id);
    }
}

// =============================================
// Helper Functions
// =============================================
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
}

function showLoading(button) {
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    button.setAttribute('data-original-text', originalText);
}

function hideLoading(button) {
    const originalText = button.getAttribute('data-original-text');
    button.disabled = false;
    button.innerHTML = originalText;
}

function formatCurrency(value, compact = false) {
    if (compact && Math.abs(value) >= 1000) {
        return '$' + (value / 1000).toFixed(1) + 'K' + (value < 0 ? ' 🔻' : '');
    }
    return '$' + Math.abs(value).toFixed(2) + (value < 0 ? ' 🔻' : '');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}