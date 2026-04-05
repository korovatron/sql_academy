class SQLPracticeApp {
    constructor() {
        this.dbManager = new DatabaseManager();
        this.sqlEditor = null; // CodeMirror editor instance
        this.isMobileDevice = false;
        this.progressTracker = new ExerciseProgressTracker();
        this.currentSchema = [];
        this.isSchemaModalOpen = false;
        this.lastFocusedBeforeModal = null;
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
            this.focusEditorOnLoad();
        } catch (error) {
            this.showLoading(false);
            this.displayMessage(`Failed to initialize database: ${error.message}`, 'error');
        }
    }

    initializeCodeMirror() {
        const textarea = document.getElementById('sqlInput');
        
        // Detect mobile/touch devices
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.isMobileDevice = isMobile;
        
        this.sqlEditor = CodeMirror.fromTextArea(textarea, {
            mode: 'text/x-sql',
            theme: document.body.classList.contains('dark-theme') ? 'dracula' : 'default',
            lineNumbers: false,
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

    focusEditorOnLoad() {
        if (!this.sqlEditor || this.isMobileDevice) {
            return;
        }

        requestAnimationFrame(() => {
            this.sqlEditor.focus();
        });
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

        const openSchemaDiagramBtn = document.getElementById('openSchemaDiagramBtn');
        if (openSchemaDiagramBtn) {
            openSchemaDiagramBtn.addEventListener('click', () => {
                this.openSchemaDiagramModal();
            });
        }

        const closeSchemaDiagramBtn = document.getElementById('closeSchemaDiagramBtn');
        if (closeSchemaDiagramBtn) {
            closeSchemaDiagramBtn.addEventListener('click', () => {
                this.closeSchemaDiagramModal();
            });
        }

        const schemaDiagramBackdrop = document.getElementById('schemaDiagramBackdrop');
        if (schemaDiagramBackdrop) {
            schemaDiagramBackdrop.addEventListener('click', () => {
                this.closeSchemaDiagramModal();
            });
        }

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isSchemaModalOpen) {
                this.closeSchemaDiagramModal();
            }
        });

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
        this.currentSchema = Array.isArray(schema) ? schema : [];
        
        if (!schema || schema.length === 0) {
            schemaContainer.innerHTML = '<p>No tables found in database.</p>';
            this.renderSchemaDiagram(this.currentSchema);
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
        this.renderSchemaDiagram(this.currentSchema);
    }

    openSchemaDiagramModal() {
        const modal = document.getElementById('schemaDiagramModal');
        if (!modal) {
            return;
        }

        this.lastFocusedBeforeModal = document.activeElement;
        this.isSchemaModalOpen = true;
        modal.hidden = false;
        document.body.classList.add('modal-open');

        // Ensure diagram reflects current schema at open time.
        this.renderSchemaDiagram(this.currentSchema);

        const closeBtn = document.getElementById('closeSchemaDiagramBtn');
        if (closeBtn) {
            closeBtn.focus();
        }
    }

    closeSchemaDiagramModal() {
        const modal = document.getElementById('schemaDiagramModal');
        if (!modal) {
            return;
        }

        modal.hidden = true;
        this.isSchemaModalOpen = false;
        document.body.classList.remove('modal-open');

        if (this.lastFocusedBeforeModal && typeof this.lastFocusedBeforeModal.focus === 'function') {
            this.lastFocusedBeforeModal.focus();
        }
    }

    renderSchemaDiagram(schema) {
        const canvas = document.getElementById('schemaDiagramCanvas');
        if (!canvas) {
            return;
        }

        if (!schema || schema.length === 0) {
            canvas.innerHTML = '<p class="schema-diagram-empty">No schema to visualize yet.</p>';
            return;
        }

        const layout = this.calculateSchemaLayout(schema);
        const width = layout.width;
        const height = layout.height;
        const tableMap = new Map(layout.tables.map(table => [table.name, table]));
        const edges = [];

        schema.forEach(table => {
            const source = tableMap.get(table.name);
            if (!source) {
                return;
            }

            table.columns.forEach(column => {
                if (!column.foreignKey) {
                    return;
                }

                const target = tableMap.get(column.foreignKey.referencedTable);
                if (!target) {
                    return;
                }

                const sourceColumnOffset = this.getColumnAnchorOffset(source, column.name);
                const targetColumnOffset = this.getColumnAnchorOffset(target, column.foreignKey.referencedColumn);
                const startY = source.y + source.headerHeight + sourceColumnOffset;
                const endY = target.y + target.headerHeight + targetColumnOffset;

                const route = this.selectBestEdgeRoute(source, target, startY, endY, layout);
                if (!route) {
                    return;
                }

                edges.push({
                    colorIndex: edges.length,
                    startX: route.startX,
                    startY,
                    endX: route.endX,
                    endY,
                    points: route.points,
                    routeX: route.routeX,
                    pathData: this.createPathDataFromPoints(route.points),
                    startSide: route.startSide,
                    endSide: route.endSide
                });
            });
        });

        this.spreadEdgeLanes(edges);

        const connectorPalette = ['#0072B2', '#E69F00', '#009E73', '#CC79A7', '#D55E00', '#56B4E9'];

        const edgeSvg = edges.map(edge => {
            const edgeColor = connectorPalette[edge.colorIndex % connectorPalette.length];
            const startDirection = edge.startSide === 'right' ? 1 : -1;
            const endDirection = edge.endSide === 'right' ? 1 : -1;
            const crowFootJoinX = edge.startX + (startDirection * 10);
            const oneTickX = edge.endX + (endDirection * 7);
            return `
                <g>
                    <path class="schema-diagram-edge" d="${edge.pathData}" fill="none" style="stroke: ${edgeColor};"></path>
                    <path class="schema-diagram-crow-foot" d="M ${edge.startX} ${edge.startY - 7} L ${crowFootJoinX} ${edge.startY}" style="stroke: ${edgeColor};"></path>
                    <path class="schema-diagram-crow-foot" d="M ${edge.startX} ${edge.startY + 7} L ${crowFootJoinX} ${edge.startY}" style="stroke: ${edgeColor};"></path>
                    <path class="schema-diagram-one-tick" d="M ${oneTickX} ${edge.endY - 6} L ${oneTickX} ${edge.endY + 6}" style="stroke: ${edgeColor};"></path>
                </g>
            `;
        }).join('');

        const tableSvg = layout.tables.map(table => {
            const rows = table.columns.map((column, index) => {
                const y = table.y + table.headerHeight + 18 + (index * table.rowHeight);
                const isForeignKey = !!column.foreignKey;
                const isPrimaryKey = !!column.primaryKey;

                const textX = table.x + 10;
                const baseText = `<text class="schema-diagram-column-name" x="${textX}" y="${y}">${this.escapeHtml(column.name)}</text>`;

                const badges = [];
                if (isPrimaryKey) {
                    badges.push({ label: 'PK', type: 'pk' });
                }
                if (isForeignKey) {
                    badges.push({ label: 'FK', type: 'fk' });
                }

                if (badges.length === 0) {
                    return baseText;
                }

                const badgeY = y - 11;
                const badgeHeight = 14;
                const badgePadding = 10;
                const badgeGap = 5;
                const badgeWidths = badges.map(badge => (badge.label.length * 6) + 10);
                const totalBadgesWidth = badgeWidths.reduce((sum, width) => sum + width, 0) + (badgeGap * (badges.length - 1));
                let badgeX = (table.x + table.width) - badgePadding - totalBadgesWidth;

                const badgeSvg = badges.map((badge, badgeIndex) => {
                    const badgeWidth = badgeWidths[badgeIndex];
                    const currentX = badgeX;
                    badgeX += badgeWidth + badgeGap;

                    return `
                        <rect class="schema-diagram-key-badge ${badge.type}" x="${currentX}" y="${badgeY}" width="${badgeWidth}" height="${badgeHeight}" rx="3" ry="3"></rect>
                        <text class="schema-diagram-key-badge-text" x="${currentX + (badgeWidth / 2)}" y="${y - 1}">${badge.label}</text>
                    `;
                }).join('');

                return `${baseText}${badgeSvg}`;
            }).join('');

            return `
                <g>
                    <rect class="schema-diagram-table" x="${table.x}" y="${table.y}" width="${table.width}" height="${table.height}" rx="8" ry="8"></rect>
                    <rect class="schema-diagram-table-header" x="${table.x}" y="${table.y}" width="${table.width}" height="${table.headerHeight}" rx="8" ry="8"></rect>
                    <text class="schema-diagram-table-title" x="${table.x + 10}" y="${table.y + 19}">${this.escapeHtml(table.name)}</text>
                    ${rows}
                </g>
            `;
        }).join('');

        canvas.innerHTML = `
            <svg class="schema-diagram-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Entity relationship diagram for database schema">
                ${tableSvg}
                ${edgeSvg}
            </svg>
        `;
    }

    calculateSchemaLayout(schema) {
        const tableWidth = 260;
        const headerHeight = 30;
        const rowHeight = 18;
        const minTableHeight = 84;
        const horizontalGap = 80;
        const verticalGap = 52;
        const columnCount = Math.max(1, Math.ceil(Math.sqrt(schema.length)));

        const tables = schema.map((table, index) => {
            const row = Math.floor(index / columnCount);
            const col = index % columnCount;
            const x = 30 + col * (tableWidth + horizontalGap);
            const y = 30 + row * (minTableHeight + (rowHeight * 6) + verticalGap);
            const calculatedHeight = Math.max(minTableHeight, headerHeight + 14 + (table.columns.length * rowHeight) + 8);
            const columnYByName = {};

            table.columns.forEach((column, colIndex) => {
                columnYByName[this.normalizeIdentifier(column.name)] = 14 + (colIndex * rowHeight);
            });

            return {
                name: table.name,
                columns: table.columns,
                x,
                y,
                width: tableWidth,
                height: calculatedHeight,
                headerHeight,
                rowHeight,
                columnYByName
            };
        });

        const maxX = tables.reduce((max, table) => Math.max(max, table.x + table.width), 760);
        const maxY = tables.reduce((max, table) => Math.max(max, table.y + table.height), 320);

        return {
            tables,
            width: maxX + 40,
            height: maxY + 40
        };
    }

    normalizeIdentifier(name) {
        return String(name || '')
            .replace(/["`\[\]]/g, '')
            .trim()
            .toLowerCase();
    }

    getColumnAnchorOffset(tableLayout, columnName) {
        const directMatch = tableLayout.columnYByName[this.normalizeIdentifier(columnName)];
        if (typeof directMatch === 'number') {
            return directMatch;
        }

        const normalizedTarget = this.normalizeIdentifier(columnName);
        const fallbackIndex = tableLayout.columns.findIndex(column => this.normalizeIdentifier(column.name) === normalizedTarget);
        if (fallbackIndex >= 0) {
            return 14 + (fallbackIndex * tableLayout.rowHeight);
        }

        return Math.floor(tableLayout.height / 2);
    }

    selectBestEdgeRoute(source, target, startY, endY, layout) {
        const modes = ['opposite', 'same-right', 'same-left'];
        const obstacleRects = layout.tables
            .filter(table => table.name !== source.name && table.name !== target.name)
            .map(table => ({
                left: table.x,
                right: table.x + table.width,
                top: table.y,
                bottom: table.y + table.height
            }));

        const routeCandidates = modes
            .map(mode => this.buildRouteCandidate(mode, source, target, startY, endY, obstacleRects, layout.width))
            .filter(candidate => !!candidate);

        if (routeCandidates.length === 0) {
            return null;
        }

        routeCandidates.sort((a, b) => {
            if (a.collisionCount !== b.collisionCount) {
                return a.collisionCount - b.collisionCount;
            }

            if (a.length !== b.length) {
                return a.length - b.length;
            }

            return a.modePriority - b.modePriority;
        });

        return routeCandidates[0];
    }

    buildRouteCandidate(mode, source, target, startY, endY, obstacleRects, layoutWidth) {
        const sourceCenterX = source.x + (source.width / 2);
        const targetCenterX = target.x + (target.width / 2);
        const sourceLeft = source.x;
        const sourceRight = source.x + source.width;
        const targetLeft = target.x;
        const targetRight = target.x + target.width;

        let startSide;
        let endSide;
        let startDirection;
        let endDirection;
        let startX;
        let endX;
        let portOffset;
        let baseRouteX;

        if (mode === 'opposite') {
            const targetIsRight = targetCenterX >= sourceCenterX;
            startSide = targetIsRight ? 'right' : 'left';
            endSide = targetIsRight ? 'left' : 'right';
            startDirection = targetIsRight ? 1 : -1;
            endDirection = targetIsRight ? -1 : 1;
            startX = targetIsRight ? sourceRight : sourceLeft;
            endX = targetIsRight ? targetLeft : targetRight;
            portOffset = 18;
            const startOutX = startX + (startDirection * portOffset);
            const endOutX = endX + (endDirection * portOffset);
            baseRouteX = (startOutX + endOutX) / 2;
        } else {
            const sameRight = mode === 'same-right';
            startSide = sameRight ? 'right' : 'left';
            endSide = startSide;
            startDirection = sameRight ? 1 : -1;
            endDirection = startDirection;
            startX = sameRight ? sourceRight : sourceLeft;
            endX = sameRight ? targetRight : targetLeft;
            portOffset = 14;
            const routeOffset = 36;
            baseRouteX = sameRight
                ? Math.max(sourceRight, targetRight) + routeOffset
                : Math.min(sourceLeft, targetLeft) - routeOffset;
        }

        const startOutX = startX + (startDirection * portOffset);
        const endOutX = endX + (endDirection * portOffset);

        const rawCandidates = [
            baseRouteX,
            ...obstacleRects.flatMap(rect => [rect.left - 24, rect.right + 24])
        ];
        const minRouteX = 8;
        const maxRouteX = layoutWidth - 8;
        const candidateXs = [...new Set(rawCandidates.map(x => this.clampValue(x, minRouteX, maxRouteX)))];

        const pathOptions = candidateXs.map(routeX => {
            const points = [
                { x: startX, y: startY },
                { x: startOutX, y: startY },
                { x: routeX, y: startY },
                { x: routeX, y: endY },
                { x: endOutX, y: endY },
                { x: endX, y: endY }
            ];

            const pathData = points
                .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
                .join(' ');

            return {
                points,
                pathData,
                collisionCount: this.countPathCollisions(points, obstacleRects),
                length: this.getPathLength(points),
                routeX
            };
        });

        if (pathOptions.length === 0) {
            return null;
        }

        pathOptions.sort((a, b) => {
            if (a.collisionCount !== b.collisionCount) {
                return a.collisionCount - b.collisionCount;
            }

            return a.length - b.length;
        });

        const bestPath = pathOptions[0];
        const modePriority = mode === 'opposite' ? 0 : 1;

        return {
            startX,
            endX,
            startSide,
            endSide,
            points: bestPath.points,
            routeX: bestPath.routeX,
            collisionCount: bestPath.collisionCount,
            length: bestPath.length,
            modePriority
        };
    }

    spreadEdgeLanes(edges) {
        const laneGap = 8;
        const groups = new Map();

        edges.forEach(edge => {
            if (!Array.isArray(edge.points) || edge.points.length < 6 || typeof edge.routeX !== 'number') {
                return;
            }

            const bucketX = Math.round(edge.routeX / laneGap) * laneGap;
            const key = `${edge.startSide}-${edge.endSide}-${bucketX}`;
            const group = groups.get(key) || [];
            group.push(edge);
            groups.set(key, group);
        });

        groups.forEach(group => {
            if (group.length < 2) {
                group.forEach(edge => {
                    edge.pathData = this.createPathDataFromPoints(edge.points);
                });
                return;
            }

            group.sort((a, b) => {
                const aMidY = (a.startY + a.endY) / 2;
                const bMidY = (b.startY + b.endY) / 2;
                return aMidY - bMidY;
            });

            const center = (group.length - 1) / 2;

            group.forEach((edge, index) => {
                const shift = (index - center) * laneGap;

                // Route points are always the third and fourth points in our orthogonal path template.
                edge.points[2].x += shift;
                edge.points[3].x += shift;
                edge.pathData = this.createPathDataFromPoints(edge.points);
            });
        });
    }

    createPathDataFromPoints(points) {
        return points
            .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
            .join(' ');
    }

    countPathCollisions(points, obstacleRects) {
        let collisions = 0;

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            obstacleRects.forEach(rect => {
                if (this.segmentIntersectsRect(p1, p2, rect, 6)) {
                    collisions += 1;
                }
            });
        }

        return collisions;
    }

    segmentIntersectsRect(p1, p2, rect, padding = 0) {
        const left = rect.left - padding;
        const right = rect.right + padding;
        const top = rect.top - padding;
        const bottom = rect.bottom + padding;

        if (p1.x === p2.x) {
            const x = p1.x;
            const yMin = Math.min(p1.y, p2.y);
            const yMax = Math.max(p1.y, p2.y);
            return x >= left && x <= right && yMax >= top && yMin <= bottom;
        }

        if (p1.y === p2.y) {
            const y = p1.y;
            const xMin = Math.min(p1.x, p2.x);
            const xMax = Math.max(p1.x, p2.x);
            return y >= top && y <= bottom && xMax >= left && xMin <= right;
        }

        return false;
    }

    getPathLength(points) {
        let total = 0;
        for (let i = 0; i < points.length - 1; i++) {
            total += Math.abs(points[i + 1].x - points[i].x) + Math.abs(points[i + 1].y - points[i].y);
        }
        return total;
    }

    clampValue(value, min, max) {
        return Math.max(min, Math.min(max, value));
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
        const exerciseDisplay = document.getElementById('exerciseDisplay');
        exerciseDisplay.style.display = 'block';
        exerciseDisplay.classList.add('active');
        
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
            <strong>Tip:</strong> Press Ctrl+Enter to execute your query quickly!
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
            instructionText.innerHTML = '<strong>Tip:</strong> Click the ⭕ circles to mark exercises as complete ✅';
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