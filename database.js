// Superhero database sample data
const sampleData = {
    heroes: [
        { HeroID: 1, HeroName: 'Spider-Man', RealName: 'Peter Parker', City: 'New York', Universe: 'Marvel', PowerLevel: 85, FirstAppearance: '1962-08-01' },
        { HeroID: 2, HeroName: 'Batman', RealName: 'Bruce Wayne', City: 'Gotham', Universe: 'DC', PowerLevel: 90, FirstAppearance: '1939-05-01' },
        { HeroID: 3, HeroName: 'Wonder Woman', RealName: 'Diana Prince', City: 'Washington DC', Universe: 'DC', PowerLevel: 95, FirstAppearance: '1941-12-01' },
        { HeroID: 4, HeroName: 'Iron Man', RealName: 'Tony Stark', City: 'New York', Universe: 'Marvel', PowerLevel: 88, FirstAppearance: '1963-03-01' },
        { HeroID: 5, HeroName: 'The Flash', RealName: 'Barry Allen', City: 'Central City', Universe: 'DC', PowerLevel: 92, FirstAppearance: '1956-10-01' },
        { HeroID: 6, HeroName: 'Black Widow', RealName: 'Natasha Romanoff', City: 'New York', Universe: 'Marvel', PowerLevel: 82, FirstAppearance: '1964-04-01' },
        { HeroID: 7, HeroName: 'Superman', RealName: 'Clark Kent', City: 'Metropolis', Universe: 'DC', PowerLevel: 98, FirstAppearance: '1938-06-01' },
        { HeroID: 8, HeroName: 'Captain America', RealName: 'Steve Rogers', City: 'New York', Universe: 'Marvel', PowerLevel: 87, FirstAppearance: '1941-03-01' },
        { HeroID: 9, HeroName: 'Green Lantern', RealName: 'Hal Jordan', City: 'Coast City', Universe: 'DC', PowerLevel: 89, FirstAppearance: '1959-10-01' },
        { HeroID: 10, HeroName: 'Scarlet Witch', RealName: 'Wanda Maximoff', City: 'New York', Universe: 'Marvel', PowerLevel: 94, FirstAppearance: '1964-03-01' }
    ],
    
    powers: [
        { PowerID: 1, PowerName: 'Web Slinging', PowerType: 'Physical', EnergyRequired: 15, DangerLevel: 3, CreationDate: '1962-08-01' },
        { PowerID: 2, PowerName: 'Super Strength', PowerType: 'Physical', EnergyRequired: 25, DangerLevel: 4, CreationDate: '1938-06-01' },
        { PowerID: 3, PowerName: 'Flight', PowerType: 'Physical', EnergyRequired: 20, DangerLevel: 2, CreationDate: '1938-06-01' },
        { PowerID: 4, PowerName: 'Telepathy', PowerType: 'Mental', EnergyRequired: 30, DangerLevel: 5, CreationDate: '1963-09-01' },
        { PowerID: 5, PowerName: 'Super Speed', PowerType: 'Physical', EnergyRequired: 35, DangerLevel: 6, CreationDate: '1940-01-01' },
        { PowerID: 6, PowerName: 'Invisibility', PowerType: 'Physical', EnergyRequired: 18, DangerLevel: 2, CreationDate: '1961-11-01' },
        { PowerID: 7, PowerName: 'Energy Blasts', PowerType: 'Energy', EnergyRequired: 40, DangerLevel: 7, CreationDate: '1963-03-01' },
        { PowerID: 8, PowerName: 'Time Manipulation', PowerType: 'Reality', EnergyRequired: 50, DangerLevel: 9, CreationDate: '1956-10-01' },
        { PowerID: 9, PowerName: 'Enhanced Intelligence', PowerType: 'Mental', EnergyRequired: 10, DangerLevel: 1, CreationDate: '1939-05-01' },
        { PowerID: 10, PowerName: 'Reality Warping', PowerType: 'Reality', EnergyRequired: 60, DangerLevel: 10, CreationDate: '1964-03-01' }
    ],
    
    missions: [
        { MissionID: 1001, HeroID: 1, VillainID: 201, MissionDate: '2024-03-15', Difficulty: 'Medium', Status: 'Completed' },
        { MissionID: 1002, HeroID: 2, VillainID: 202, MissionDate: '2024-03-18', Difficulty: 'Hard', Status: 'Completed' },
        { MissionID: 1003, HeroID: 3, VillainID: 203, MissionDate: '2024-03-20', Difficulty: 'Easy', Status: 'Completed' },
        { MissionID: 1004, HeroID: 4, VillainID: 204, MissionDate: '2024-03-22', Difficulty: 'Medium', Status: 'In Progress' },
        { MissionID: 1005, HeroID: 5, VillainID: 205, MissionDate: '2024-03-25', Difficulty: 'Hard', Status: 'Completed' },
        { MissionID: 1006, HeroID: 7, VillainID: 206, MissionDate: '2024-03-28', Difficulty: 'Extreme', Status: 'Completed' },
        { MissionID: 1007, HeroID: 8, VillainID: 207, MissionDate: '2024-04-01', Difficulty: 'Medium', Status: 'Failed' },
        { MissionID: 1008, HeroID: 9, VillainID: 208, MissionDate: '2024-04-05', Difficulty: 'Hard', Status: 'Completed' },
        { MissionID: 1009, HeroID: 10, VillainID: 209, MissionDate: '2024-04-08', Difficulty: 'Extreme', Status: 'In Progress' },
        { MissionID: 1010, HeroID: 6, VillainID: 210, MissionDate: '2024-04-10', Difficulty: 'Easy', Status: 'Completed' }
    ],
    
    heroPowers: [
        { HeroID: 1, PowerID: 1, ProficiencyLevel: 95, YearsTraining: 8 },
        { HeroID: 1, PowerID: 2, ProficiencyLevel: 80, YearsTraining: 8 },
        { HeroID: 2, PowerID: 9, ProficiencyLevel: 98, YearsTraining: 15 },
        { HeroID: 3, PowerID: 2, ProficiencyLevel: 90, YearsTraining: 100 },
        { HeroID: 3, PowerID: 3, ProficiencyLevel: 95, YearsTraining: 100 },
        { HeroID: 4, PowerID: 3, ProficiencyLevel: 85, YearsTraining: 12 },
        { HeroID: 4, PowerID: 9, ProficiencyLevel: 92, YearsTraining: 12 },
        { HeroID: 5, PowerID: 5, ProficiencyLevel: 99, YearsTraining: 6 },
        { HeroID: 7, PowerID: 2, ProficiencyLevel: 100, YearsTraining: 20 },
        { HeroID: 7, PowerID: 3, ProficiencyLevel: 100, YearsTraining: 20 },
        { HeroID: 7, PowerID: 7, ProficiencyLevel: 95, YearsTraining: 20 },
        { HeroID: 10, PowerID: 10, ProficiencyLevel: 88, YearsTraining: 5 },
        { HeroID: 10, PowerID: 4, ProficiencyLevel: 85, YearsTraining: 5 }
    ],

    villains: [
        { VillainID: 201, VillainName: 'Green Goblin', RealName: 'Norman Osborn', City: 'New York', ThreatLevel: 8, LastSeen: '2024-03-15' },
        { VillainID: 202, VillainName: 'Joker', RealName: 'Unknown', City: 'Gotham', ThreatLevel: 9, LastSeen: '2024-03-18' },
        { VillainID: 203, VillainName: 'Cheetah', RealName: 'Barbara Minerva', City: 'Washington DC', ThreatLevel: 6, LastSeen: '2024-03-20' },
        { VillainID: 204, VillainName: 'Mandarin', RealName: 'Unknown', City: 'New York', ThreatLevel: 7, LastSeen: '2024-02-14' },
        { VillainID: 205, VillainName: 'Reverse Flash', RealName: 'Eobard Thawne', City: 'Central City', ThreatLevel: 9, LastSeen: '2024-03-25' },
        { VillainID: 206, VillainName: 'Lex Luthor', RealName: 'Alexander Luthor', City: 'Metropolis', ThreatLevel: 8, LastSeen: '2024-03-28' },
        { VillainID: 207, VillainName: 'Red Skull', RealName: 'Johann Schmidt', City: 'New York', ThreatLevel: 7, LastSeen: '2024-01-20' },
        { VillainID: 208, VillainName: 'Sinestro', RealName: 'Thaal Sinestro', City: 'Coast City', ThreatLevel: 8, LastSeen: '2024-04-05' },
        { VillainID: 209, VillainName: 'Dormammu', RealName: 'Dormammu', City: 'New York', ThreatLevel: 10, LastSeen: '2024-04-08' },
        { VillainID: 210, VillainName: 'Taskmaster', RealName: 'Tony Masters', City: 'New York', ThreatLevel: 6, LastSeen: '2024-04-10' }
    ]
};

