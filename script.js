// Global variables
let tasks = [];
let currentView = 'dashboard';
let isDarkMode = true;

// Sample initial tasks
const initialTasks = [
    {
        id: 1,
        title: "Study for database select/view/update test",
        subject: "Databases",
        priority: "high",
        status: "completed",
        dueDate: "2024-11-15",
        description: "Focus on SQL queries, views, and update operations"
    },
    {
        id: 2,
        title: "Prepare for AI quiz",
        subject: "Artificial Intelligence",
        priority: "high",
        status: "not-started",
        dueDate: "2024-11-20",
        description: "Review machine learning algorithms and neural networks"
    },
    {
        id: 3,
        title: "Prepare for compiler design quiz",
        subject: "Compiler Design",
        priority: "high",
        status: "not-started",
        dueDate: "2024-11-22",
        description: "Study lexical analysis and parsing techniques"
    },
    {
        id: 4,
        title: "Study for operating system CAT 1",
        subject: "Operating Systems",
        priority: "medium",
        status: "in-progress",
        dueDate: "2024-11-18",
        description: "Cover process management and memory allocation"
    },
    {
        id: 5,
        title: "Complete computer networks lab work",
        subject: "Computer Networks",
        priority: "medium",
        status: "in-progress",
        dueDate: "2024-11-25",
        description: "Implement TCP/IP socket programming"
    },
    {
        id: 6,
        title: "Work on leetcode problems for acc class",
        subject: "Algorithms",
        priority: "low",
        status: "not-started",
        dueDate: "2024-11-30",
        description: "Practice dynamic programming and graph algorithms"
    }
];

