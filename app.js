class SQLPracticeApp {
    constructor() {
        this.dbManager = new DatabaseManager();
        this.sqlEditor = null; // CodeMirror editor instance
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
            
            // Add touch-friendly behavior
            this.sqlEditor.on('focus', () => {
                // Small delay to prevent iOS zoom
                setTimeout(() => {
                    if (window.scrollY > 0) {
                        window.scrollTo(0, 0);
                    }
                }, 100);
            });
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
                this.sqlEditor.setValue('');
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