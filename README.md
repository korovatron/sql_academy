# Superhero SQL Training Academy

Superhero SQL Training Academy is a fully client-side SQL practice environment built for teaching and learning SQL in the browser. It uses SQL.js to run SQLite via WebAssembly, so learners can execute queries, modify schema, and explore table relationships without installing any database server.

The project is designed for simple static hosting, including GitHub Pages.

## Features

- Fully client-side: no backend or database server required.
- Interactive SQL editor with in-browser query execution.
- Superhero-themed sample database with heroes, villains, powers, missions, teams, and junction-table exercises.
- Support for `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE TABLE`, `ALTER TABLE`, and `DROP TABLE`.
- Dynamic schema table view that updates when tables change.
- Live schema diagram modal with PK/FK badges, cardinality markers, and obstacle-aware connector routing.
- Responsive layout for desktop, tablet, and mobile use.
- Reset option to restore the original sample database.
- Companion solutions guide in [solutions.html](solutions.html).

## Project Files

- [index.html](index.html): main application UI.
- [app.js](app.js): application logic, editor handling, schema rendering, and diagram generation.
- [database.js](database.js): SQL.js setup, sample data, and schema introspection.
- [styles.css](styles.css): application styling.
- [solutions.html](solutions.html): worked solutions for the exercise set.
- [sw.js](sw.js): service worker for caching and offline support.


## Database Overview

The core sample database includes these main tables:

- `Heroes`: superhero identities and attributes.
- `Powers`: superhero abilities.
- `Villains`: antagonist data.
- `Missions`: links heroes and villains through encounters.
- `HeroPowers`: junction table linking heroes and powers.

Later exercises also introduce:

- `Teams`: superhero teams.
- `TeamMembers`: junction table linking heroes and teams.

## Example Queries

### Basic Selects

```sql
SELECT * FROM Heroes;

SELECT HeroName, PowerLevel
FROM Heroes
WHERE PowerLevel > 90;
```

### Joining Tables

```sql
SELECT Heroes.HeroName, Powers.PowerName
FROM Heroes, HeroPowers, Powers
WHERE Heroes.HeroID = HeroPowers.HeroID
AND HeroPowers.PowerID = Powers.PowerID;
```

### Filtering Mission Data

```sql
SELECT Heroes.HeroName, Villains.VillainName, Missions.Difficulty
FROM Heroes, Villains, Missions
WHERE Heroes.HeroID = Missions.HeroID
AND Villains.VillainID = Missions.VillainID
AND Missions.Status = 'Completed';
```

### Creating a New Table

```sql
CREATE TABLE Teams (
    TeamID INTEGER PRIMARY KEY,
    TeamName TEXT NOT NULL,
    LeaderID INTEGER,
    City TEXT,
    FOREIGN KEY (LeaderID) REFERENCES Heroes(HeroID)
);
```

## Teaching Use

This project is especially suited to classroom demonstrations because it:

- runs without setup on student machines,
- supports live schema changes during lessons,
- visualises relationships in a modal diagram,
- and provides a separate solutions page for review.

## Technology Stack

- SQL.js
- SQLite via WebAssembly
- HTML
- CSS
- Vanilla JavaScript
- GitHub Pages

## Browser Support

The application works in modern browsers with WebAssembly support, including current versions of Chrome, Firefox, Safari, and Edge.

## Customisation

To adapt the project:

- edit sample data in [database.js](database.js),
- add or change exercises in [index.html](index.html),
- update solutions in [solutions.html](solutions.html),
- and tweak styling in [styles.css](styles.css).

## License

This project is available under the MIT License.