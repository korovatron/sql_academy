# 🦸‍♂️ Mr Kendall's SQL Academy - Complete Solutions Guide

## 📖 About This Guide

This comprehensive guide contains solutions for all 44 exercises in Mr Kendall's SQL Academy. Each solution is designed to teach specific SQL concepts using our superhero database schema.

## 🗃️ Database Schema Overview

The superhero database consists of 5 main tables:

### **Heroes Table**
- `HeroID` (INTEGER PRIMARY KEY)
- `HeroName` (TEXT NOT NULL)
- `RealName` (TEXT)
- `City` (TEXT)
- `Universe` (TEXT) - Marvel or DC
- `PowerLevel` (INTEGER) - 1-100 scale
- `FirstAppearance` (TEXT) - Date in YYYY-MM-DD format

### **Powers Table**
- `PowerID` (INTEGER PRIMARY KEY)
- `PowerName` (TEXT NOT NULL)
- `PowerType` (TEXT) - Physical, Mental, Energy, Reality
- `EnergyRequired` (INTEGER)
- `DangerLevel` (INTEGER) - 1-10 scale
- `CreationDate` (TEXT) - Date in YYYY-MM-DD format

### **Villains Table**
- `VillainID` (INTEGER PRIMARY KEY)
- `VillainName` (TEXT NOT NULL)
- `RealName` (TEXT)
- `City` (TEXT)
- `ThreatLevel` (INTEGER) - 1-10 scale
- `LastSeen` (TEXT) - Date in YYYY-MM-DD format

### **Missions Table**
- `MissionID` (INTEGER PRIMARY KEY)
- `HeroID` (INTEGER) - Foreign Key to Heroes
- `VillainID` (INTEGER) - Foreign Key to Villains
- `MissionDate` (TEXT) - Date in YYYY-MM-DD format
- `Difficulty` (TEXT) - Easy, Medium, Hard, Extreme
- `Status` (TEXT) - Completed, In Progress, Failed
- **Foreign Key Constraints:** HeroID → Heroes(HeroID), VillainID → Villains(VillainID)

### **HeroPowers Table** (Junction Table)
- `HeroID` (INTEGER) - Foreign Key to Heroes, part of composite primary key
- `PowerID` (INTEGER) - Foreign Key to Powers, part of composite primary key
- `ProficiencyLevel` (INTEGER) - 1-100 scale
- `YearsTraining` (INTEGER)
- **Composite Primary Key:** (HeroID, PowerID)
- **Foreign Key Constraints:** HeroID → Heroes(HeroID), PowerID → Powers(PowerID)

---

## 🏋️‍♂️ **Module 1: SELECT (6 exercises)**
*Master the art of querying data with SELECT statements*

### **Exercise 1: Basic SELECT** 
**Task:** Select all columns from the Heroes table to see all superheroes in the database.

```sql
SELECT * FROM Heroes;
```

**Learning Goal:** Basic SELECT syntax with wildcard (*)

---

### **Exercise 2: Filtering by Text**
**Task:** Select all heroes where the Universe is exactly 'Marvel'. Show all columns.

```sql
SELECT * FROM Heroes WHERE Universe = 'Marvel';
```

**Learning Goal:** WHERE clause with text filtering

---

### **Exercise 3: Filtering by Number Range**
**Task:** Select the HeroName and PowerLevel for all heroes where PowerLevel is greater than 90.

```sql
SELECT HeroName, PowerLevel FROM Heroes WHERE PowerLevel > 90;
```

**Learning Goal:** Specific column selection and numeric comparisons

---

### **Exercise 4: Ordering Results**
**Task:** Select HeroName and City from Heroes table, ordered alphabetically by HeroName (A to Z).

```sql
SELECT HeroName, City FROM Heroes ORDER BY HeroName ASC;
```

**Learning Goal:** ORDER BY clause for sorting results

---

### **Exercise 5: Date Range Query**
**Task:** Select HeroName and FirstAppearance for heroes who first appeared before 1950-01-01. These are the Golden Age heroes.

