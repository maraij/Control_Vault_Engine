import { pool } from "./db.js";

export async function archiveInactiveEmployees({ days = 1 } = {}) {
  const safeDays = Number.isFinite(days) ? Math.max(1, Math.floor(days)) : 1;
  const cutoffSql = `DATE_SUB(CURDATE(), INTERVAL ${safeDays} DAY)`;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [backupResult] = await conn.query(
      `INSERT INTO employee_backup(emp_id, full_name, department, join_date, absent_days, last_active_date, employee_status, backup_reason)
       SELECT emp_id, full_name, department, join_date, absent_days, last_active_date, status, 'AUTO_RETENTION_${safeDays}_DAYS'
       FROM employees
       WHERE status='ACTIVE'
         AND last_active_date IS NOT NULL
         AND last_active_date < ${cutoffSql}`
    );

    const [updateResult] = await conn.query(
      `UPDATE employees
       SET status='ARCHIVED'
       WHERE status='ACTIVE'
         AND last_active_date IS NOT NULL
         AND last_active_date < ${cutoffSql}`
    );

    await conn.query(
      "INSERT INTO audit_logs(action_type, table_name, record_id, description, action_by) VALUES('ARCHIVE','employees',NULL,?,?)",
      [`Auto-archived employees inactive ${safeDays}+ days`, "SYSTEM_CRON"]
    );

    await conn.commit();

    return {
      archived: updateResult?.affectedRows || 0,
      backed_up: backupResult?.affectedRows || 0,
      days: safeDays,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