// Initialize application
function initApp() {
    // Load tasks from localStorage or use initial tasks
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    } else {
        tasks = [...initialTasks];
        saveTasks();
    }
    
    updateDashboard();
    renderTasks();
    updateFilters();
    
    // Set up form submission
    document.getElementById('add-task-form').addEventListener('submit', handleAddTask);
    
    // Set up filter listeners
    document.getElementById('filter-status').addEventListener('change', applyFilters);
    document.getElementById('filter-priority').addEventListener('change', applyFilters);
    document.getElementById('filter-subject').addEventListener('change', applyFilters);
    document.getElementById('search-tasks').addEventListener('input', applyFilters);
    
    // Set current date as default in date picker
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('task-due-date').value = today;
    
    // Show dashboard by default
    showView('dashboard');
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Navigation functions
function showView(viewName) {
    // Hide all views
    document.querySelectorAll('.view-content').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Show selected view
    document.getElementById(viewName + '-view').classList.remove('hidden');
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active', 'text-white');
        btn.classList.add('text-gray-300');
    });
    
    const activeBtn = document.querySelector(`[data-view="${viewName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'text-white');
        activeBtn.classList.remove('text-gray-300');
    }
    
    currentView = viewName;
    
    // Update view-specific content
    if (viewName === 'analytics') {
        updateAnalytics();
    } else if (viewName === 'dashboard') {
        updateDashboard();
    } else if (viewName === 'tasks') {
        applyFilters();
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    const html = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');
    
    if (isDarkMode) {
        html.classList.add('dark');
        themeIcon.textContent = '🌙';
        document.body.className = 'bg-gray-950 text-gray-100 font-inter antialiased min-h-screen';
    } else {
        html.classList.remove('dark');
        themeIcon.textContent = '☀️';
        document.body.className = 'bg-white text-gray-900 font-inter antialiased min-h-screen';
    }
}

// Modal functions
function showAddTaskModal() {
    document.getElementById('add-task-modal').classList.remove('hidden');
    document.getElementById('task-title').focus();
}

function hideAddTaskModal() {
    document.getElementById('add-task-modal').classList.add('hidden');
    document.getElementById('add-task-form').reset();
}

function handleAddTask(e) {
    e.preventDefault();
    
    const newTask = {
        id: Date.now(),
        title: document.getElementById('task-title').value,
        subject: document.getElementById('task-subject').value,
        priority: document.getElementById('task-priority').value,
        status: 'not-started',
        dueDate: document.getElementById('task-due-date').value,
        description: document.getElementById('task-description').value
    };
    
    tasks.push(newTask);
    saveTasks();
    updateDashboard();
    renderTasks();
    updateFilters();
    hideAddTaskModal();
    
    // If we're not on the tasks view, show a toast notification
    if (currentView !== 'tasks') {
        showToast('Task added successfully!');
    }
}

// Dashboard functions
function updateDashboard() {
    // Update status counts
    const notStarted = tasks.filter(task => task.status === 'not-started').length;
    const inProgress = tasks.filter(task => task.status === 'in-progress').length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    
    document.getElementById('not-started-count').textContent = notStarted;
    document.getElementById('in-progress-count').textContent = inProgress;
    document.getElementById('completed-count').textContent = completed;
    
    // Update urgent tasks (due in 3 days or less)
    const urgentTasks = tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        return daysDiff <= 3 && task.status !== 'completed';
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
    
    const urgentContainer = document.getElementById('urgent-tasks');
    urgentContainer.innerHTML = urgentTasks.length === 0 ? 
        '<p class="text-gray-500">No urgent tasks! 🎉</p>' :
        urgentTasks.map(task => createTaskCard(task, 'small')).join('');
    
    // Update this week's tasks
    const thisWeekTasks = tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return dueDate >= startOfWeek && dueDate <= endOfWeek && task.status !== 'completed';
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
    
    const weekContainer = document.getElementById('this-week-tasks');
    weekContainer.innerHTML = thisWeekTasks.length === 0 ?
        '<p class="text-gray-500">No tasks due this week! 🎉</p>' :
        thisWeekTasks.map(task => createTaskCard(task, 'small')).join('');
    
    // Update subject breakdown
    const subjectBreakdown = tasks.reduce((acc, task) => {
        acc[task.subject] = (acc[task.subject] || 0) + 1;
        return acc;
    }, {});
    
    const subjectContainer = document.getElementById('subject-breakdown');
    subjectContainer.innerHTML = Object.entries(subjectBreakdown).map(([subject, count]) => `
        <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-colors">
            <h4 class="font-semibold text-white">${subject}</h4>
            <p class="text-2xl font-bold text-purple-400">${count}</p>
            <p class="text-sm text-gray-400">tasks</p>
        </div>
    `).join('');
}

// Task rendering functions
function renderTasks() {
    applyFilters();
}

function createTaskCard(task, size = 'full') {
    const priorityColors = {
        high: 'border-red-500 bg-red-900/20',
        medium: 'border-yellow-500 bg-yellow-900/20',
        low: 'border-green-500 bg-green-900/20'
    };
    
    const statusColors = {
        'not-started': 'text-red-400',
        'in-progress': 'text-yellow-400',
        'completed': 'text-green-400'
    };
    
    const statusIcons = {
        'not-started': '⏳',
        'in-progress': '🔄',
        'completed': '✅'
    };
    
    const formattedDate = formatDateForDisplay(task.dueDate);
    
    if (size === 'small') {
        return `
            <div class="bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-purple-500 transition-colors">
                <div class="flex items-center justify-between">
                    <h4 class="font-medium text-sm">${task.title}</h4>
                    <span class="${statusColors[task.status]}">${statusIcons[task.status]}</span>
                </div>
                <div class="flex items-center justify-between mt-1">
                    <p class="text-xs text-gray-400">${task.subject}</p>
                    <p class="text-xs ${formattedDate === 'Overdue' ? 'text-red-400' : 'text-gray-400'}">${formattedDate}</p>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="bg-gray-900/50 rounded-xl p-6 border ${priorityColors[task.priority]} hover:scale-[1.02] transition-transform">
            <div class="flex items-start justify-between mb-4">
                <h3 class="font-semibold text-lg">${task.title}</h3>
                <div class="flex items-center space-x-2">
                    <span class="${statusColors[task.status]} text-xl">${statusIcons[task.status]}</span>
                    <select onchange="updateTaskStatus(${task.id}, this.value)" class="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white">
                        <option value="not-started" ${task.status === 'not-started' ? 'selected' : ''}>Not Started</option>
                        <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
            </div>
            
            <div class="space-y-2 mb-4">
                <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-400">Subject:</span>
                    <span class="text-purple-400">${task.subject}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-400">Priority:</span>
                    <span class="${task.priority === 'high' ? 'text-red-400' : task.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'} capitalize">${task.priority}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-400">Due Date:</span>
                    <span class="${formattedDate === 'Overdue' ? 'text-red-400' : 'text-white'}">${formattedDate}</span>
                </div>
            </div>
            
            ${task.description ? `<p class="text-gray-300 text-sm mb-4">${task.description}</p>` : ''}
            
            <div class="flex space-x-2">
                <button onclick="editTask(${task.id})" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                    Edit
                </button>
                <button onclick="deleteTask(${task.id})" class="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                    Delete
                </button>
            </div>
        </div>
    `;
}

// Task management functions
function updateTaskStatus(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = newStatus;
        saveTasks();
        updateDashboard();
        renderTasks();
        updateAnalytics();
        showToast('Task status updated!');
    }
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        updateDashboard();
        renderTasks();
        updateFilters();
        updateAnalytics();
        showToast('Task deleted successfully');
    }
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        // Populate form with existing task data
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-subject').value = task.subject;
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-due-date').value = task.dueDate;
        document.getElementById('task-description').value = task.description || '';
        
        // Change form behavior to edit mode
        const form = document.getElementById('add-task-form');
        form.onsubmit = function(e) {
            e.preventDefault();
            
            task.title = document.getElementById('task-title').value;
            task.subject = document.getElementById('task-subject').value;
            task.priority = document.getElementById('task-priority').value;
            task.dueDate = document.getElementById('task-due-date').value;
            task.description = document.getElementById('task-description').value;
            
            saveTasks();
            updateDashboard();
            renderTasks();
            updateFilters();
            updateAnalytics();
            hideAddTaskModal();
            
            // Reset form behavior
            form.onsubmit = handleAddTask;
            showToast('Task updated successfully!');
        };
        
        showAddTaskModal();
        document.querySelector('#add-task-modal h2').textContent = 'Edit Task';
    }
}

// Filter functions
function updateFilters() {
    const subjectFilter = document.getElementById('filter-subject');
    const subjects = [...new Set(tasks.map(task => task.subject))].sort();
    
    subjectFilter.innerHTML = '<option value="">All Subjects</option>';
    subjects.forEach(subject => {
        subjectFilter.innerHTML += `<option value="${subject}">${subject}</option>`;
    });
}

function applyFilters() {
    const statusFilter = document.getElementById('filter-status').value;
    const priorityFilter = document.getElementById('filter-priority').value;
    const subjectFilter = document.getElementById('filter-subject').value;
    const searchTerm = document.getElementById('search-tasks').value.toLowerCase();
    
    let filteredTasks = tasks;
    
    // Apply search filter
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) ||
            task.subject.toLowerCase().includes(searchTerm) ||
            (task.description && task.description.toLowerCase().includes(searchTerm))
        );
    }
    
    if (statusFilter) {
        filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }
    
    if (priorityFilter) {
        filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }
    
    if (subjectFilter) {
        filteredTasks = filteredTasks.filter(task => task.subject === subjectFilter);
    }
    
    // Sort tasks by due date by default
    filteredTasks = sortTasks(filteredTasks, 'due-date');
    
    const container = document.getElementById('tasks-container');
    if (filteredTasks.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-gray-400 text-lg mb-2">📭</div>
                <p class="text-gray-400">No tasks match your current filters</p>
                <button onclick="clearFilters()" class="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                    Clear Filters
                </button>
            </div>
        `;
    } else {
        container.innerHTML = filteredTasks.map(task => createTaskCard(task)).join('');
    }
}