```sql
SELECT HeroName, FirstAppearance FROM Heroes WHERE FirstAppearance < '1950-01-01';
```

**Learning Goal:** Date comparisons and filtering

---

### **Exercise 6: Descending Order**
**Task:** Select VillainName and ThreatLevel from Villains table, ordered by ThreatLevel from highest to lowest (descending).

```sql
SELECT VillainName, ThreatLevel FROM Villains ORDER BY ThreatLevel DESC;
```

**Learning Goal:** Descending sort order

---

## 🤝 **Module 2: JOIN tables (4 exercises)**
*Learn to combine data from multiple tables*

### **Exercise 7: Basic Two-Table Join**
**Task:** Show each hero's name along with their mission dates. Select HeroName from Heroes and MissionDate from Missions. Use WHERE to join Heroes.HeroID = Missions.HeroID.

```sql
SELECT Heroes.HeroName, Missions.MissionDate 
FROM Heroes, Missions 
WHERE Heroes.HeroID = Missions.HeroID;
```

**Learning Goal:** Basic implicit join syntax with WHERE clause

---

### **Exercise 8: Filtered Two-Table Join**
**Task:** Show hero names and villain names for completed missions only. Select HeroName from Heroes and VillainName from Villains, joining through Missions where Status = 'Completed'.

```sql
SELECT Heroes.HeroName, Villains.VillainName 
FROM Heroes, Villains, Missions 
WHERE Heroes.HeroID = Missions.HeroID 
AND Villains.VillainID = Missions.VillainID 
AND Missions.Status = 'Completed';
```

**Learning Goal:** Three-table join with filtering conditions

---

### **Exercise 9: Hero Powers**
**Task:** Show each hero's name and their power names. Select HeroName from Heroes and PowerName from Powers, using the HeroPowers junction table to connect them.

```sql
SELECT Heroes.HeroName, Powers.PowerName 
FROM Heroes, Powers, HeroPowers 
WHERE Heroes.HeroID = HeroPowers.HeroID 
AND Powers.PowerID = HeroPowers.PowerID;
```

**Learning Goal:** Many-to-many relationships through junction tables

---

### **Exercise 10: Recent Missions**
**Task:** Show hero names and mission dates for missions that occurred after 2024-03-20. Order by mission date (newest first).

```sql
SELECT Heroes.HeroName, Missions.MissionDate 
FROM Heroes, Missions 
WHERE Heroes.HeroID = Missions.HeroID 
AND Missions.MissionDate > '2024-03-20' 
ORDER BY Missions.MissionDate DESC;
```

**Learning Goal:** Combining joins with date filtering and sorting

---

## 🚀 **Module 3: JOIN multiple tables (5 exercises)**
*Master complex multi-table operations*

### **Exercise 11: Complete Mission Details**
**Task:** Show HeroName, VillainName, and MissionDate for all completed missions. You'll need to join Heroes, Villains, and Missions tables.

```sql
SELECT Heroes.HeroName, Villains.VillainName, Missions.MissionDate 
FROM Heroes, Villains, Missions 
WHERE Heroes.HeroID = Missions.HeroID 
AND Villains.VillainID = Missions.VillainID 
AND Missions.Status = 'Completed';
```

**Learning Goal:** Complex three-table joins with filtering

---

### **Exercise 12: Power Analysis**
**Task:** Show HeroName, PowerName, and ProficiencyLevel for heroes with proficiency above 90. Join Heroes, Powers, and HeroPowers tables.

```sql
SELECT Heroes.HeroName, Powers.PowerName, HeroPowers.ProficiencyLevel 
FROM Heroes, Powers, HeroPowers 
WHERE Heroes.HeroID = HeroPowers.HeroID 
AND Powers.PowerID = HeroPowers.PowerID 
AND HeroPowers.ProficiencyLevel > 90;
```

**Learning Goal:** Junction table queries with numeric filtering

---

### **Exercise 13: Dangerous Power Users**
**Task:** Show HeroName, PowerName, and DangerLevel for powers with DangerLevel greater than 7. Order by DangerLevel descending.

