# 🦸‍♂️ Superhero SQL Training Academy 🦸‍♀️

A fully client-side SQL practice environment that runs entirely in the browser using SQL.js (SQLite compiled to WebAssembly). Learn SQL with superheroes, villains, and epic missions! Perfect for static hosting on GitHub Pages!

## Features

- 🌐 **Fully Client-Side**: No server required - runs entirely in the browser
- 🦸‍♂️ **Superhero Database**: Practice with heroes, villains, powers, and missions
- ✅ **Full CRUD Support**: Create, Read, Update, Delete operations all work
- 🏗️ **DDL Operations**: Create, alter, and drop tables dynamically
- 🔄 **Dynamic Schema**: Schema updates in real-time when tables are modified
- 🎯 **Real-time Execution**: Execute SQL queries and see results instantly
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔄 **Database Reset**: Reset to original sample data anytime
- 💡 **Geeky Examples**: Built-in superhero-themed queries to get started quicklyEnvironment

A fully client-side SQL practice environment that runs entirely in the browser using SQL.js (SQLite compiled to WebAssembly). Perfect for static hosting on GitHub Pages!

## Features

- 🌐 **Fully Client-Side**: No server required - runs entirely in the browser
- 📊 **Sample Database**: Includes sample tables (Customers, Orders, Products, OrderDetails) similar to W3Schools
- ✅ **Full CRUD Support**: Create, Read, Update, Delete operations all work
- �️ **DDL Operations**: Create, alter, and drop tables dynamically
- 🔄 **Dynamic Schema**: Schema updates in real-time when tables are modified
- �🎯 **Real-time Execution**: Execute SQL queries and see results instantly
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔄 **Database Reset**: Reset to original sample data anytime
- 💡 **Example Queries**: Built-in examples to get started quickly

## Getting Started

### Option 1: Open Locally
1. Download or clone this repository
2. Open `index.html` in any modern web browser
3. Start practicing SQL!

### Option 2: Deploy to GitHub Pages
1. Fork this repository
2. Go to Settings → Pages
3. Set source to "Deploy from a branch"
4. Select `main` branch and `/ (root)` folder
5. Your SQL practice environment will be available at `https://yourusername.github.io/repository-name`

## Sample Database Schema

### Heroes Table
- HeroID (Primary Key)
- HeroName
- RealName
- City
- Universe (Marvel/DC/etc)
- PowerLevel (1-100)
- **FirstAppearance (Date)** - Comic book debut date

### Powers Table
- PowerID (Primary Key)
- PowerName
- PowerType (Physical/Mental/Energy/Reality)
- EnergyRequired
- DangerLevel (1-10)
- **CreationDate (Date)** - When power first documented

### Missions Table
- MissionID (Primary Key)
- HeroID (Foreign Key)
- VillainID (Foreign Key)
- **MissionDate (Date)** - When mission occurred
- Difficulty (Easy/Medium/Hard/Extreme)
- Status (Completed/In Progress/Failed)

### HeroPowers Table (Junction Table)
- HeroID (Foreign Key)
- PowerID (Foreign Key)
- ProficiencyLevel (1-100)
- YearsTraining

### Villains Table
- VillainID (Primary Key)
- VillainName
- RealName
- City
- ThreatLevel (1-10)
- **LastSeen (Date)** - Last known villain activity

## Example Queries

### Basic SELECT
```sql
SELECT * FROM Heroes;
SELECT * FROM Heroes WHERE Universe = 'Marvel';
SELECT * FROM Powers WHERE DangerLevel > 8;
```

### Date-Based Queries
```sql
-- Heroes from the Golden Age (before 1950)
SELECT * FROM Heroes WHERE FirstAppearance < '1950-01-01';

-- Recent missions (last 30 days)
SELECT * FROM Missions WHERE MissionDate > '2024-03-15';

-- Recently active villains
SELECT VillainName, LastSeen FROM Villains WHERE LastSeen > '2024-04-01';

-- Calculate years active for heroes
SELECT HeroName, (2024 - CAST(SUBSTR(FirstAppearance, 1, 4) AS INTEGER)) AS YearsActive 
FROM Heroes 
ORDER BY YearsActive DESC;
```

### Complex Multi-Table Queries
```sql
-- Heroes and their powers
SELECT Heroes.HeroName, Powers.PowerName, HeroPowers.ProficiencyLevel
FROM Heroes, HeroPowers, Powers
WHERE Heroes.HeroID = HeroPowers.HeroID 
AND HeroPowers.PowerID = Powers.PowerID;

-- Successful missions with hero and villain details
SELECT Heroes.HeroName, Villains.VillainName, Missions.MissionDate, Missions.Difficulty
FROM Heroes, Missions, Villains
WHERE Heroes.HeroID = Missions.HeroID 
AND Missions.VillainID = Villains.VillainID 
AND Missions.Status = 'Completed';
```

### Aggregations & Analytics
```sql
-- Heroes ranked by mission count
SELECT Heroes.HeroName, COUNT(Missions.MissionID)
FROM Heroes, Missions
WHERE Heroes.HeroID = Missions.HeroID 
GROUP BY Heroes.HeroID, Heroes.HeroName
ORDER BY COUNT(Missions.MissionID) DESC;

-- Average power level by universe
SELECT Universe, AVG(PowerLevel)
FROM Heroes 
GROUP BY Universe;
```

### INSERT
```sql
INSERT INTO Heroes (HeroName, RealName, City, Universe, PowerLevel) 
VALUES ('Spider-Woman', 'Jessica Drew', 'San Francisco', 'Marvel', 84);
```

### UPDATE
```sql
UPDATE Heroes SET PowerLevel = 100 WHERE HeroName = 'Spider-Man';
```

### DELETE
```sql
DELETE FROM Heroes WHERE HeroName = 'Spider-Woman';
```

### CREATE TABLE
```sql
CREATE TABLE Teams (
    TeamID INTEGER PRIMARY KEY,
    TeamName TEXT NOT NULL,
    LeaderID INTEGER,
    City TEXT,
    Universe TEXT,
    FOREIGN KEY (LeaderID) REFERENCES Heroes(HeroID)
);
```

### ALTER TABLE
```sql
ALTER TABLE Heroes ADD COLUMN FirstAppearance TEXT;
```

### DROP TABLE
```sql
DROP TABLE Teams;
```

## Technologies Used

- **SQL.js**: SQLite compiled to WebAssembly for client-side database operations
- **HTML5/CSS3**: Modern responsive web interface
- **Vanilla JavaScript**: No frameworks required - lightweight and fast
- **GitHub Pages**: Static hosting solution

## Browser Compatibility

This application works in all modern browsers that support WebAssembly:
- Chrome 57+
- Firefox 52+
- Safari 11+
- Edge 16+

## Why This Solution?

- ✅ **No Server Required**: Perfect for static hosting
- ✅ **No Database Setup**: Database runs entirely in browser memory
- ✅ **Full SQL Support**: All standard SQL operations work
- ✅ **Fast Performance**: SQLite is incredibly fast, even in WebAssembly
- ✅ **Private**: All data stays in the user's browser
- ✅ **Educational**: Perfect for learning SQL without complex setup

## Customization

### Adding Your Own Data
Modify the `sampleData` object in `database.js` to include your own sample data.

### Adding More Tables
Add new table definitions in the `createTables()` method in `database.js`.

### Styling
Customize the appearance by modifying `styles.css`.

## Contributing

Feel free to submit issues and pull requests to improve this SQL practice environment!

## License

This project is open source and available under the MIT License.