class DatabaseManager {
    constructor() {
        this.db = null;
        this.SQL = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // Initialize SQL.js
            this.SQL = await initSqlJs({
                locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
            });
            
            // Create new database
            this.db = new this.SQL.Database();
            
            // Create tables and insert sample data
            this.createTables();
            this.insertSampleData();
            
            this.isInitialized = true;
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }

    createTables() {
        const createTableQueries = [
            `CREATE TABLE IF NOT EXISTS Heroes (
                HeroID INTEGER PRIMARY KEY,
                HeroName TEXT NOT NULL,
                RealName TEXT,
                City TEXT,
                Universe TEXT,
                PowerLevel INTEGER,
                FirstAppearance TEXT
            )`,
            
            `CREATE TABLE IF NOT EXISTS Powers (
                PowerID INTEGER PRIMARY KEY,
                PowerName TEXT NOT NULL,
                PowerType TEXT,
                EnergyRequired INTEGER,
                DangerLevel INTEGER,
                CreationDate TEXT
            )`,
            
            `CREATE TABLE IF NOT EXISTS Missions (
                MissionID INTEGER PRIMARY KEY,
                HeroID INTEGER,
                VillainID INTEGER,
                MissionDate TEXT,
                Difficulty TEXT,
                Status TEXT,
                FOREIGN KEY (HeroID) REFERENCES Heroes(HeroID),
                FOREIGN KEY (VillainID) REFERENCES Villains(VillainID)
            )`,
            
            `CREATE TABLE IF NOT EXISTS HeroPowers (
                HeroID INTEGER,
                PowerID INTEGER,
                ProficiencyLevel INTEGER,
                YearsTraining INTEGER,
                PRIMARY KEY (HeroID, PowerID),
                FOREIGN KEY (HeroID) REFERENCES Heroes(HeroID),
                FOREIGN KEY (PowerID) REFERENCES Powers(PowerID)
            )`,

            `CREATE TABLE IF NOT EXISTS Villains (
                VillainID INTEGER PRIMARY KEY,
                VillainName TEXT NOT NULL,
                RealName TEXT,
                City TEXT,
                ThreatLevel INTEGER,
                LastSeen TEXT
            )`
        ];

        createTableQueries.forEach(query => {
            this.db.exec(query);
        });
    }

