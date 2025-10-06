# 🗃️ Database Schema Visual Guide

## 📊 Entity Relationship Diagram (ERD)

### ASCII Art Representation

```
                    ┌─────────────────────┐
                    │       HEROES        │
                    ├─────────────────────┤
                    │ • HeroID (PK)       │
                    │ • HeroName          │
                    │ • RealName          │
                    │ • City              │
                    │ • Universe          │
                    │ • PowerLevel        │
                    │ • FirstAppearance   │
                    └─────────────────────┘
                              │
                              │ 1:N
                              ▼
                    ┌─────────────────────┐
                    │       MISSIONS      │
                    ├─────────────────────┤
                    │ • MissionID (PK)    │
                    │ • HeroID (FK)       │
                    │ • VillainID (FK)    │
                    │ • MissionDate       │
                    │ • Difficulty        │
                    │ • Status            │
                    └─────────────────────┘
                              │
                              │ N:1
                              ▼
                    ┌─────────────────────┐
                    │       VILLAINS      │
                    ├─────────────────────┤
                    │ • VillainID (PK)    │
                    │ • VillainName       │
                    │ • RealName          │
                    │ • City              │
                    │ • ThreatLevel       │
                    │ • LastSeen          │
                    └─────────────────────┘

    ┌─────────────────────┐                    ┌─────────────────────┐
    │       HEROES        │                    │       POWERS        │
    ├─────────────────────┤                    ├─────────────────────┤
    │ • HeroID (PK)       │                    │ • PowerID (PK)      │
    │ • HeroName          │                    │ • PowerName         │
    │ • RealName          │         M:N        │ • PowerType         │
    │ • City              │ ◄─────────────────► │ • EnergyRequired    │
    │ • Universe          │                    │ • DangerLevel       │
    │ • PowerLevel        │                    │ • CreationDate      │
    │ • FirstAppearance   │                    └─────────────────────┘
    └─────────────────────┘                              ▲
              │                                          │
              │                                          │
              ▼                                          │
    ┌─────────────────────┐                              │
    │     HEROPOWERS      │                              │
    │   (Junction Table)  │ ─────────────────────────────┘
    ├─────────────────────┤
    │ • HeroID (PK,FK)    │
    │ • PowerID (PK,FK)   │
    │ • ProficiencyLevel  │
    │ • YearsTraining     │
    └─────────────────────┘
```

## 🔗 Relationship Summary

### **1:N Relationships**
- **Heroes** → **Missions** (One hero can have many missions)
- **Villains** → **Missions** (One villain can be in many missions)

### **M:N Relationship**
- **Heroes** ↔ **Powers** (Many heroes can have many powers)
  - Implemented via **HeroPowers** junction table

## 📋 Detailed Table Structures

### 🦸‍♂️ **HEROES Table**
```
┌────────────────┬─────────────┬─────────────┬─────────────────────┐
│    Column      │    Type     │ Constraints │    Description      │
├────────────────┼─────────────┼─────────────┼─────────────────────┤
│ HeroID         │ INTEGER     │ PRIMARY KEY │ Unique hero ID      │
│ HeroName       │ TEXT        │ NOT NULL    │ Superhero name      │
│ RealName       │ TEXT        │             │ Secret identity     │
│ City           │ TEXT        │             │ Home city           │
│ Universe       │ TEXT        │             │ Marvel/DC/etc       │
│ PowerLevel     │ INTEGER     │             │ 1-100 scale         │
│ FirstAppearance│ TEXT        │             │ YYYY-MM-DD format   │
└────────────────┴─────────────┴─────────────┴─────────────────────┘
```

### ⚡ **POWERS Table**
```
┌────────────────┬─────────────┬─────────────┬─────────────────────┐
│    Column      │    Type     │ Constraints │    Description      │
├────────────────┼─────────────┼─────────────┼─────────────────────┤
│ PowerID        │ INTEGER     │ PRIMARY KEY │ Unique power ID     │
│ PowerName      │ TEXT        │ NOT NULL    │ Name of power       │
│ PowerType      │ TEXT        │             │ Physical/Mental/etc │
│ EnergyRequired │ INTEGER     │             │ Energy cost         │
│ DangerLevel    │ INTEGER     │             │ 1-10 scale          │
│ CreationDate   │ TEXT        │             │ YYYY-MM-DD format   │
└────────────────┴─────────────┴─────────────┴─────────────────────┘
```

### 🦹‍♂️ **VILLAINS Table**
```
┌────────────────┬─────────────┬─────────────┬─────────────────────┐
│    Column      │    Type     │ Constraints │    Description      │
├────────────────┼─────────────┼─────────────┼─────────────────────┤
│ VillainID      │ INTEGER     │ PRIMARY KEY │ Unique villain ID   │
│ VillainName    │ TEXT        │ NOT NULL    │ Villain name        │
│ RealName       │ TEXT        │             │ Real identity       │
│ City           │ TEXT        │             │ Operating city      │
│ ThreatLevel    │ INTEGER     │             │ 1-10 scale          │
│ LastSeen       │ TEXT        │             │ YYYY-MM-DD format   │
└────────────────┴─────────────┴─────────────┴─────────────────────┘
```