```sql
SELECT Heroes.HeroName, Powers.PowerName, Powers.DangerLevel 
FROM Heroes, Powers, HeroPowers 
WHERE Heroes.HeroID = HeroPowers.HeroID 
AND Powers.PowerID = HeroPowers.PowerID 
AND Powers.DangerLevel > 7 
ORDER BY Powers.DangerLevel DESC;
```

**Learning Goal:** Multi-table joins with ordering by specific criteria

---

### **Exercise 14: Mission Difficulty Analysis**
**Task:** Show HeroName, VillainName, and Difficulty for all 'Hard' or 'Extreme' difficulty missions, ordered by hero name alphabetically.

```sql
SELECT Heroes.HeroName, Villains.VillainName, Missions.Difficulty 
FROM Heroes, Villains, Missions 
WHERE Heroes.HeroID = Missions.HeroID 
AND Villains.VillainID = Missions.VillainID 
AND (Missions.Difficulty = 'Hard' OR Missions.Difficulty = 'Extreme') 
ORDER BY Heroes.HeroName ASC;
```

**Learning Goal:** OR conditions and multiple criteria filtering

---

### **Exercise 15: Advanced Hero Analysis**
**Task:** Show HeroName, PowerName, and FirstAppearance for Marvel heroes who have Reality-type powers. Order by PowerName alphabetically.

```sql
SELECT Heroes.HeroName, Powers.PowerName, Heroes.FirstAppearance 
FROM Heroes, Powers, HeroPowers 
WHERE Heroes.HeroID = HeroPowers.HeroID 
AND Powers.PowerID = HeroPowers.PowerID 
AND Heroes.Universe = 'Marvel' 
AND Powers.PowerType = 'Reality' 
ORDER BY Powers.PowerName ASC;
```

**Learning Goal:** Complex filtering across multiple tables with multiple conditions

---

## ➕ **Module 4: INSERT INTO (5 exercises)**
*Learn to add new data to your database*

### **Exercise 16: Add New Hero**
**Task:** Insert a new hero named 'Deadpool' with real name 'Wade Wilson', city 'New York', universe 'Marvel', power level 75, and first appearance '1991-02-01'.

```sql
INSERT INTO Heroes (HeroID, HeroName, RealName, City, Universe, PowerLevel, FirstAppearance) 
VALUES (11, 'Deadpool', 'Wade Wilson', 'New York', 'Marvel', 75, '1991-02-01');
```

**Learning Goal:** Basic INSERT syntax with all columns specified

---

### **Exercise 17: Create New Power**
**Task:** Insert a new power called 'Regeneration' with power type 'Physical', energy required 20, danger level 3, and creation date '1991-02-01'.

```sql
INSERT INTO Powers (PowerID, PowerName, PowerType, EnergyRequired, DangerLevel, CreationDate) 
VALUES (11, 'Regeneration', 'Physical', 20, 3, '1991-02-01');
```

**Learning Goal:** INSERT with different data types (text, integer, date)

---

### **Exercise 18: Create New Villain**
**Task:** Insert a new villain named 'Venom' with real name 'Eddie Brock', city 'New York', threat level 7, and last seen '2024-05-01'.

```sql
INSERT INTO Villains (VillainID, VillainName, RealName, City, ThreatLevel, LastSeen) 
VALUES (211, 'Venom', 'Eddie Brock', 'New York', 7, '2024-05-01');
```

**Learning Goal:** INSERT into different table structures

---

### **Exercise 19: Assign Power to Hero**
**Task:** Give Deadpool (HeroID 11) the Regeneration power (PowerID 11) with proficiency level 95 and 10 years of training. Insert into HeroPowers table.

```sql
INSERT INTO HeroPowers (HeroID, PowerID, ProficiencyLevel, YearsTraining) 
VALUES (11, 11, 95, 10);
```

**Learning Goal:** Working with junction tables and foreign key relationships

---

### **Exercise 20: Create Mission**
**Task:** Create a new mission with ID 1011 where Deadpool (HeroID 11) fights Venom (VillainID 211) on '2024-05-15' with 'Medium' difficulty and 'In Progress' status.

