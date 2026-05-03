# SAHAY AI Bot: Production Architecture & Dependency Audit
**Project**: Matrix COSEC NL2SQL Intelligence
**Version**: 2.5 (2026 Edition)
**Status**: Production Ready

## 1. Core Dependency Matrix

| Dependency | Category | Role | Enterprise Use Case |
| :--- | :--- | :--- | :--- |
| **Express.js** | Backend Framework | API Routing & Static Hosting | Manages the `POST /api/nl2sql` endpoint and serves the Matrix Portal. |
| **MSSQL (Node-MSSQL)** | Database Driver | Persistent SQL Connection | Executes AI-generated T-SQL against the COSEC database using connection pooling. |
| **SQL-Validator** | Security | Read-Only Enforcement | Intercepts SQL strings to prevent malicious or accidental data modification (`DROP`, `DELETE`). |
| **HTTPS (Native)** | Communication | Groq API Interface | Communicates with the 2026 Llama 4 / Qwen 3 model pool with automatic failover. |
| **React / Tailwind** | Frontend | User Dashboard | Provides a real-time, responsive interface for querying and visualizing data. |

## 2. Component Workflow (Life of a Query)

1.  **Input**: User enters *"Who was late yesterday?"* in the SAHAY dashboard.
2.  **Hybrid Routing (NEW)**: Node.js executes `predict_schema.py`. A trained Bi-LSTM predicts `Mx_VEW_DailyAttendance` as the target schema.
3.  **Prompt Construction**: `nl2sql_agent.js` combines the user query with the **LSTM Prediction Hints**, `nl2sql-skill.md` (Schema Context), and the **IST Timezone offset (+5:30)**.
4.  **Intelligence Phase**: 
    *   Attempts `llama-3.3-70b` with deterministic schema hints. 
    *   If rate-limited, fails over to `llama-4-scout-17b`.
    *   Model returns a raw T-SQL query.
4.  **Validation Phase**: `sql_validator.js` checks the query. 
    *   *Pass*: Proceed to DB. 
    *   *Fail*: Return error to user.
5.  **Execution Phase**: `mssql` pool runs the query and returns JSON records.
6.  **Summarization Phase**: The LLM creates a natural language summary (e.g., *"There were 5 late entries yesterday..."*) in IST.
7.  **Display**: React renders the summary and the data table simultaneously.

## 3. Redundancy & Resilience
The system uses a **Tiered Failover Strategy** for the 2026 Groq API:
- **Tier 1 (High Accuracy)**: Llama 3.3 70B.
- **Tier 2 (New Gen)**: Llama 4 Scout (meta-llama/llama-4-scout-17b-16e-instruct).
- **Tier 3 (Alternative)**: Qwen 3 32B (qwen/qwen3-32b).
- **Tier 4 (Speed)**: Llama 3.1 8B.

## 4. Maintenance Guidelines
- **Schema Updates**: If you add new views to COSEC, update `nl2sql-skill.md`.
- **Credential Rotation**: Update the `.env` file; the bot will pick up changes on restart.
- **Model Migration**: The `MODEL_POOL` constant in `nl2sql_agent.js` is the single point of control for AI engines.
