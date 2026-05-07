# 💻 SAHAY: Source Code & File Guide
## **Technical Manual for the Hybrid NL2SQL Engine**
**Version**: 2.5 (Modular)

---

## **1. Project Structure Overview**
The project is organized into modular directories to ensure scalability and ease of maintenance.

```text
/nl2sql_agent_ml
├── /core           # Main Backend & Security
├── /intelligence   # AI Models & Training
├── /docs           # Documentation & AI Skills
├── /frontend       # User Interfaces
├── /scripts        # Automation & Launchers
└── .env            # Secrets & API Keys
```

---

## **2. Core Components (`/core`)**

### **`nl2sql_agent.js` (The Heart)**
*   **Purpose**: The main Node.js entry point.
*   **Key Functions**:
    *   Receives Natural Language from the UI.
    *   Executes the Python Neural Router.
    *   Orchestrates the LLM (Groq/Gemini) to generate SQL.
    *   Communicates with the MS SQL Database.

### **`sql_validator.js` (The Shield)**
*   **Purpose**: Security middleware.
*   **Key Functions**:
    *   Parses generated SQL before execution.
    *   Blocks destructive commands (DELETE, DROP, etc.).
    *   Enforces a strict "Read-Only" environment.

---

## **3. Intelligence Layer (`/intelligence`)**

### **`predict_schema.py` (The Inference Brain)**
*   **Purpose**: Uses the trained LSTM to predict the database table.
*   **Why it's needed**: It prevents the LLM from hallucinating table names.

### **`lstm_skill_model.py` (The Trainer)**
*   **Purpose**: The script used to train the neural network.
*   **Data**: Currently trained on 3,991 high-fidelity patterns.

### **`cosec_router.pth` (The Memory)**
*   **Purpose**: The saved "brain weights." This file contains everything the model has learned.

---

## **4. Documentation & AI Skills (`/docs`)**

### **`nl2sql-skill.md` (The Knowledge Base)**
*   **Purpose**: The "Cheat Sheet" for the AI.
*   **Content**: Contains the exact names of all columns, tables, and the rules of T-SQL syntax.

---

## **5. Automation (`/scripts`)**

### **`start_bot.bat` (The Launcher)**
*   **Purpose**: One-click startup script. 
*   **Actions**: Starts the Node.js server, opens the browser, and ensures all dependencies are loaded.

---

## **6. Configuration**

### **`.env` (The Key Ring)**
*   **Purpose**: Stores sensitive information like API Keys and Database credentials.
*   **Feature**: Supports up to 5 Groq keys for automatic rotation and high availability.

---
**Technical Support**: Matrix Comsec IT Division