### 🎯 **MISSIONS Table**
```
┌────────────────┬─────────────┬─────────────┬─────────────────────┐
│    Column      │    Type     │ Constraints │    Description      │
├────────────────┼─────────────┼─────────────┼─────────────────────┤
│ MissionID      │ INTEGER     │ PRIMARY KEY │ Unique mission ID   │
│ HeroID         │ INTEGER     │ FOREIGN KEY │ → Heroes.HeroID     │
│ VillainID      │ INTEGER     │ FOREIGN KEY │ → Villains.VillainID│
│ MissionDate    │ TEXT        │             │ YYYY-MM-DD format   │
│ Difficulty     │ TEXT        │             │ Easy/Medium/Hard    │
│ Status         │ TEXT        │             │ Completed/Failed    │
└────────────────┴─────────────┴─────────────┴─────────────────────┘
```

### 🔗 **HEROPOWERS Table** (Junction)
```
┌────────────────┬─────────────┬─────────────┬─────────────────────┐
│    Column      │    Type     │ Constraints │    Description      │
├────────────────┼─────────────┼─────────────┼─────────────────────┤
│ HeroID         │ INTEGER     │ PRIMARY KEY │ → Heroes.HeroID     │
│                │             │ FOREIGN KEY │                     │
│ PowerID        │ INTEGER     │ PRIMARY KEY │ → Powers.PowerID    │
│                │             │ FOREIGN KEY │                     │
│ ProficiencyLevel│ INTEGER    │             │ 1-100 skill level   │
│ YearsTraining  │ INTEGER     │             │ Training duration   │
└────────────────┴─────────────┴─────────────┴─────────────────────┘
```

## 🎭 Sample Data Overview

### Heroes Data
```
Spider-Man    │ Marvel   │ New York      │ Power: 85
Batman        │ DC       │ Gotham        │ Power: 90
Wonder Woman  │ DC       │ Washington DC │ Power: 95
Iron Man      │ Marvel   │ New York      │ Power: 88
Superman      │ DC       │ Metropolis    │ Power: 98
... and 5 more heroes
```

### Powers Data
```
Web Slinging     │ Physical │ Danger: 3
Super Strength   │ Physical │ Danger: 4
Flight          │ Physical │ Danger: 2
Telepathy       │ Mental   │ Danger: 5
Reality Warping │ Reality  │ Danger: 10
... and 5 more powers
```

### Villains Data
```
Green Goblin    │ New York      │ Threat: 8
Joker          │ Gotham        │ Threat: 9
Lex Luthor     │ Metropolis    │ Threat: 8
Dormammu       │ New York      │ Threat: 10
... and 6 more villains
```

## 📊 Data Relationships Explained

### **Many-to-Many: Heroes ↔ Powers**
- Heroes can have multiple powers
- Powers can belong to multiple heroes
- **Example**: Superman has Super Strength, Flight, and Energy Blasts
- **Example**: Super Strength is shared by Superman, Wonder Woman, and Spider-Man

### **One-to-Many: Heroes → Missions**
- Each hero can participate in multiple missions
- Each mission involves exactly one hero
- **Example**: Spider-Man has fought Green Goblin multiple times

### **One-to-Many: Villains → Missions**
- Each villain can be involved in multiple missions
- Each mission involves exactly one villain
- **Example**: Joker has battled Batman on several occasions

## 🔍 Query Patterns

### **Simple Joins**
```sql
-- Heroes and their missions
SELECT h.HeroName, m.MissionDate
FROM Heroes h, Missions m
WHERE h.HeroID = m.HeroID;
```

### **Junction Table Queries**
```sql
-- Heroes and their powers
SELECT h.HeroName, p.PowerName, hp.ProficiencyLevel
FROM Heroes h, Powers p, HeroPowers hp
WHERE h.HeroID = hp.HeroID 
AND p.PowerID = hp.PowerID;
```

### **Three-Way Joins**
```sql
-- Complete mission details
SELECT h.HeroName, v.VillainName, m.MissionDate, m.Status
FROM Heroes h, Villains v, Missions m
WHERE h.HeroID = m.HeroID 
AND v.VillainID = m.VillainID;
```

## 🎯 Learning Objectives

This schema teaches:
- **Primary Keys** (single column identifiers)
- **Foreign Keys** (referential integrity)
- **Composite Primary Keys** (HeroPowers table)
- **One-to-Many relationships** (Heroes/Villains → Missions)
- **Many-to-Many relationships** (Heroes ↔ Powers via junction table)
- **Data normalization** (avoiding redundancy)
- **Real-world modeling** (superhero universe simulation)

---

*Perfect for learning SQL concepts with an engaging superhero theme! 🦸‍♂️⚡*