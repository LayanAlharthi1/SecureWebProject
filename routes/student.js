// ============================================
// STUDENT SPECIFIC FUNCTIONALITY
// ============================================

const Student = (function() {
    // ========== PUBLIC API ==========
    return {
        initializeStudentDashboard: function() {
            const currentUser = Dashboard.getCurrentUser();
            
            try {
                // Update UI
                document.getElementById('dashboardTitle').textContent = 'Student Dashboard';
                document.getElementById('welcomeMsg').textContent = `Welcome, ${currentUser.name}`;
                document.getElementById('feedbackTitle').textContent = 'Your Feedback';
                
                // Show role indicator
                const roleIndicator = document.getElementById('roleIndicator');
                const indicatorContent = document.getElementById('indicatorContent');
                roleIndicator.style.display = 'block';
                indicatorContent.className = 'indicator student';
                indicatorContent.innerHTML = '<span>👤 STUDENT VIEW - Seeing your feedback only</span>';
                
                // Add student class to body
                document.body.classList.add('student');
                
                // Update form for student
                const studentNameInput = document.getElementById('studentName');
                studentNameInput.value = currentUser.studentName;
                studentNameInput.readOnly = true;
                
                // Update dashboard stats and feedback
                Dashboard.updateDashboardStats();
                Dashboard.filterFeedbacks();
                
                // Show notification
                Dashboard.showNotification("Student dashboard loaded", "success");
                
            } catch (error) {
                console.error("Failed to initialize student dashboard:", error);
            }
        }
    };
})();