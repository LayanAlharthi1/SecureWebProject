// ============================================
// CYBER SECURITY COURSE FEEDBACK - DASHBOARD JS
// Shared functionality between Admin and Student
// ============================================

const Dashboard = (function() {
    // ========== PRIVATE VARIABLES ==========
    let feedbacks = [];
    let displayedFeedbacks = [];
    let currentUser = {
        name: "",
        role: "",
        studentName: ""
    };
    
    let notificationsEnabled = true;
    
    // ========== COURSE DATABASE ==========
    const courseInfo = {
        "secure-web-dev": {
            name: "Secure Web Development",
            category: "Cybersecurity",
            difficulty: "medium"
        },
        "security-software": {
            name: "Security Software Engineering",
            category: "Cybersecurity",
            difficulty: "hard"
        },
        "operating-system": {
            name: "Operating System",
            category: "Computer Science",
            difficulty: "hard"
        },
        "network-intro": {
            name: "Introduction To Network",
            category: "Networking",
            difficulty: "medium"
        },
        "cyber-fundamentals": {
            name: "Cyber Security Fundamental",
            category: "Cybersecurity",
            difficulty: "easy"
        },
        "secure-coding": {
            name: "Secure Coding",
            category: "Cybersecurity",
            difficulty: "medium"
        },
        "database-fundamental": {
            name: "Database Fundamental",
            category: "Database",
            difficulty: "medium"
        },
        "cyber-laws": {
            name: "Cybersecurity policies and laws",
            category: "Cybersecurity",
            difficulty: "easy"
        }
    };
    
    // ========== PRIVATE FUNCTIONS ==========
    
    function checkSession() {
        const role = sessionStorage.getItem('role');
        const userName = sessionStorage.getItem('userName');
        const studentName = sessionStorage.getItem('studentName');
        
        if (!role) {
            alert("Please log in first!");
            window.location.href = "login.html";
            return false;
        }
        
        currentUser = {
            name: userName || (role === 'admin' ? 'Admin' : 'Student'),
            role: role,
            studentName: studentName || userName || 'Unknown Student'
        };
        
        return true;
    }
    
    function sanitizeInput(text) {
        if (!text) return '';
        return text.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    
    function validateInput(text) {
        return !/<script\b/i.test(text);
    }
    
    function handleError(error, userMessage = "An error occurred") {
        console.error("Secure Error:", error);
        showNotification(userMessage, "error");
    }
    
    // ========== NOTIFICATION FUNCTIONS ==========
    
    function showNotification(message, type = "info") {
        if (!notificationsEnabled) return;
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        if (type === "success") {
            notification.style.backgroundColor = "#10b981";
        } else if (type === "warning") {
            notification.style.backgroundColor = "#f59e0b";
        } else if (type === "error") {
            notification.style.backgroundColor = "#ef4444";
        } else {
            notification.style.backgroundColor = "#3b82f6";
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = "slideOut 0.3s ease";
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // ========== DASHBOARD STATISTICS ==========
    
    function updateDashboardStats() {
        try {
            if (currentUser.role === 'admin') {
                const uniqueStudents = new Set(feedbacks.map(f => f.student));
                let totalRating = 0;
                feedbacks.forEach(f => totalRating += f.rating);
                const avgRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : "0.0";
                
                document.getElementById('totalCourses').textContent = Object.keys(courseInfo).length;
                document.getElementById('activeStudents').textContent = uniqueStudents.size;
                document.getElementById('totalFeedback').textContent = feedbacks.length;
                document.getElementById('avgRating').textContent = avgRating;
            } else {
                const userFeedbacks = feedbacks.filter(f => f.student === currentUser.studentName);
                let totalRating = 0;
                userFeedbacks.forEach(f => totalRating += f.rating);
                const avgRating = userFeedbacks.length > 0 ? (totalRating / userFeedbacks.length).toFixed(1) : "0.0";
                
                document.getElementById('totalCourses').textContent = Object.keys(courseInfo).length;
                document.getElementById('avgRating').textContent = avgRating;
            }
        } catch (error) {
            handleError(error, "Failed to update statistics");
        }
    }
    
    // ========== FEEDBACK MANAGEMENT ==========
    
    function setRating(rating) {
        document.querySelectorAll('.star').forEach((star, index) => {
            star.classList.toggle('active', index < rating);
        });
        document.getElementById('rating').value = rating;
    }
    
    function addFeedback(event) {
        event.preventDefault();
        
        try {
            const studentName = document.getElementById('studentName').value.trim();
            const course = document.getElementById('course').value;
            const rating = document.getElementById('rating').value;
            const message = document.getElementById('message').value.trim();
            const difficulty = document.getElementById('difficulty').value;
            
            if (!studentName || !course || !rating || !message) {
                showNotification('Please fill all required fields!', "warning");
                return;
            }
            
            if (!validateInput(message)) {
                showNotification('Invalid input detected. Please remove any script tags.', "error");
                return;
            }


            // *Validate rating input: must be a number between 1 and 5
             const ratingValue = parseInt(rating, 10);
              if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
              showNotification("Invalid rating value!", "error");
               return;
            }
            
            if (currentUser.role === 'student' && studentName !== currentUser.studentName) {
                showNotification('You can only submit feedback using your own name.', "warning");
                document.getElementById('studentName').value = currentUser.studentName;
                return;
            }
            
            const courseName = courseInfo[course].name;
            const now = new Date();
            const formattedDate = now.toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
            });
            
            const safeMessage = sanitizeInput(message);
            
            const newFeedback = {
                id: Date.now(),
                course: course,
                courseName: courseName,
                rating: parseInt(rating),
                message: safeMessage,
                difficulty: difficulty,
                date: formattedDate,
                student: studentName,
                timestamp: now.getTime()
            };
            
            feedbacks.unshift(newFeedback);
            
            updateDashboardStats();
            filterFeedbacks();
            
            if (currentUser.role === 'admin') {
                Admin.updateCourseTable();
            }
            
            document.getElementById('feedbackForm').reset();
            if (currentUser.role === 'student') {
                document.getElementById('studentName').value = currentUser.studentName;
            }
            document.querySelectorAll('.star').forEach(star => {
                star.classList.remove('active');
            });
            
            showNotification('Thank you for your feedback! ✓', "success");
            
        } catch (error) {
            handleError(error, "Failed to submit feedback");
        }
    }
    
    function filterFeedbacks() {
        try {
            const courseFilter = document.getElementById('filterCourse').value;
            const sortOption = document.getElementById('sortFeedback').value;
            
            let filteredFeedbacks = [...feedbacks];
            
            if (currentUser.role === 'student') {
                filteredFeedbacks = filteredFeedbacks.filter(fb => fb.student === currentUser.studentName);
            }
            
            if (courseFilter) {
                filteredFeedbacks = filteredFeedbacks.filter(fb => fb.course === courseFilter);
            }
            
            switch(sortOption) {
                case 'newest':
                    filteredFeedbacks.sort((a, b) => b.timestamp - a.timestamp);
                    break;
                case 'oldest':
                    filteredFeedbacks.sort((a, b) => a.timestamp - b.timestamp);
                    break;
                case 'highest-rating':
                    filteredFeedbacks.sort((a, b) => b.rating - a.rating);
                    break;
                case 'lowest-rating':
                    filteredFeedbacks.sort((a, b) => a.rating - b.rating);
                    break;
            }
            
            displayedFeedbacks = filteredFeedbacks;
            renderFeedbacks();
            
        } catch (error) {
            handleError(error, "Failed to filter feedback");
        }
    }
    
    function renderFeedbacks() {
        const container = document.getElementById('feedbackContainer');
        
        try {
            if (displayedFeedbacks.length === 0) {
                const courseFilter = document.getElementById('filterCourse').value;
                let message = 'No feedback found';
                
                if (courseFilter) {
                    message += ' for this course';
                } else if (currentUser.role === 'student') {
                    message = "You haven't submitted any feedback yet.";
                }
                
                container.innerHTML = `
                    <div style="text-align: center; color: var(--clr-info-dark); padding: 2rem;">
                        ${message} ${currentUser.role === 'student' && !courseFilter ? 'Be the first to submit!' : ''}
                    </div>
                `;
                return;
            }
            
            container.innerHTML = displayedFeedbacks.map(feedback => `
                <div class="feedback-card">
                    <div class="feedback-header">
                        <span class="course-badge">${feedback.courseName}</span>
                        <span class="difficulty-badge difficulty-${feedback.difficulty}">
                            ${feedback.difficulty.charAt(0).toUpperCase() + feedback.difficulty.slice(1)}
                        </span>
                    </div>
                    <div class="feedback-rating">
                        ${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}
                        <span style="margin-left: 8px; color: var(--clr-dark); font-size: 0.9rem;">
                            (${feedback.rating}/5)
                        </span>
                    </div>
                    <div class="feedback-message">${sanitizeInput(feedback.message)}</div>
                    <div class="feedback-footer">
                        <span>${feedback.date}</span>
                        <span>By: ${feedback.student}</span>
                    </div>
                    
                    ${currentUser.role === 'admin' ? `
                        <div class="feedback-actions">
                            <button class="action-btn btn-view" onclick="Dashboard.viewFeedbackDetails(${feedback.id})">
                                👁️ View Details
                            </button>
                            <button class="action-btn btn-delete" onclick="Dashboard.deleteFeedback(${feedback.id})">
                                🗑️ Delete
                            </button>
                        </div>
                    ` : ''}
                </div>
            `).join('');
            
        } catch (error) {
            handleError(error, "Failed to display feedback");
        }
    }
    
    // ========== THEME MANAGEMENT ==========
    
    function toggleTheme() {
        document.body.classList.toggle('dark-theme-variables');
        
        const themeToggler = document.getElementById('themeToggler');
        const spans = themeToggler.querySelectorAll('span');
        
        const isDarkMode = document.body.classList.contains('dark-theme-variables');
        
        if (isDarkMode) {
            spans[0].classList.remove('active');
            spans[1].classList.add('active');
        } else {
            spans[0].classList.add('active');
            spans[1].classList.remove('active');
        }
        
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        
        showNotification(`Theme changed to ${isDarkMode ? 'dark' : 'light'} mode`, "info");
    }
    
    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const themeToggler = document.getElementById('themeToggler');
        const spans = themeToggler.querySelectorAll('span');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme-variables');
            spans[0].classList.remove('active');
            spans[1].classList.add('active');
        } else {
            document.body.classList.remove('dark-theme-variables');
            spans[0].classList.add('active');
            spans[1].classList.remove('active');
        }
    }
    
    // ========== NOTIFICATION MANAGEMENT ==========
    
    function toggleNotifications() {
        notificationsEnabled = !notificationsEnabled;
        const switchElement = document.getElementById('notificationSwitch');
        
        if (notificationsEnabled) {
            switchElement.classList.add('active');
            showNotification("Notifications enabled", "success");
            localStorage.setItem('notificationsEnabled', 'true');
        } else {
            switchElement.classList.remove('active');
            showNotification("Notifications disabled", "warning");
            localStorage.setItem('notificationsEnabled', 'false');
        }
    }
    
    function initializeNotifications() {
        const savedState = localStorage.getItem('notificationsEnabled');
        notificationsEnabled = savedState === null ? true : savedState === 'true';
        const switchElement = document.getElementById('notificationSwitch');
        
        if (notificationsEnabled) {
            switchElement.classList.add('active');
        } else {
            switchElement.classList.remove('active');
        }
    }
    
    // ========== LOGOUT ==========
    
    function logout() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.clear();
            localStorage.removeItem('theme');
            
            showNotification('Logged out successfully!', "success");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);
        }
    }
    
    // ========== SAMPLE DATA ==========
    
    function addSampleData() {
        if (feedbacks.length === 0) {
            const sampleData = [
                {
                    id: 1,
                    course: "secure-web-dev",
                    courseName: "Secure Web Development",
                    rating: 5,
                    message: "Excellent course with practical security examples! The instructor was very knowledgeable.",
                    difficulty: "medium",
                    date: "Nov 25, 2024",
                    student: "Lina Ali",
                    timestamp: Date.now() - 86400000
                },
                {
                    id: 2,
                    course: "cyber-fundamentals",
                    courseName: "Cyber Security Fundamental",
                    rating: 4,
                    message: "Great introduction to cybersecurity concepts. The labs were very helpful.",
                    difficulty: "easy",
                    date: "Nov 24, 2024",
                    student: "Sarah Mohammed",
                    timestamp: Date.now() - 172800000
                },
                {
                    id: 3,
                    course: "security-software",
                    courseName: "Security Software Engineering",
                    rating: 5,
                    message: "Challenging but very rewarding course! Learned a lot about secure coding practices.",
                    difficulty: "hard",
                    date: "Nov 23, 2024",
                    student: "Ahmed Ali",
                    timestamp: Date.now() - 259200000
                },
                {
                    id: 4,
                    course: "secure-web-dev",
                    courseName: "Secure Web Development",
                    rating: 4,
                    message: "Good coverage of web security topics. Would recommend for web developers.",
                    difficulty: "medium",
                    date: "Nov 22, 2024",
                    student: "Omar Salman",
                    timestamp: Date.now() - 345600000
                }
            ];
            
            feedbacks = sampleData;
        }
    }
    
    // ========== PUBLIC API ==========
    return {
        // Initialization
        initializeApp: function() {
            try {
                if (!checkSession()) {
                    return;
                }
                
                initializeTheme();
                initializeNotifications();
                addSampleData();
                
                // Add event listeners
                document.getElementById('themeToggler').addEventListener('click', toggleTheme);
                document.getElementById('feedbackForm').addEventListener('submit', addFeedback);
                document.getElementById('logoutBtn').addEventListener('click', logout);
                document.getElementById('notificationToggle').addEventListener('click', toggleNotifications);
                document.getElementById('filterCourse').addEventListener('change', filterFeedbacks);
                document.getElementById('sortFeedback').addEventListener('change', filterFeedbacks);
                
                // Display based on role
                if (currentUser.role === 'admin') {
                    Admin.initializeAdminDashboard();
                } else if (currentUser.role === 'student') {
                    Student.initializeStudentDashboard();
                }
                
            } catch (error) {
                handleError(error, "Failed to initialize application");
            }
        },
        
        // Feedback functions
        setRating: setRating,
        viewFeedbackDetails: function(feedbackId) {
            try {
                const feedback = feedbacks.find(f => f.id === feedbackId);
                if (!feedback) {
                    showNotification('Feedback not found!', "error");
                    return;
                }
                
                const course = courseInfo[feedback.course];
                const message = `
                    📋 Feedback Details:
                    
                    👤 Student: ${feedback.student}
                    📚 Course: ${feedback.courseName}
                    ⭐ Rating: ${feedback.rating}/5
                    📅 Date: ${feedback.date}
                    🎯 Difficulty: ${feedback.difficulty.toUpperCase()}
                    📝 Message: ${feedback.message}
                    
                    ${course ? `📊 Course Category: ${course.category}` : ''}
                `;
                
                alert(message);
            } catch (error) {
                handleError(error, "Failed to view feedback details");
            }
        },
        
        deleteFeedback: function(feedbackId) {
            try {
                if (currentUser.role !== 'admin') {
                    showNotification('Only administrators can delete feedback!', "warning");
                    return;
                }
                
                const feedbackIndex = feedbacks.findIndex(f => f.id === feedbackId);
                if (feedbackIndex === -1) {
                    showNotification('Feedback not found!', "error");
                    return;
                }
                
                const feedback = feedbacks[feedbackIndex];
                
                if (!confirm(`Are you sure you want to delete feedback from "${feedback.student}"?\n\nCourse: ${feedback.courseName}\nRating: ${feedback.rating}/5`)) {
                    return;
                }
                
                feedbacks.splice(feedbackIndex, 1);
                
                updateDashboardStats();
                filterFeedbacks();
                
                if (currentUser.role === 'admin') {
                    Admin.updateCourseTable();
                }
                
                showNotification('Feedback deleted successfully! ✓', "success");
                
            } catch (error) {
                handleError(error, "Failed to delete feedback");
            }
        },
        
        // Getters
        getCurrentUser: function() {
            return currentUser;
        },
        
        getFeedbacks: function() {
            return feedbacks;
        },
        
        getCourseInfo: function() {
            return courseInfo;
        },
        
        // Update functions
        updateDashboardStats: updateDashboardStats,
        filterFeedbacks: filterFeedbacks,
        renderFeedbacks: renderFeedbacks
    };
})
();


