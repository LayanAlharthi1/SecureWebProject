// ============================================
// ADMIN SPECIFIC FUNCTIONALITY
// ============================================

const Admin = (function() {
    // ========== PRIVATE VARIABLES ==========
    let allTableData = [];
    let displayedTableData = [];
    
    // ========== PRIVATE FUNCTIONS ==========
    
    function calculateCourseStats() {
        const stats = {};
        const courseInfo = Dashboard.getCourseInfo();
        const feedbacks = Dashboard.getFeedbacks();
        
        Object.keys(courseInfo).forEach(courseId => {
            stats[courseId] = {
                totalRatings: 0,
                count: 0,
                difficulties: [],
                avgRating: 0,
                category: courseInfo[courseId].category,
                name: courseInfo[courseId].name
            };
        });
        
        feedbacks.forEach(feedback => {
            if (stats[feedback.course]) {
                stats[feedback.course].totalRatings += feedback.rating;
                stats[feedback.course].count++;
                stats[feedback.course].difficulties.push(feedback.difficulty);
            }
        });
        
        Object.keys(stats).forEach(courseId => {
            stats[courseId].avgRating = stats[courseId].count > 0 
                ? (stats[courseId].totalRatings / stats[courseId].count).toFixed(1)
                : 0;
        });
        
        return stats;
    }
    
    function prepareAllTableData() {
        const courseStats = calculateCourseStats();
        const courseInfo = Dashboard.getCourseInfo();
        
        allTableData = [];
        
        Object.keys(courseInfo).forEach(courseId => {
            const info = courseInfo[courseId];
            const stats = courseStats[courseId];
            
            let difficulty = info.difficulty;
            if (stats.difficulties.length > 0) {
                const difficultyCount = {};
                stats.difficulties.forEach(d => {
                    difficultyCount[d] = (difficultyCount[d] || 0) + 1;
                });
                
                const mostCommon = Object.keys(difficultyCount).reduce((a, b) => 
                    difficultyCount[a] > difficultyCount[b] ? a : b
                );
                difficulty = mostCommon;
            }
            
            allTableData.push({
                id: courseId,
                name: info.name,
                category: info.category,
                avgRating: parseFloat(stats.avgRating),
                difficulty: difficulty,
                totalFeedback: stats.count,
                status: stats.count > 0 ? 'Active' : 'No Feedback'
            });
        });
        
        displayedTableData = [...allTableData];
    }
    
    function renderTable() {
        const tbody = document.getElementById('courseTableBody');
        
        try {
            tbody.innerHTML = '';
            
            if (displayedTableData.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; color: var(--clr-info-dark); padding: 2rem;">
                            No courses match the selected filters
                        </td>
                    </tr>
                `;
                return;
            }
            
            displayedTableData.forEach(course => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${course.name}</td>
                    <td>${course.category}</td>
                    <td><span class="rating-number">${course.avgRating}</span>/5</td>
                    <td><span class="difficulty-badge difficulty-${course.difficulty}">
                        ${course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                    </span></td>
                    <td>${course.totalFeedback}</td>
                    <td>${course.status}</td>
                `;
                tbody.appendChild(row);
            });
            
        } catch (error) {
            console.error("Failed to render table:", error);
        }
    }
    
    function filterTable() {
        try {
            const categoryFilter = document.getElementById('filterCategory').value;
            const statusFilter = document.getElementById('filterStatus').value;
            const sortOption = document.getElementById('sortTable').value;
            
            let filteredData = [...allTableData];
            
            if (categoryFilter) {
                filteredData = filteredData.filter(item => item.category === categoryFilter);
            }
            
            if (statusFilter) {
                filteredData = filteredData.filter(item => item.status === statusFilter);
            }
            
            switch(sortOption) {
                case 'name-asc':
                    filteredData.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    filteredData.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                case 'rating-desc':
                    filteredData.sort((a, b) => b.avgRating - a.avgRating);
                    break;
                case 'rating-asc':
                    filteredData.sort((a, b) => a.avgRating - b.avgRating);
                    break;
                case 'feedback-desc':
                    filteredData.sort((a, b) => b.totalFeedback - a.totalFeedback);
                    break;
                case 'feedback-asc':
                    filteredData.sort((a, b) => a.totalFeedback - b.totalFeedback);
                    break;
            }
            
            displayedTableData = filteredData;
            renderTable();
            
        } catch (error) {
            console.error("Failed to filter table:", error);
        }
    }
    
    // ========== PUBLIC API ==========
    return {
        initializeAdminDashboard: function() {
            const currentUser = Dashboard.getCurrentUser();
            
            try {
                // Update UI
                document.getElementById('dashboardTitle').textContent = 'Admin Dashboard';
                document.getElementById('welcomeMsg').textContent = `Welcome, Admin ${currentUser.name}`;
                document.getElementById('feedbackTitle').textContent = 'All Feedback';
                
                // Show role indicator
                const roleIndicator = document.getElementById('roleIndicator');
                const indicatorContent = document.getElementById('indicatorContent');
                roleIndicator.style.display = 'block';
                indicatorContent.className = 'indicator admin';
                indicatorContent.innerHTML = '<span>🛡️ ADMIN VIEW - Seeing all feedback</span>';
                
                // Add admin class to body
                document.body.classList.add('admin');
                
                // Update form for admin
                const studentNameInput = document.getElementById('studentName');
                studentNameInput.readOnly = false;
                studentNameInput.placeholder = "Enter student name";
                
                // Update dashboard stats
                Dashboard.updateDashboardStats();
                Dashboard.filterFeedbacks();
                
                // Initialize table
                this.updateCourseTable();
                
                // Add event listeners for table filters
                document.getElementById('filterCategory').addEventListener('change', filterTable);
                document.getElementById('filterStatus').addEventListener('change', filterTable);
                document.getElementById('sortTable').addEventListener('change', filterTable);
                
                // Show notification
                Dashboard.showNotification("Admin dashboard loaded", "success");
                
            } catch (error) {
                console.error("Failed to initialize admin dashboard:", error);
            }
        },
        
        updateCourseTable: function() {
            prepareAllTableData();
            renderTable();
        },
        
        filterTable: filterTable,
        sortTable: filterTable
    };
})();