```sql
INSERT INTO Missions (MissionID, HeroID, VillainID, MissionDate, Difficulty, Status) 
VALUES (1011, 11, 211, '2024-05-15', 'Medium', 'In Progress');
```

**Learning Goal:** Creating records that reference other tables via foreign keys

---

## 🔄 **Module 5: UPDATE (5 exercises)**
*Master the art of modifying existing data*

### **Exercise 21: Power Level Boost**
**Task:** Update Spider-Man's power level to 90. Use UPDATE statement with WHERE clause to target the specific hero by name.

```sql
UPDATE Heroes SET PowerLevel = 90 WHERE HeroName = 'Spider-Man';
```

**Learning Goal:** Basic UPDATE syntax with WHERE condition

---

### **Exercise 22: Mission Status Update**
**Task:** Update the mission with ID 1004 to change its status from 'In Progress' to 'Completed'.

```sql
UPDATE Missions SET Status = 'Completed' WHERE MissionID = 1004;
```

**Learning Goal:** Updating specific records using primary key

---

### **Exercise 23: Villain Activity Update**
**Task:** Update the Joker's last seen date to '2024-10-01' to reflect recent criminal activity.

```sql
UPDATE Villains SET LastSeen = '2024-10-01' WHERE VillainName = 'Joker';
```

**Learning Goal:** Updating date fields with text-based WHERE conditions

---

### **Exercise 24: Multiple Field Update**
**Task:** Update Iron Man to increase his power level to 95 AND change his city to 'Los Angeles'. Use a single UPDATE statement.

```sql
UPDATE Heroes SET PowerLevel = 95, City = 'Los Angeles' WHERE HeroName = 'Iron Man';
```

**Learning Goal:** Updating multiple columns in a single statement

---

### **Exercise 25: Conditional Power Update**
**Task:** Update all powers with danger level greater than 8 to increase their energy required by 10. This affects multiple records with one UPDATE.

```sql
UPDATE Powers SET EnergyRequired = EnergyRequired + 10 WHERE DangerLevel > 8;
```

**Learning Goal:** Bulk updates affecting multiple records, arithmetic in UPDATE

---

## 🗑️ **Module 6: DELETE (5 exercises)**
*Learn to safely remove unwanted data*

### **Exercise 26: Remove Failed Mission**
**Task:** Delete the mission with status 'Failed' from the Missions table. Use WHERE clause to target only failed missions.

```sql
DELETE FROM Missions WHERE Status = 'Failed';
```

**Learning Goal:** Basic DELETE syntax with WHERE condition

---

### **Exercise 27: Remove Low-Threat Villain**
**Task:** Delete the villain 'Taskmaster' from the Villains table. Target by villain name.

```sql
DELETE FROM Villains WHERE VillainName = 'Taskmaster';
```

**Learning Goal:** DELETE using text-based WHERE conditions

---

### **Exercise 28: Remove Hero Power**
**Task:** Remove the power relationship between Iron Man (HeroID 4) and Flight (PowerID 3) from the HeroPowers table. Use both HeroID and PowerID in WHERE clause.

```sql
DELETE FROM HeroPowers WHERE HeroID = 4 AND PowerID = 3;
```

**Learning Goal:** DELETE with multiple WHERE conditions (AND operator)

---

### **Exercise 29: Delete Old Missions**
**Task:** Delete all missions that occurred before '2024-03-20' from the Missions table. Use date comparison in WHERE clause.

```sql
DELETE FROM Missions WHERE MissionDate < '2024-03-20';
```

**Learning Goal:** Bulk DELETE operations with date comparisons

---

### **Exercise 30: Remove Low-Power Heroes**
**Task:** Delete all heroes with power level less than 85 from the Heroes table. This will affect multiple records - be careful with your WHERE clause!

```sql
DELETE FROM Heroes WHERE PowerLevel < 85;
```

**Learning Goal:** Bulk DELETE with numeric conditions (affects multiple records)

---

## 🏗️ **Module 7: CREATE TABLE (15 exercises)**
*Master database structure with Data Definition Language*

