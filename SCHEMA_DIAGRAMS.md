# 📊 Interactive Database Schema Diagrams

## Mermaid ERD (GitHub Native Support)

```mermaid
erDiagram
    HEROES {
        int HeroID PK
        string HeroName
        string RealName
        string City
        string Universe
        int PowerLevel
        date FirstAppearance
    }
    
    POWERS {
        int PowerID PK
        string PowerName
        string PowerType
        int EnergyRequired
        int DangerLevel
        date CreationDate
    }
    
    VILLAINS {
        int VillainID PK
        string VillainName
        string RealName
        string City
        int ThreatLevel
        date LastSeen
    }
    
    MISSIONS {
        int MissionID PK
        int HeroID FK
        int VillainID FK
        date MissionDate
        string Difficulty
        string Status
    }
    
    HEROPOWERS {
        int HeroID PK,FK
        int PowerID PK,FK
        int ProficiencyLevel
        int YearsTraining
    }
    
    HEROES ||--o{ MISSIONS : "participates in"
    VILLAINS ||--o{ MISSIONS : "appears in"
    HEROES ||--o{ HEROPOWERS : "has"
    POWERS ||--o{ HEROPOWERS : "belongs to"
```

## 🎯 Relationship Types Explained

### **One-to-Many (1:N)**
- **Heroes → Missions**: One hero can have many missions
- **Villains → Missions**: One villain can appear in many missions

### **Many-to-Many (M:N)**
- **Heroes ↔ Powers**: Implemented via HeroPowers junction table
  - Heroes can have multiple powers
  - Powers can belong to multiple heroes

## 📊 Flow Diagram

```mermaid
flowchart TD
    A[👤 Student Selects Exercise] --> B[📝 Writes SQL Query]
    B --> C[▶️ Executes Query]
    C --> D{Query Type?}
    
    D -->|SELECT| E[📊 Display Results Table]
    D -->|INSERT| F[➕ Add New Record]
    D -->|UPDATE| G[✏️ Modify Existing Data]
    D -->|DELETE| H[🗑️ Remove Records]
    D -->|CREATE/ALTER/DROP| I[🏗️ Modify Schema]
    
    E --> J[✅ Success Message]
    F --> J
    G --> J
    H --> J
    I --> K[🔄 Update Schema Display]
    K --> J
    
    J --> L[🎯 Student Learns SQL Concept]
    L --> A
    
    style A fill:#e1f5fe
    style L fill:#c8e6c9
    style J fill:#fff3e0
```

## 🗂️ Table Relationship Details

### Primary-Foreign Key Relationships

```mermaid
graph LR
    subgraph "Primary Keys"
        H1[Heroes.HeroID]
        P1[Powers.PowerID] 
        V1[Villains.VillainID]
        M1[Missions.MissionID]
    end
    
    subgraph "Foreign Keys"
        M2[Missions.HeroID]
        M3[Missions.VillainID]
        HP1[HeroPowers.HeroID]
        HP2[HeroPowers.PowerID]
    end
    
    H1 -.->|references| M2
    V1 -.->|references| M3
    H1 -.->|references| HP1
    P1 -.->|references| HP2
    
    style H1 fill:#ffcdd2
    style P1 fill:#c8e6c9
    style V1 fill:#fff3e0
    style M1 fill:#e1f5fe
```

## 📈 Data Volume Overview

```mermaid
pie title Database Content
    "Heroes" : 10
    "Powers" : 10
    "Villains" : 10
    "Missions" : 10
    "Hero-Power Links" : 13
```

## 🔄 Query Execution Flow

```mermaid
sequenceDiagram
    participant U as User
    participant E as SQL Editor
    participant D as Database Engine
    participant R as Results Display
    
    U->>E: Types SQL Query
    U->>E: Clicks Execute
    E->>D: Send Query
    
    alt Valid Query
        D->>D: Process Query
        D->>R: Return Results
        R->>U: Display Data/Success
    else Invalid Query
        D->>R: Return Error
        R->>U: Display Error Message
    end
    
    Note over U,R: Real-time feedback for learning
```

## 🎓 Learning Path Through Schema

```mermaid
graph TB
    A[📚 Module 1: Basic SELECT<br/>Single Table Queries] --> B[🤝 Module 2: Basic JOINs<br/>Two Table Relations]
    B --> C[🚀 Module 3: Multi-JOINs<br/>Complex Relations]
    C --> D[➕ Module 4: INSERT<br/>Adding Data]
    D --> E[🔄 Module 5: UPDATE<br/>Modifying Data]
    E --> F[🗑️ Module 6: DELETE<br/>Removing Data]
    F --> G[🏗️ Module 7: DDL<br/>Schema Operations]
    
    style A fill:#e3f2fd
    style B fill:#e8f5e8
    style C fill:#fff3e0
    style D fill:#fce4ec
    style E fill:#f3e5f5
    style F fill:#ffebee
    style G fill:#e0f2f1
```

---

**🎯 These visual representations help students understand:**
- Table relationships and foreign keys
- Data flow and query execution
- Learning progression through modules
- Database design principles

*View these diagrams on GitHub for interactive functionality!* 🚀