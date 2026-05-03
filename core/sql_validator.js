/**
 * SQL Validator Middleware
 * Ensures that the generated SQL query is strictly read-only and safe to execute.
 */

class SQLValidator {
    constructor() {
        // Blacklist of destructive commands
        this.blacklist = [
            'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE',
            'TRUNCATE', 'EXEC', 'EXECUTE', 'MERGE', 'GRANT', 'REVOKE',
            'DENY', 'BACKUP', 'RESTORE', 'USE'
        ];

        // Regex to ensure the query starts with SELECT
        this.selectRegex = /^\s*SELECT\b/i;
    }

    /**
     * Validates an SQL query for safety.
     * @param {string} query - The generated SQL query.
     * @returns {Object} { isValid: boolean, error?: string }
     */
    validate(sql) {
        if (!sql) return { isValid: false, error: 'Empty query' };
        
        const cleanedSql = sql.replace(/\/\*[\s\S]*?\*\/|--.*?(?:\n|$)/g, '').trim();
        const upperSql = cleanedSql.toUpperCase();
        
        // Allow SELECT, WITH, and ;WITH (for CTEs)
        if (!upperSql.startsWith('SELECT') && !upperSql.startsWith('WITH') && !upperSql.startsWith(';WITH')) {
            return { isValid: false, error: 'Security Violation: Query must start with SELECT or WITH.' };
        }

        // 2. Must not contain multiple statements (split by ;)
        const parts = sql.split(';').map(p => p.trim()).filter(p => p.length > 0);
        if (parts.length > 1) {
            return { isValid: false, error: "Security Violation: Multiple statements are not allowed." };
        }

        // 3. Must not contain destructive keywords
        for (const keyword of this.blacklist) {
            // Check for the keyword bounded by word boundaries to avoid false positives (e.g., matching 'DROP' inside 'DROPLET')
            const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
            if (keywordRegex.test(upperSql)) {
                return { isValid: false, error: `Security Violation: Destructive keyword '${keyword}' is prohibited.` };
            }
        }

        return { isValid: true };
    }
}

module.exports = new SQLValidator();