### **Exercise 31: Create Teams Table**
**Task:** Create a new table called 'Teams' with columns: TeamID (INTEGER PRIMARY KEY), TeamName (TEXT NOT NULL), LeaderID (INTEGER), and City (TEXT).

```sql
CREATE TABLE Teams (
    TeamID INTEGER PRIMARY KEY,
    TeamName TEXT NOT NULL,
    LeaderID INTEGER,
    City TEXT
);
```

**Learning Goal:** CREATE TABLE syntax with different column types and constraints

---

### **Exercise 32: Populate Teams Table**
**Task:** Insert three teams into the Teams table: (1, 'Avengers', 7, 'New York'), (2, 'Justice League', 7, 'Washington DC'), and (3, 'X-Men', 10, 'New York').

```sql
INSERT INTO Teams (TeamID, TeamName, LeaderID, City) VALUES 
(1, 'Avengers', 7, 'New York'),
(2, 'Justice League', 7, 'Washington DC'),
(3, 'X-Men', 10, 'New York');
```

**Learning Goal:** Multiple INSERT statements, populating a new table

---

### **Exercise 33: Add More Teams**
**Task:** Insert two more teams: (4, 'Fantastic Four', 4, 'New York') and (5, 'Teen Titans', 3, 'Jump City').

```sql
INSERT INTO Teams (TeamID, TeamName, LeaderID, City) VALUES 
(4, 'Fantastic Four', 4, 'New York'),
(5, 'Teen Titans', 3, 'Jump City');
```

**Learning Goal:** Continuing to populate tables with additional records

---

### **Exercise 34: Correct Team Leader**
**Task:** There's an error! Justice League should be led by Superman (HeroID 7), but Avengers should be led by Iron Man (HeroID 4). Update the Avengers record to fix this mistake.

```sql
UPDATE Teams SET LeaderID = 4 WHERE TeamName = 'Avengers';
```

**Learning Goal:** Data correction using UPDATE on newly created tables

---

### **Exercise 35: Update Team Location**
**Task:** The Teen Titans have moved! Update their city from 'Jump City' to 'San Francisco' to reflect their new headquarters location.

```sql
UPDATE Teams SET City = 'San Francisco' WHERE TeamName = 'Teen Titans';
```

**Learning Goal:** Updating records in custom tables

---

### **Exercise 36: Add Column to Teams**
**Task:** Add a new column called 'Founded' with data type TEXT to the Teams table to track when each team was established.

```sql
ALTER TABLE Teams ADD COLUMN Founded TEXT;
```

**Learning Goal:** ALTER TABLE to add new columns to existing tables

---

### **Exercise 37: Update Founded Dates**
**Task:** Update the Teams table to set founding dates: Avengers = '1963-09-01', Justice League = '1960-03-01', X-Men = '1963-09-01', Fantastic Four = '1961-11-01', Teen Titans = '1964-07-01'.

```sql
UPDATE Teams SET Founded = '1963-09-01' WHERE TeamName = 'Avengers';
UPDATE Teams SET Founded = '1960-03-01' WHERE TeamName = 'Justice League';
UPDATE Teams SET Founded = '1963-09-01' WHERE TeamName = 'X-Men';
UPDATE Teams SET Founded = '1961-11-01' WHERE TeamName = 'Fantastic Four';
UPDATE Teams SET Founded = '1964-07-01' WHERE TeamName = 'Teen Titans';
```

**Learning Goal:** Multiple UPDATE statements to populate new columns

---

### **Exercise 38: Remove Disbanded Team**
**Task:** Unfortunately, the Fantastic Four has disbanded. Delete their record from the Teams table.

```sql
DELETE FROM Teams WHERE TeamName = 'Fantastic Four';
```

**Learning Goal:** DELETE operations on custom tables

---

### **Exercise 39: Create Team Members Junction Table**
**Task:** Create a new table called 'TeamMembers' to link heroes to teams. Columns: HeroID (INTEGER), TeamID (INTEGER), JoinDate (TEXT), Role (TEXT). This creates a many-to-many relationship.

