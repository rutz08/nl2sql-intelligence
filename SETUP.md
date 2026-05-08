# 🚀 COSEC NL2SQL Agent - Deployment Guide

This guide will help you set up the COSEC NL2SQL Intelligence Agent on a new laptop.

## 📋 Prerequisites

1.  **Node.js**: [Download and Install v18+](https://nodejs.org/)
2.  **Python**: [Download and Install v3.10+](https://www.python.org/)
3.  **MS SQL Server**: Ensure the target laptop can connect to the COSEC database (via local network or VPN).
4.  **Git**: To clone the repository.

---

## 🛠️ Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/rutz08/nl2sql-intelligence.git
cd nl2sql-intelligence
```

### 2. Install Node.js Dependencies
```bash
npm install
```

### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory with your credentials:
```env
# AI API Keys
GEMINI_API_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here

# Database Configuration
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SERVER=localhost
DB_DATABASE=COSEC_DEMO
```

---

## 🚀 Running the Agent

### Method A: One-Click Launcher (Windows)
Double-click the `run_agent.bat` file in the root directory.

### Method B: Manual Startup
```bash
node core/nl2sql_agent.js
```

The agent will be available at: **http://localhost:3000**

---

## 🗄️ Database Migration (Transferring Data)

If you want to move the data from your old laptop to this one:

### 1. On the OLD Laptop:
- Run `BACKUP_DATABASE.bat`.
- Copy the generated `COSEC_DEMO_Backup.bak` file to the new laptop.

### 2. On the NEW Laptop:
- Open SQL Server Management Studio (SSMS).
- Right-click **Databases** -> **Restore Database...**
- Select **Device** and choose the `.bak` file you copied.
- Ensure the database name is `COSEC_DEMO`.

---

## 🔍 Verification
1.  Open `http://localhost:3000/react_frontend.html` in your browser.
2.  Ask a simple question: *"Show me today's attendance."*
3.  If the database is connected, you should see results immediately.

---

## 💡 Troubleshooting
- **Database Connection Error**: Ensure the SQL Server instance name and credentials in `.env` are correct. Enable TCP/IP in SQL Server Configuration Manager.
- **Python Error**: Ensure `torch` and `numpy` are installed. Run `python --version` to check your environment.
- **Port Conflict**: If port 3000 is used, change the port in `core/nl2sql_agent.js`.
