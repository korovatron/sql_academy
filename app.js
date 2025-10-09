class SQLPracticeApp {
    constructor() {
        this.dbManager = new DatabaseManager();
        this.initializeApp();
    }

    async initializeApp() {
        this.showLoading(true);
        
        try {
            await this.dbManager.initialize();
            this.setupEventListeners();
            this.initializeTheme();
            this.handleResponsiveSchema();
            this.showLoading(false);
            this.displayMessage('Database loaded successfully! You can now execute SQL queries.', 'success');
            
            // Initialize schema display
            const schema = this.dbManager.getSchemaInfo();
            this.updateSchemaDisplay(schema);
        } catch (error) {
            this.showLoading(false);
            this.displayMessage(`Failed to initialize database: ${error.message}`, 'error');
        }
    }

    setupEventListeners() {
        // Execute button
        document.getElementById('executeBtn').addEventListener('click', () => {
            this.executeQuery();
        });

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            document.getElementById('sqlInput').value = '';
            this.clearResults();
        });

        // Reset database button
        document.getElementById('resetDbBtn').addEventListener('click', () => {
            this.resetDatabase();
        });

        // Theme toggle button
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Schema toggle button (mobile)
        const schemaToggle = document.getElementById('schemaToggle');
        if (schemaToggle) {
            schemaToggle.addEventListener('click', () => {
                this.toggleSchema();
            });
        }

        // Section toggle functionality - Accordion behavior (only one open at a time)
        document.querySelectorAll('.section-toggle').forEach(toggle => {
            toggle.addEventListener('click', function() {
                const sectionId = this.getAttribute('data-section');
                const content = document.getElementById(sectionId);
                const isCurrentlyCollapsed = content.classList.contains('collapsed');
                
                if (isCurrentlyCollapsed) {
                    // First, collapse all other sections
                    document.querySelectorAll('.section-toggle').forEach(otherToggle => {
                        const otherSectionId = otherToggle.getAttribute('data-section');
                        const otherContent = document.getElementById(otherSectionId);
                        
                        // Collapse all sections
                        otherContent.classList.add('collapsed');
                        otherToggle.classList.add('collapsed');
                    });
                    
                    // Then expand the clicked section
                    content.classList.remove('collapsed');
                    this.classList.remove('collapsed');
                } else {
                    // If clicking on already open section, collapse it
                    content.classList.add('collapsed');
                    this.classList.add('collapsed');
                }
            });
        });

        // Example query buttons - keep existing functionality
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const query = e.target.getAttribute('data-query');
                document.getElementById('sqlInput').value = query;
            });
        });

        // Exercise buttons - new functionality
        document.querySelectorAll('.exercise-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Prevent default button behavior that might interfere with scrolling
                e.preventDefault();
                
                // Remove selected class from all exercise buttons
                document.querySelectorAll('.exercise-btn').forEach(b => b.classList.remove('selected'));
                
                // Add selected class to clicked button
                e.target.classList.add('selected');
                
                // Get exercise data
                const title = e.target.getAttribute('data-title');
                const description = e.target.getAttribute('data-description');
                
                // Display exercise information
                document.getElementById('exerciseTitle').textContent = title;
                document.getElementById('exerciseDescription').textContent = description;
                document.getElementById('exerciseDisplay').style.display = 'block';
                
                // Clear the SQL input for student to write their own query
                document.getElementById('sqlInput').value = '';
                this.clearResults();
                
                // Responsive scroll behavior
                // Use setTimeout to ensure scroll happens after any browser focus changes
                setTimeout(() => {
                    // Check if we're on mobile/tablet portrait (1024px is the breakpoint for desktop layout in CSS)
                    const isMobileOrTablet = window.innerWidth < 1024;
                    
                    if (isMobileOrTablet) {
                        // On mobile/tablet, scroll to the exercise description
                        const exerciseDisplay = document.getElementById('exerciseDisplay');
                        exerciseDisplay.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    } else {
                        // On desktop, scroll to top (exercise description is already visible)
                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                    }
                }, 10);
            });
        });

        // Enter key to execute
        document.getElementById('sqlInput').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.executeQuery();
            }
        });
    }

    executeQuery() {
        let query = document.getElementById('sqlInput').value.trim();
        // Normalize all smart quotes, apostrophes, and similar characters to standard ones
        query = query
            // Double quotes
            .replace(/[“”«»„‟❝❞〝〞＂]/g, '"')
            // Single quotes/apostrophes
            .replace(/[‘’‚‛❛❜⸂⸃⸄⸅⸉⸊⸌⸍´`′‵ʻʼʽʾʿˊˋ˴˵˶˷˸˹˺˻˼˽˾˿]/g, "'");
        // Debug: log the normalized query
        // console.log('Normalized query:', query);
        
        if (!query) {
            this.displayMessage('Please enter a SQL query.', 'error');
            return;
        }

        try {
            const result = this.dbManager.executeQuery(query);
            
            if (result.success) {
                this.displayResults(result.results);
                this.displayMessage(result.message, 'success');
                
                // If schema changed, update the schema display
                if (result.schemaChanged && result.schema) {
                    this.updateSchemaDisplay(result.schema);
                }
            } else {
                this.displayMessage(result.message, 'error');
            }
        } catch (error) {
            this.displayMessage(`Unexpected error: ${error.message}`, 'error');
        }
    }

    updateSchemaDisplay(schema) {
        const schemaContainer = document.querySelector('.schema-container');
        
        if (!schema || schema.length === 0) {
            schemaContainer.innerHTML = '<p>No tables found in database.</p>';
            return;
        }
        
        let html = '';
        schema.forEach(table => {
            html += `
                <div class="table-info">
                    <h4>${this.escapeHtml(table.name)}</h4>
                    <ul>
                        ${table.columns.map(col => {
                            let colText = `${col.name} (${col.type})`;
                            if (col.primaryKey) colText += ' - Primary Key';
                            if (col.foreignKey) colText += ` - Foreign Key → ${col.foreignKey.referencedTable}.${col.foreignKey.referencedColumn}`;
                            if (col.notNull && !col.primaryKey) colText += ' - NOT NULL';
                            if (col.defaultValue !== null) colText += ` - Default: ${col.defaultValue}`;
                            return `<li>${this.escapeHtml(colText)}</li>`;
                        }).join('')}
                    </ul>
                </div>
            `;
        });
        
        schemaContainer.innerHTML = html;
    }

    displayResults(results) {
        const resultsDiv = document.getElementById('results');
        
        if (!results || results.length === 0) {
            resultsDiv.innerHTML = '<p>Query executed successfully. No results to display.</p>';
            return;
        }

        let html = '';
        
        results.forEach((result, index) => {
            if (result.columns && result.columns.length > 0) {
                html += `
                    <div class="result-set">
                        <table class="result-table">
                            <thead>
                                <tr>
                                    ${result.columns.map(col => `<th>${this.escapeHtml(col)}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${result.values.map(row => `
                                    <tr>
                                        ${row.map(cell => `<td>${this.escapeHtml(this.formatCellValue(cell))}</td>`).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        });
        
        if (!html) {
            html = '<p>Query executed successfully. No results to display.</p>';
        }
        
        resultsDiv.innerHTML = html;
    }

    displayMessage(message, type) {
        const resultsDiv = document.getElementById('results');
        const messageDiv = document.createElement('div');
        messageDiv.className = type;
        messageDiv.textContent = message;
        
        // Remove any existing messages
        const existingMessages = resultsDiv.querySelectorAll('.success, .error');
        existingMessages.forEach(msg => msg.remove());
        
        // Add new message at the top
        resultsDiv.insertBefore(messageDiv, resultsDiv.firstChild);
        
        // Auto-remove success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }

    clearResults() {
        document.getElementById('results').innerHTML = '';
    }

    resetDatabase() {
        try {
            const result = this.dbManager.reset();
            this.clearResults();
            this.displayMessage(result.message, result.success ? 'success' : 'error');
            
            // Refresh schema display after reset
            if (result.success) {
                const schema = this.dbManager.getSchemaInfo();
                this.updateSchemaDisplay(schema);
            }
        } catch (error) {
            this.displayMessage(`Failed to reset database: ${error.message}`, 'error');
        }
    }

    showLoading(show) {
        const loadingDiv = document.getElementById('loading');
        loadingDiv.style.display = show ? 'flex' : 'none';
    }

    formatCellValue(value) {
        if (value === null) return 'NULL';
        if (value === undefined) return '';
        if (typeof value === 'string') return value;
        return String(value);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    initializeTheme() {
        // Set dark theme as default on first load
        const savedTheme = localStorage.getItem('sql-practice-theme');
        if (!savedTheme) {
            // First time visitor - set dark theme as default
            document.body.classList.add('dark-theme');
            localStorage.setItem('sql-practice-theme', 'dark');
            this.updateThemeIcon(true);
        } else {
            // Returning visitor - use saved preference
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
                this.updateThemeIcon(true);
            } else {
                document.body.classList.remove('dark-theme');
                this.updateThemeIcon(false);
            }
        }
    }

    toggleTheme() {
        const isDark = document.body.classList.contains('dark-theme');
        
        if (isDark) {
            // Switch to light mode
            document.body.classList.remove('dark-theme');
            localStorage.setItem('sql-practice-theme', 'light');
            this.updateThemeIcon(false);
        } else {
            // Switch to dark mode
            document.body.classList.add('dark-theme');
            localStorage.setItem('sql-practice-theme', 'dark');
            this.updateThemeIcon(true);
        }
    }

    updateThemeIcon(isDark) {
        const themeIcon = document.querySelector('.theme-icon');
        const themeButton = document.getElementById('themeToggle');
        
        if (isDark) {
            themeIcon.textContent = '☀️';
            themeButton.setAttribute('aria-label', 'Switch to light mode');
        } else {
            themeIcon.textContent = '🌙';
            themeButton.setAttribute('aria-label', 'Switch to dark mode');
        }
    }

    toggleSchema() {
        const schemaContainer = document.getElementById('schemaContainer');
        const schemaToggle = document.getElementById('schemaToggle');
        
        // Mark that user has manually toggled the schema
        schemaContainer.setAttribute('data-user-toggled', 'true');
        
        if (schemaContainer.classList.contains('collapsed')) {
            // Expand schema
            schemaContainer.classList.remove('collapsed');
            schemaToggle.classList.remove('collapsed');
            schemaToggle.setAttribute('aria-label', 'Hide schema');
        } else {
            // Collapse schema
            schemaContainer.classList.add('collapsed');
            schemaToggle.classList.add('collapsed');
            schemaToggle.setAttribute('aria-label', 'Show schema');
        }
    }

    handleResponsiveSchema() {
        // Set up resize listener to handle desktop/mobile transitions
        window.addEventListener('resize', () => {
            this.checkSchemaVisibility();
        });
        
        // Initial check
        this.checkSchemaVisibility();
    }

    checkSchemaVisibility() {
        const schemaContainer = document.getElementById('schemaContainer');
        const schemaToggle = document.getElementById('schemaToggle');
        
        // Check if we're in desktop mode (> 768px)
        if (window.innerWidth > 768) {
            // Desktop mode - always show schema and reset toggle
            schemaContainer.classList.remove('collapsed');
            schemaToggle.classList.remove('collapsed');
            schemaToggle.setAttribute('aria-label', 'Hide schema');
        } else {
            // Mobile mode - collapse schema by default if not already set
            if (!schemaContainer.hasAttribute('data-user-toggled')) {
                schemaContainer.classList.add('collapsed');
                schemaToggle.classList.add('collapsed');
                schemaToggle.setAttribute('aria-label', 'Show schema');
            }
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SQLPracticeApp();
});

// Add some helpful keyboard shortcuts info
document.addEventListener('DOMContentLoaded', () => {
    const helpText = document.createElement('div');
    helpText.innerHTML = `
        <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
            💡 <strong>Tip:</strong> Press Ctrl+Enter to execute your query quickly!
        </p>
    `;
    document.querySelector('.sql-editor').appendChild(helpText);
});