```sql
CREATE TABLE TeamMembers (
    HeroID INTEGER,
    TeamID INTEGER,
    JoinDate TEXT,
    Role TEXT
);
```

**Learning Goal:** Creating junction tables for many-to-many relationships

---

### **Exercise 40: Add Heroes to Avengers**
**Task:** Add Spider-Man (HeroID 1), Iron Man (HeroID 4), and Captain America (HeroID 8) to the Avengers team (TeamID 1). Set join dates to '2024-01-01' and roles to 'Member'.

```sql
INSERT INTO TeamMembers (HeroID, TeamID, JoinDate, Role) VALUES 
(1, 1, '2024-01-01', 'Member'),
(4, 1, '2024-01-01', 'Member'),
(8, 1, '2024-01-01', 'Member');
```

**Learning Goal:** Populating junction tables with relationship data

---

### **Exercise 41: Add Heroes to Justice League**
**Task:** Add Superman (HeroID 7), Batman (HeroID 2), and Wonder Woman (HeroID 3) to Justice League (TeamID 2). Set join dates to '2024-02-01' and roles to 'Member'.

```sql
INSERT INTO TeamMembers (HeroID, TeamID, JoinDate, Role) VALUES 
(7, 2, '2024-02-01', 'Member'),
(2, 2, '2024-02-01', 'Member'),
(3, 2, '2024-02-01', 'Member');
```

**Learning Goal:** Additional practice with junction table inserts

---

### **Exercise 42: Query Team Rosters**
**Task:** Show team names with their member hero names. Use a three-table join connecting Teams, Heroes, and TeamMembers to display which heroes belong to which teams.

```sql
SELECT TeamName, HeroName 
FROM Teams, Heroes, TeamMembers 
WHERE Teams.TeamID = TeamMembers.TeamID 
AND Heroes.HeroID = TeamMembers.HeroID;
```

**Learning Goal:** Three-table joins using junction tables

---

### **Exercise 43: Remove Team Member**
**Task:** Spider-Man is leaving the Avengers! Delete the record from TeamMembers where HeroID = 1 AND TeamID = 1.

```sql
DELETE FROM TeamMembers WHERE HeroID = 1 AND TeamID = 1;
```

**Learning Goal:** Deleting specific relationships from junction tables

---

### **Exercise 44: Clean Up All Tables**
**Task:** Clean up the database by removing both the TeamMembers and Teams tables using DROP TABLE statements.

```sql
DROP TABLE TeamMembers;
DROP TABLE Teams;
```

**Learning Goal:** Proper cleanup order when dropping related tables

---

## 🎯 **Learning Progression Summary**

### **Beginner Level (Exercises 1-15)**
- Basic SELECT statements (Exercises 1-6)
- Simple two-table joins (Exercises 7-10)
- Complex multi-table joins (Exercises 11-15)

### **Intermediate Level (Exercises 16-30)**
- INSERT statements for adding data (Exercises 16-20)
- UPDATE statements for modifying data (Exercises 21-25)
- DELETE operations for data removal (Exercises 26-30)

### **Advanced Level (Exercises 31-44)**
- DDL operations (CREATE, ALTER, DROP) (Exercises 31-44)
- Database design and table management
- Junction tables and many-to-many relationships
- Data integrity and relationships

## 💡 **SQL Best Practices Learned**

1. **Always use WHERE clauses** with UPDATE and DELETE to avoid affecting all records
2. **Test queries with SELECT first** before using UPDATE or DELETE
3. **Use meaningful column and table names** for clarity
4. **Understand foreign key relationships** before inserting data
5. **Plan your database structure** before creating tables
6. **Use transactions** for complex operations (advanced topic)

## 🚀 **Next Steps**

After completing these exercises, students should be able to:
- Write complex SELECT queries with multiple joins
- Insert, update, and delete data safely
- Create and modify database structures
- Understand relational database concepts
- Work with real-world database scenarios

---

**Happy Querying, Future SQL Heroes! 🦸‍♂️🦸‍♀️**

*"With great SQL power comes great responsibility!"* - Uncle Ben (probably)