function sortTasks(tasksArray, sortBy) {
    const sortedTasks = [...tasksArray];
    
    switch (sortBy) {
        case 'due-date':
            return sortedTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return sortedTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        case 'subject':
            return sortedTasks.sort((a, b) => a.subject.localeCompare(b.subject));
        case 'status':
            const statusOrder = { 'not-started': 3, 'in-progress': 2, 'completed': 1 };
            return sortedTasks.sort((a, b) => statusOrder[b.status] - statusOrder[a.status]);
        default:
            return sortedTasks;
    }
}

function clearFilters() {
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-priority').value = '';
    document.getElementById('filter-subject').value = '';
    document.getElementById('search-tasks').value = '';
    applyFilters();
}

// Analytics functions
function updateAnalytics() {
    // Completion rate
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    document.getElementById('completion-rate').textContent = completionRate + '%';
    
    // Priority distribution
    const priorityStats = {
        high: tasks.filter(task => task.priority === 'high').length,
        medium: tasks.filter(task => task.priority === 'medium').length,
        low: tasks.filter(task => task.priority === 'low').length
    };
    
    const priorityContainer = document.getElementById('priority-chart');
    const totalForPriority = priorityStats.high + priorityStats.medium + priorityStats.low;
    
    priorityContainer.innerHTML = `
        <div class="space-y-3">
            <div class="flex items-center justify-between">
                <span class="text-red-400">High Priority</span>
                <span class="text-white">${priorityStats.high}</span>
                <div class="flex-1 ml-4">
                    <div class="bg-gray-700 rounded-full h-2">
                        <div class="bg-red-400 h-2 rounded-full" style="width: ${totalForPriority > 0 ? (priorityStats.high / totalForPriority) * 100 : 0}%"></div>
                    </div>
                </div>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-yellow-400">Medium Priority</span>
                <span class="text-white">${priorityStats.medium}</span>
                <div class="flex-1 ml-4">
                    <div class="bg-gray-700 rounded-full h-2">
                        <div class="bg-yellow-400 h-2 rounded-full" style="width: ${totalForPriority > 0 ? (priorityStats.medium / totalForPriority) * 100 : 0}%"></div>
                    </div>
                </div>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-green-400">Low Priority</span>
                <span class="text-white">${priorityStats.low}</span>
                <div class="flex-1 ml-4">
                    <div class="bg-gray-700 rounded-full h-2">
                        <div class="bg-green-400 h-2 rounded-full" style="width: ${totalForPriority > 0 ? (priorityStats.low / totalForPriority) * 100 : 0}%"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Productivity insights
    const today = new Date();
    const overdueTasks = tasks.filter(task => new Date(task.dueDate) < today && task.status !== 'completed').length;
    const urgentTasks = tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        return daysDiff <= 3 && daysDiff >= 0 && task.status !== 'completed';
    }).length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    
    document.getElementById('productivity-insights').innerHTML = `
        <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div class="flex justify-between items-center mb-3">
                <span class="text-gray-300">📍 Tasks in progress:</span>
                <span class="text-yellow-400 font-semibold">${inProgressTasks}</span>
            </div>
            <div class="flex justify-between items-center mb-3">
                <span class="text-gray-300">⚠️ Urgent tasks (≤3 days):</span>
                <span class="text-orange-400 font-semibold">${urgentTasks}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-300">🚨 Overdue tasks:</span>
                <span class="text-red-400 font-semibold">${overdueTasks}</span>
            </div>
        </div>
        <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 class="text-sm font-medium text-gray-300 mb-2">Productivity Tip</h4>
            <p class="text-xs text-gray-400">
                ${getProductivityTip(completionRate, overdueTasks, urgentTasks)}
            </p>
        </div>
        <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 class="text-sm font-medium text-gray-300 mb-2">Completion Goal</h4>
            <div class="w-full bg-gray-700 rounded-full h-2.5">
                <div class="bg-purple-600 h-2.5 rounded-full" style="width: ${completionRate}%"></div>
            </div>
            <p class="text-xs text-gray-400 mt-2">${completionRate}% of tasks completed</p>
        </div>
    `;
    
    // Subject performance
    const subjectStats = tasks.reduce((acc, task) => {
        if (!acc[task.subject]) {
            acc[task.subject] = { total: 0, completed: 0 };
        }
        acc[task.subject].total++;
        if (task.status === 'completed') {
            acc[task.subject].completed++;
        }
        return acc;
    }, {});
    
    document.getElementById('subject-performance').innerHTML = Object.entries(subjectStats)
        .sort((a, b) => b[1].completed - a[1].completed)
        .map(([subject, stats]) => {
            const percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            return `
                <div class="flex items-center justify-between mb-2">
                    <span class="text-gray-300 text-sm">${subject}</span>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs text-gray-400">${stats.completed}/${stats.total}</span>
                        <div class="w-16 bg-gray-700 rounded-full h-1.5">
                            <div class="bg-purple-400 h-1.5 rounded-full" style="width: ${percentage}%"></div>
                        </div>
                        <span class="text-xs text-white font-medium w-8">${percentage}%</span>
                    </div>
                </div>
            `;
        })
        .join('');
}

function getProductivityTip(completionRate, overdueTasks, urgentTasks) {
    if (overdueTasks > 0) {
        return "🎯 Focus on completing overdue tasks first to get back on track!";
    } else if (urgentTasks > 3) {
        return "⚡ You have several urgent deadlines coming up. Consider breaking large tasks into smaller ones.";
    } else if (completionRate >= 80) {
        return "🌟 Great job! You're maintaining excellent task completion rates!";
    } else if (completionRate >= 60) {
        return "📈 Good progress! Try to tackle high-priority items during your most productive hours.";
    } else {
        return "💪 Start small! Pick one task to complete today and build momentum.";
    }
}

// Utility functions
function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'Overdue';
    if (daysDiff === 0) return 'Due Today';
    if (daysDiff === 1) return 'Due Tomorrow';
    if (daysDiff <= 7) return `Due in ${daysDiff} days`;
    
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg border border-gray-700 z-50 animate-fade-in';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('animate-fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', initApp);

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('add-task-modal');
    if (e.target === modal) {
        hideAddTaskModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape to close modal
    if (e.key === 'Escape') {
        hideAddTaskModal();
    }
    
    // Ctrl/Cmd + N to add new task
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        showAddTaskModal();
    }
});