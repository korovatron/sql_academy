class SQLPracticeApp {
    constructor() {
        this.dbManager = new DatabaseManager();
        this.sqlEditor = null; // CodeMirror editor instance
        this.progressTracker = new ExerciseProgressTracker();
        this.initializeApp();
    }

    async initializeApp() {
        this.showLoading(true);
        
        try {
            await this.dbManager.initialize();
            this.initializeCodeMirror();
            this.setupEventListeners();
            this.initializeTheme();
            this.handleResponsiveSchema();
            this.progressTracker.initialize();
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

    initializeCodeMirror() {
        const textarea = document.getElementById('sqlInput');
        
        // Detect mobile/touch devices
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        this.sqlEditor = CodeMirror.fromTextArea(textarea, {
            mode: 'text/x-sql',
            theme: document.body.classList.contains('dark-theme') ? 'dracula' : 'default',
            lineNumbers: !isMobile, // Hide line numbers on mobile for more space
            matchBrackets: true,
            indentUnit: 2,
            smartIndent: true,
            lineWrapping: true,
            scrollbarStyle: isMobile ? null : 'native', // Better scrolling on mobile
            extraKeys: {
                'Ctrl-Enter': () => this.executeQuery(),
                'Ctrl-Space': 'autocomplete'
            },
            placeholder: 'Enter your SQL query here...\nExample: SELECT * FROM Heroes WHERE PowerLevel > 90;'
        });
        
        // Auto-trigger hints on typing
        this.sqlEditor.on('inputRead', (cm, change) => {
            if (change.text[0].match(/[a-zA-Z]/)) {
                CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
            }
        });
        
        // Handle autocomplete selections - capitalize keywords when selected
        this.sqlEditor.on('endCompletion', (cm) => {
            // Small delay to let autocomplete finish, then capitalize if needed
            setTimeout(() => {
                this.autoCapitalizeFromAutocomplete();
            }, 50);
        });
        
        // Auto-capitalize SQL keywords when user finishes typing them (but not from autocomplete)
        this.sqlEditor.on('inputRead', (cm, change) => {
            // Check if user just typed a space, punctuation, or newline (indicating end of word)
            // Skip if this is from autocomplete origin
            if (change.text[0].match(/[\s,;()\n]/) && change.origin !== '+autocomplete' && change.origin !== 'complete') {
                this.autoCapitalizeKeywords();
            }
        });
        
        // iOS/Mobile specific fixes
        if (isMobile) {
            // Prevent iOS zoom when focusing
            const cmElement = this.sqlEditor.getWrapperElement();
            cmElement.style.fontSize = '16px';
            
            // iOS-specific: prevent unwanted scroll behavior without forcing scroll to top
            if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                // Save the current scroll position when focusing
                let savedScrollTop = 0;
                
                this.sqlEditor.on('beforeChange', () => {
                    savedScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                });
                
                // Prevent any unwanted scrolling during focus/blur
                this.sqlEditor.on('focus', () => {
                    // Don't force scroll to top - just prevent unwanted jumps
                    document.body.style.position = 'relative';
                });
                
                this.sqlEditor.on('blur', () => {
                    document.body.style.position = '';
                });
            }
        }
    }

    autoCapitalizeFromAutocomplete() {
        const cursor = this.sqlEditor.getCursor();
        const line = this.sqlEditor.getLine(cursor.line);
        
        // Define SQL keywords that should be capitalized
        const sqlKeywords = [
            'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
            'ON', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL', 'AS',
            'ORDER', 'BY', 'ASC', 'DESC', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET',
            'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
            'ALTER', 'DROP', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
            'UNIQUE', 'CHECK', 'DEFAULT', 'AUTO_INCREMENT', 'CONSTRAINT',
            'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DISTINCT', 'ALL', 'ANY', 'SOME',
            'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IF', 'COALESCE',
            'CAST', 'CONVERT', 'SUBSTRING', 'LENGTH', 'UPPER', 'LOWER', 'TRIM',
            'UNION', 'INTERSECT', 'EXCEPT', 'WITH', 'RECURSIVE'
        ];
        
        // Check if the word just completed is a SQL keyword
        const beforeCursor = line.substring(0, cursor.ch);
        const wordMatch = beforeCursor.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*$/);
        
        if (wordMatch) {
            const word = wordMatch[1];
            const wordUpper = word.toUpperCase();
            
            // Check if this word is a SQL keyword and is currently lowercase/mixed case
            if (sqlKeywords.includes(wordUpper) && word !== wordUpper) {
                const wordStart = beforeCursor.length - wordMatch[0].length + (wordMatch[0].length - word.length);
                const wordEnd = wordStart + word.length;
                
                // iOS-specific handling to prevent scroll-to-top
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                
                if (isMobile) {
                    // On mobile, use a more careful approach to prevent unwanted scrolling
                    const savedScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const savedCursor = this.sqlEditor.getCursor();
                    
                    // Replace the word with its uppercase version
                    this.sqlEditor.replaceRange(
                        wordUpper,
                        { line: cursor.line, ch: wordStart },
                        { line: cursor.line, ch: wordEnd }
                    );
                    
                    // Restore cursor position and prevent any focus/scroll changes
                    this.sqlEditor.setCursor(savedCursor);
                    
                    // Prevent any scroll changes with multiple methods
                    requestAnimationFrame(() => {
                        window.scrollTo(0, savedScrollTop);
                        document.documentElement.scrollTop = savedScrollTop;
                        document.body.scrollTop = savedScrollTop;
                    });
                    
                    // Additional safety for iOS
                    setTimeout(() => {
                        if (window.pageYOffset !== savedScrollTop) {
                            window.scrollTo(0, savedScrollTop);
                        }
                    }, 100);
                } else {
                    // Desktop - standard replacement
                    this.sqlEditor.replaceRange(
                        wordUpper,
                        { line: cursor.line, ch: wordStart },
                        { line: cursor.line, ch: wordEnd }
                    );
                }
            }
        }
    }

    autoCapitalizeKeywords() {
        const cursor = this.sqlEditor.getCursor();
        const line = this.sqlEditor.getLine(cursor.line);
        
        // Define SQL keywords that should be capitalized
        const sqlKeywords = [
            'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
            'ON', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL', 'AS',
            'ORDER', 'BY', 'ASC', 'DESC', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET',
            'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
            'ALTER', 'DROP', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
            'UNIQUE', 'CHECK', 'DEFAULT', 'AUTO_INCREMENT', 'CONSTRAINT',
            'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DISTINCT', 'ALL', 'ANY', 'SOME',
            'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IF', 'COALESCE',
            'CAST', 'CONVERT', 'SUBSTRING', 'LENGTH', 'UPPER', 'LOWER', 'TRIM',
            'UNION', 'INTERSECT', 'EXCEPT', 'WITH', 'RECURSIVE'
        ];
        
        // Look for the word just before the cursor (before the character just typed)
        const beforeCursor = line.substring(0, cursor.ch - 1);
        const wordMatch = beforeCursor.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*$/);
        
        if (wordMatch) {
            const word = wordMatch[1];
            const wordUpper = word.toUpperCase();
            
            // Check if this word is a SQL keyword and is currently lowercase/mixed case
            if (sqlKeywords.includes(wordUpper) && word !== wordUpper) {
                const wordStart = beforeCursor.length - wordMatch[0].length + (wordMatch[0].length - word.length);
                const wordEnd = wordStart + word.length;
                
                // Preserve scroll position on iOS during replacement
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                let savedScrollTop;
                
                if (isMobile) {
                    savedScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                }
                
                // Replace the word with its uppercase version
                this.sqlEditor.replaceRange(
                    wordUpper,
                    { line: cursor.line, ch: wordStart },
                    { line: cursor.line, ch: wordEnd }
                );
                
                // Restore scroll position on iOS
                if (isMobile && savedScrollTop !== undefined) {
                    // Use requestAnimationFrame to ensure the scroll happens after the DOM update
                    requestAnimationFrame(() => {
                        window.scrollTo(0, savedScrollTop);
                    });
                }
            }
        }
    }

    setupEventListeners() {
        // Execute button
        document.getElementById('executeBtn').addEventListener('click', () => {
            this.executeQuery();
        });

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.sqlEditor.setValue('');
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
                this.sqlEditor.setValue(query);
            });
        });

        // Exercise button event delegation
        document.querySelector('.examples, .exercise-sections').addEventListener('click', (e) => {
            if (e.target.classList.contains('exercise-btn')) {
                const exerciseNumber = e.target.dataset.exercise;
                const title = e.target.dataset.title;
                const description = e.target.dataset.description;
                this.displayExercise(exerciseNumber, title, description);
            }
        });

        // Example query buttons
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.dataset.query;
                this.sqlEditor.setValue(query);
            });
        });
    }

    executeQuery() {
        let query = this.sqlEditor.getValue().trim();
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
                
                // Save the successful query for this exercise
                if (this.currentExercise) {
                    this.progressTracker.saveQuery(this.currentExercise, query);
                }
                
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
                    <table class="schema-table">
                        <thead>
                            <tr>
                                <th>Column</th>
                                <th>Type</th>
                                <th>Constraints</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${table.columns.map(col => {
                                let constraints = [];
                                if (col.primaryKey) {
                                    constraints.push('<span class="constraint-badge pk-badge">PK</span>');
                                }
                                if (col.foreignKey) {
                                    constraints.push(`<span class="constraint-badge fk-badge">FK → ${col.foreignKey.referencedTable}.${col.foreignKey.referencedColumn}</span>`);
                                }
                                if (col.notNull && !col.primaryKey) {
                                    constraints.push('<span class="constraint-badge not-null-badge">NOT NULL</span>');
                                }
                                if (col.defaultValue !== null && col.defaultValue !== undefined) {
                                    constraints.push(`<span class="constraint-badge default-badge">DEFAULT ${col.defaultValue}</span>`);
                                }
                                
                                return `
                                    <tr>
                                        <td class="column-name">${this.escapeHtml(col.name)}</td>
                                        <td class="column-type">${this.escapeHtml(col.type)}</td>
                                        <td class="column-constraints">${constraints.join(' ')}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
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

    displayExercise(exerciseNumber, title, description) {
        // Store current exercise number for saving queries
        this.currentExercise = parseInt(exerciseNumber);
        
        // Remove selected class from all exercise buttons
        document.querySelectorAll('.exercise-btn').forEach(b => {
            b.classList.remove('selected');
            // Clear any applied dark text color when deselecting
            b.style.removeProperty('color');
        });
        
        // Add selected class to clicked button
        const selectedBtn = document.querySelector(`[data-exercise="${exerciseNumber}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
            
            // Apply hover fix if this exercise is completed
            const isCompleted = this.progressTracker.isCompleted(parseInt(exerciseNumber));
            this.progressTracker.addHoverFix(selectedBtn, isCompleted);
            
            // Immediately apply dark text color if in light theme and completed
            const isLightTheme = !document.body.classList.contains('dark-theme');
            if (isCompleted && isLightTheme) {
                selectedBtn.style.setProperty('color', '#1f2937', 'important');
            }
        }
        
        // Display exercise information
        document.getElementById('exerciseTitle').textContent = title;
        document.getElementById('exerciseDescription').textContent = description;
        document.getElementById('exerciseDisplay').style.display = 'block';
        
        // Load stored query if available, otherwise clear the editor
        const storedQuery = this.progressTracker.getQuery(parseInt(exerciseNumber));
        if (storedQuery) {
            const commentedQuery = `-- Last successful query restored\n${storedQuery}`;
            this.sqlEditor.setValue(commentedQuery);
        } else {
            this.sqlEditor.setValue('');
        }
        this.clearResults();
        
        // Responsive scroll behavior
        setTimeout(() => {
            const isMobileOrTablet = window.innerWidth < 1024;
            
            if (isMobileOrTablet) {
                const exerciseDisplay = document.getElementById('exerciseDisplay');
                exerciseDisplay.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            } else {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }, 10);
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
            // Update CodeMirror theme to match
            if (this.sqlEditor) {
                this.sqlEditor.setOption('theme', 'dracula');
            }
        } else {
            // Returning visitor - use saved preference
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
                this.updateThemeIcon(true);
                // Update CodeMirror theme to match
                if (this.sqlEditor) {
                    this.sqlEditor.setOption('theme', 'dracula');
                }
            } else {
                document.body.classList.remove('dark-theme');
                this.updateThemeIcon(false);
                // Update CodeMirror theme to match
                if (this.sqlEditor) {
                    this.sqlEditor.setOption('theme', 'default');
                }
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
            // Update CodeMirror theme
            if (this.sqlEditor) {
                this.sqlEditor.setOption('theme', 'default');
            }
        } else {
            // Switch to dark mode
            document.body.classList.add('dark-theme');
            localStorage.setItem('sql-practice-theme', 'dark');
            this.updateThemeIcon(true);
            // Update CodeMirror theme
            if (this.sqlEditor) {
                this.sqlEditor.setOption('theme', 'dracula');
            }
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
            // Refresh CodeMirror on resize to ensure proper display
            if (this.sqlEditor) {
                setTimeout(() => this.sqlEditor.refresh(), 100);
            }
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
            // Mobile mode - expand schema by default if not already set by user
            if (!schemaContainer.hasAttribute('data-user-toggled')) {
                schemaContainer.classList.remove('collapsed');
                schemaToggle.classList.remove('collapsed');
                schemaToggle.setAttribute('aria-label', 'Hide schema');
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

// Exercise Progress Tracking System
class ExerciseProgressTracker {
    constructor() {
        this.storageKey = 'sql-academy-progress';
        this.exercises = this.getExerciseList();
        this.progress = this.loadProgress();
    }

    getExerciseList() {
        return [
            // Module 1: SELECT (6 exercises)
            { id: 1, module: 1, title: 'Basic SELECT' },
            { id: 2, module: 1, title: 'Filtering by Text' },
            { id: 3, module: 1, title: 'Filtering by Number Range' },
            { id: 4, module: 1, title: 'Ordering Results' },
            { id: 5, module: 1, title: 'Date Range Query' },
            { id: 6, module: 1, title: 'Descending Order' },
            
            // Module 2: JOIN tables (4 exercises)
            { id: 7, module: 2, title: 'Basic Two-Table Join' },
            { id: 8, module: 2, title: 'Filtered Two-Table Join' },
            { id: 9, module: 2, title: 'Hero Powers' },
            { id: 10, module: 2, title: 'Recent Missions' },
            
            // Module 3: JOIN multiple tables (5 exercises)
            { id: 11, module: 3, title: 'Complete Mission Details' },
            { id: 12, module: 3, title: 'Power Analysis' },
            { id: 13, module: 3, title: 'Dangerous Power Users' },
            { id: 14, module: 3, title: 'Mission Difficulty Analysis' },
            { id: 15, module: 3, title: 'Advanced Hero Analysis' },
            
            // Module 4: INSERT INTO (5 exercises)
            { id: 16, module: 4, title: 'Add New Hero' },
            { id: 17, module: 4, title: 'Add New Power' },
            { id: 18, module: 4, title: 'Add New Villain' },
            { id: 19, module: 4, title: 'Assign Hero Power' },
            { id: 20, module: 4, title: 'Create Mission' },
            
            // Module 5: UPDATE (5 exercises)
            { id: 21, module: 5, title: 'Power Level Boost' },
            { id: 22, module: 5, title: 'Mission Status Update' },
            { id: 23, module: 5, title: 'Villain Activity Update' },
            { id: 24, module: 5, title: 'Multiple Field Update' },
            { id: 25, module: 5, title: 'Conditional Power Update' },
            
            // Module 6: DELETE (5 exercises)
            { id: 26, module: 6, title: 'Remove Failed Mission' },
            { id: 27, module: 6, title: 'Remove Low-Threat Villain' },
            { id: 28, module: 6, title: 'Remove Hero Power' },
            { id: 29, module: 6, title: 'Delete Old Missions' },
            { id: 30, module: 6, title: 'Remove Low-Power Heroes' },
            
            // Module 7: CREATE TABLE (15 exercises)
            { id: 31, module: 7, title: 'Create Teams Table' },
            { id: 32, module: 7, title: 'Populate Teams Table' },
            { id: 33, module: 7, title: 'Add More Teams' },
            { id: 34, module: 7, title: 'Correct Team Leader' },
            { id: 35, module: 7, title: 'Update Team Location' },
            { id: 36, module: 7, title: 'Add Column to Teams' },
            { id: 37, module: 7, title: 'Update Founded Dates' },
            { id: 38, module: 7, title: 'Remove Disbanded Team' },
            { id: 39, module: 7, title: 'Create Team Members Junction Table' },
            { id: 40, module: 7, title: 'Add Heroes to Avengers' },
            { id: 41, module: 7, title: 'Add Heroes to Justice League' },
            { id: 42, module: 7, title: 'Query Team Rosters' },
            { id: 43, module: 7, title: 'Remove Team Member' },
            { id: 44, module: 7, title: 'Clean Up All Tables' }
        ];
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading progress:', error);
            return {};
        }
    }

    saveProgress() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    markCompleted(exerciseId) {
        // Preserve existing data (like saved queries) when marking complete
        if (!this.progress[exerciseId]) {
            this.progress[exerciseId] = {};
        }
        this.progress[exerciseId].completed = true;
        this.progress[exerciseId].completedAt = new Date().toISOString();
        this.saveProgress();
        this.updateProgressDisplay();
    }

    markIncomplete(exerciseId) {
        // Preserve saved queries when unmarking completion
        if (this.progress[exerciseId]) {
            this.progress[exerciseId].completed = false;
            delete this.progress[exerciseId].completedAt;
            // Keep lastSuccessfulQuery and lastQuerySaved if they exist
        }
        this.saveProgress();
        this.updateProgressDisplay();
    }

    isCompleted(exerciseId) {
        return this.progress[exerciseId]?.completed || false;
    }

    // Query storage methods
    saveQuery(exerciseId, query) {
        if (!this.progress[exerciseId]) {
            this.progress[exerciseId] = {};
        }
        // Clean the query by removing any "Last successful query restored" comments
        const cleanedQuery = query.replace(/^-- Last successful query restored\n?/m, '').trim();
        this.progress[exerciseId].lastSuccessfulQuery = cleanedQuery;
        this.progress[exerciseId].lastQuerySaved = new Date().toISOString();
        this.saveProgress();
    }

    getQuery(exerciseId) {
        return this.progress[exerciseId]?.lastSuccessfulQuery || null;
    }

    hasStoredQuery(exerciseId) {
        return !!(this.progress[exerciseId]?.lastSuccessfulQuery);
    }

    getModuleProgress(moduleNumber) {
        const moduleExercises = this.exercises.filter(ex => ex.module === moduleNumber);
        const completed = moduleExercises.filter(ex => this.isCompleted(ex.id)).length;
        return {
            completed,
            total: moduleExercises.length,
            percentage: Math.round((completed / moduleExercises.length) * 100)
        };
    }

    getTotalProgress() {
        const completed = Object.keys(this.progress).length;
        const total = this.exercises.length;
        return {
            completed,
            total,
            percentage: Math.round((completed / total) * 100)
        };
    }

    initialize() {
        this.addProgressElements();
        this.updateProgressDisplay();
        this.setupProgressEventListeners();
    }

    addProgressElements() {
        // Add checkboxes to exercise buttons
        this.addExerciseCheckboxes();
        
        // Add module progress indicators
        this.addModuleProgressIndicators();
        
        // Add reset button to exercises section
        this.addResetButton();
    }

    addResetButton() {
        const exercisesHeader = document.querySelector('.example-queries h2');
        if (exercisesHeader) {
            // Create a container for the header content
            const headerContainer = document.createElement('div');
            headerContainer.className = 'exercises-header-container';
            
            // Move the existing h2 content to a span
            const titleSpan = document.createElement('span');
            titleSpan.textContent = exercisesHeader.textContent;
            
            // Create reset button
            const resetButton = document.createElement('button');
            resetButton.id = 'reset-progress-btn';
            resetButton.className = 'reset-progress-btn-small';
            resetButton.innerHTML = '🔄';
            resetButton.title = 'Reset all progress';
            
            // Replace h2 content
            exercisesHeader.innerHTML = '';
            headerContainer.appendChild(titleSpan);
            headerContainer.appendChild(resetButton);
            exercisesHeader.appendChild(headerContainer);
            
            // Add instructional text below the header
            const instructionText = document.createElement('p');
            instructionText.className = 'progress-instruction';
            instructionText.innerHTML = '💡 <strong>Tip:</strong> Click the ⭕ circles to mark exercises as complete ✅';
            exercisesHeader.parentNode.insertBefore(instructionText, exercisesHeader.nextSibling);
        }
    }

    addExerciseCheckboxes() {
        document.querySelectorAll('.exercise-btn').forEach(btn => {
            const exerciseId = parseInt(btn.dataset.exercise);
            
            // Create checkbox container
            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'exercise-checkbox';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `exercise-${exerciseId}-checkbox`;
            checkbox.className = 'exercise-progress-checkbox';
            checkbox.checked = this.isCompleted(exerciseId);
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.innerHTML = this.isCompleted(exerciseId) ? '✅' : '⭕';
            label.title = this.isCompleted(exerciseId) ? 'Mark as incomplete' : 'Mark as completed';
            
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(label);
            
            // Insert at the beginning of the button
            btn.insertBefore(checkboxContainer, btn.firstChild);
        });
    }

    addModuleProgressIndicators() {
        document.querySelectorAll('.section-toggle').forEach((toggle, index) => {
            const moduleNumber = index + 1;
            const progress = this.getModuleProgress(moduleNumber);
            
            // Wrap existing content in a container for left alignment
            const existingContent = toggle.innerHTML;
            const leftContainer = document.createElement('span');
            leftContainer.className = 'module-title-container';
            leftContainer.innerHTML = existingContent;
            
            // Create progress badge
            const progressIndicator = document.createElement('span');
            progressIndicator.className = 'module-progress';
            progressIndicator.id = `module-${moduleNumber}-progress`;
            
            // Set badge text and class based on progress
            this.updateModuleBadge(progressIndicator, progress);
            
            // Clear toggle and add both containers
            toggle.innerHTML = '';
            toggle.appendChild(leftContainer);
            toggle.appendChild(progressIndicator);
        });
    }

    updateModuleBadge(badge, progress) {
        // Determine badge class and text based on completion
        let badgeClass, badgeText;
        
        if (progress.completed === 0) {
            badgeClass = 'none';
            badgeText = `0/${progress.total}`;
        } else if (progress.completed === progress.total) {
            badgeClass = 'completed';
            badgeText = `${progress.completed}/${progress.total}`;
        } else {
            badgeClass = 'partial';
            badgeText = `${progress.completed}/${progress.total}`;
        }
        
        badge.className = `module-progress ${badgeClass}`;
        badge.textContent = badgeText;
    }

    updateProgressDisplay() {
        // Update module progress indicators
        for (let i = 1; i <= 7; i++) {
            const moduleProgress = this.getModuleProgress(i);
            const badge = document.getElementById(`module-${i}-progress`);
            if (badge) {
                this.updateModuleBadge(badge, moduleProgress);
            }
        }
        
        // Update exercise checkboxes
        document.querySelectorAll('.exercise-btn').forEach(btn => {
            const exerciseId = parseInt(btn.dataset.exercise);
            const checkbox = btn.querySelector('.exercise-progress-checkbox');
            const label = btn.querySelector('label');
            
            if (checkbox && label) {
                const isCompleted = this.isCompleted(exerciseId);
                checkbox.checked = isCompleted;
                label.innerHTML = isCompleted ? '✅' : '⭕';
                label.title = isCompleted ? 'Mark as incomplete' : 'Mark as completed';
                btn.classList.toggle('completed', isCompleted);
                
                // Add hover event listeners to fix text color in light theme
                this.addHoverFix(btn, isCompleted);
            }
        });
    }

    addHoverFix(btn, isCompleted) {
        // Remove existing event listeners to prevent duplicates
        btn.removeEventListener('mouseenter', btn._hoverEnterHandler);
        btn.removeEventListener('mouseleave', btn._hoverLeaveHandler);
        
        // Add new event listeners
        btn._hoverEnterHandler = () => {
            const isLightTheme = !document.body.classList.contains('dark-theme');
            if (isCompleted && btn.classList.contains('selected') && isLightTheme) {
                btn.style.setProperty('color', '#1f2937', 'important');
            }
        };
        
        btn._hoverLeaveHandler = () => {
            const isLightTheme = !document.body.classList.contains('dark-theme');
            if (isCompleted && btn.classList.contains('selected') && isLightTheme) {
                btn.style.removeProperty('color');
            }
        };
        
        btn.addEventListener('mouseenter', btn._hoverEnterHandler);
        btn.addEventListener('mouseleave', btn._hoverLeaveHandler);
    }

    setupProgressEventListeners() {
        // Handle label clicks for progress tracking
        document.addEventListener('click', (e) => {
            if (e.target.closest('.exercise-checkbox label')) {
                e.preventDefault();
                e.stopPropagation();
                
                const label = e.target.closest('label');
                const checkbox = label.previousElementSibling;
                const exerciseId = parseInt(checkbox.id.match(/exercise-(\d+)-checkbox/)[1]);
                
                // Toggle the completion status
                if (this.isCompleted(exerciseId)) {
                    this.markIncomplete(exerciseId);
                } else {
                    this.markCompleted(exerciseId);
                }
            }
        });

        // Reset progress button
        document.getElementById('reset-progress-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                this.resetAllProgress();
            }
        });

        // Prevent checkbox container clicks from triggering exercise selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.exercise-checkbox')) {
                e.stopPropagation();
            }
        });
    }

    resetAllProgress() {
        this.progress = {};
        this.saveProgress();
        this.updateProgressDisplay();
        
        // Also clear any stored query in the current editor
        if (window.sqlApp && window.sqlApp.sqlEditor) {
            window.sqlApp.sqlEditor.setValue('');
        }
    }
}