    insertSampleData() {
        // Clear existing data
        this.db.exec('DELETE FROM HeroPowers');
        this.db.exec('DELETE FROM Missions');
        this.db.exec('DELETE FROM Powers');
        this.db.exec('DELETE FROM Heroes');
        this.db.exec('DELETE FROM Villains');

        // Insert heroes
        const heroStmt = this.db.prepare(`
            INSERT INTO Heroes (HeroID, HeroName, RealName, City, Universe, PowerLevel, FirstAppearance)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        sampleData.heroes.forEach(hero => {
            heroStmt.run([
                hero.HeroID,
                hero.HeroName,
                hero.RealName,
                hero.City,
                hero.Universe,
                hero.PowerLevel,
                hero.FirstAppearance
            ]);
        });
        heroStmt.free();

        // Insert powers
        const powerStmt = this.db.prepare(`
            INSERT INTO Powers (PowerID, PowerName, PowerType, EnergyRequired, DangerLevel, CreationDate)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        sampleData.powers.forEach(power => {
            powerStmt.run([
                power.PowerID,
                power.PowerName,
                power.PowerType,
                power.EnergyRequired,
                power.DangerLevel,
                power.CreationDate
            ]);
        });
        powerStmt.free();

        // Insert villains
        const villainStmt = this.db.prepare(`
            INSERT INTO Villains (VillainID, VillainName, RealName, City, ThreatLevel, LastSeen)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        sampleData.villains.forEach(villain => {
            villainStmt.run([
                villain.VillainID,
                villain.VillainName,
                villain.RealName,
                villain.City,
                villain.ThreatLevel,
                villain.LastSeen
            ]);
        });
        villainStmt.free();

        // Insert missions
        const missionStmt = this.db.prepare(`
            INSERT INTO Missions (MissionID, HeroID, VillainID, MissionDate, Difficulty, Status)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        sampleData.missions.forEach(mission => {
            missionStmt.run([
                mission.MissionID,
                mission.HeroID,
                mission.VillainID,
                mission.MissionDate,
                mission.Difficulty,
                mission.Status
            ]);
        });
        missionStmt.free();

        // Insert hero powers
        const heroPowerStmt = this.db.prepare(`
            INSERT INTO HeroPowers (HeroID, PowerID, ProficiencyLevel, YearsTraining)
            VALUES (?, ?, ?, ?)
        `);
        
        sampleData.heroPowers.forEach(heroPower => {
            heroPowerStmt.run([
                heroPower.HeroID,
                heroPower.PowerID,
                heroPower.ProficiencyLevel,
                heroPower.YearsTraining
            ]);
        });
        heroPowerStmt.free();
    }

    executeQuery(query) {
        if (!this.isInitialized) {
            throw new Error('Database not initialized');
        }

        try {
            // Check if this is a DDL operation that might change schema
            const isDDL = /^\s*(CREATE|DROP|ALTER)\s+/i.test(query.trim());
            
            const results = this.db.exec(query);
            
            // For DDL operations, also return current schema info
            if (isDDL) {
                const schemaInfo = this.getSchemaInfo();
                return {
                    success: true,
                    results: results,
                    schemaChanged: true,
                    schema: schemaInfo,
                    message: results.length > 0 ? `Query executed successfully. ${results[0].values.length} row(s) affected.` : 'Query executed successfully.'
                };
            }
            
            return {
                success: true,
                results: results,
                message: results.length > 0 ? `Query executed successfully. ${results[0].values.length} row(s) affected.` : 'Query executed successfully.'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: `Error: ${error.message}`
            };
        }
    }

    getSchemaInfo() {
        try {
            // Get all tables
            const tablesResult = this.db.exec(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
                ORDER BY name
            `);
            
            const tables = [];
            if (tablesResult.length > 0) {
                for (const row of tablesResult[0].values) {
                    const tableName = row[0];
                    
                    // Get column info for each table
                    const columnsResult = this.db.exec(`PRAGMA table_info(${tableName})`);
                    const columns = [];
                    
                    if (columnsResult.length > 0) {
                        for (const colRow of columnsResult[0].values) {
                            columns.push({
                                name: colRow[1],
                                type: colRow[2],
                                notNull: colRow[3] === 1,
                                defaultValue: colRow[4],
                                primaryKey: colRow[5] === 1
                            });
                        }
                    }
                    
                    tables.push({
                        name: tableName,
                        columns: columns
                    });
                }
            }
            
            return tables;
        } catch (error) {
            console.error('Error getting schema info:', error);
            return [];
        }
    }

    reset() {
        if (this.db) {
            this.createTables();
            this.insertSampleData();
            return { success: true, message: 'Database reset successfully.' };
        }
        return { success: false, message: 'Database not initialized.' };
    }
}

// Export for use in app.js
window.DatabaseManager = DatabaseManager;