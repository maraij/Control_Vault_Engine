import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/performance", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM v_employee_performance_summary"
    );
    return res.json({ ok: true, data: rows });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.get("/performance-summary", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        emp_id,
        full_name,
        tasks_done_today,
        active_projects,
        completed_projects,
        clients_handled AS clients_count
      FROM v_employee_performance_summary
      ORDER BY emp_id`
    );
    return res.json({ ok: true, data: rows });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.get("/audit-today", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM v_audit_today");
    return res.json({ ok: true, data: rows[0] || null });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.get("/audit-today-summary", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        SUM(CASE WHEN LOWER(table_name)='employees' AND UPPER(action_type) IN ('ADD','CREATE','INSERT') THEN 1 ELSE 0 END) AS employees_added,
        SUM(CASE WHEN LOWER(table_name)='employees' AND UPPER(action_type) IN ('DELETE','REMOVE') THEN 1 ELSE 0 END) AS employees_deleted,
        SUM(CASE WHEN LOWER(table_name)='employees' AND UPPER(action_type) IN ('ARCHIVE') THEN 1 ELSE 0 END) AS employees_archived,
        SUM(CASE WHEN LOWER(table_name)='clients' AND UPPER(action_type) IN ('ADD','CREATE','INSERT') THEN 1 ELSE 0 END) AS clients_added,
        SUM(CASE WHEN LOWER(table_name)='clients' AND UPPER(action_type) IN ('DELETE','REMOVE') THEN 1 ELSE 0 END) AS clients_deleted,
        SUM(CASE WHEN LOWER(table_name)='projects' AND UPPER(action_type) IN ('ADD','CREATE','INSERT') THEN 1 ELSE 0 END) AS projects_added,
        SUM(CASE WHEN LOWER(table_name)='projects' AND UPPER(action_type) IN ('DELETE','REMOVE') THEN 1 ELSE 0 END) AS projects_deleted,
        SUM(CASE WHEN LOWER(table_name)='tasks' AND UPPER(action_type) IN ('ADD','CREATE','INSERT') THEN 1 ELSE 0 END) AS tasks_added,
        SUM(CASE WHEN LOWER(table_name)='tasks' AND UPPER(action_type) IN ('DELETE','REMOVE') THEN 1 ELSE 0 END) AS tasks_deleted,
        COUNT(*) AS total_actions
      FROM audit_logs
      WHERE action_time >= CURDATE()
        AND action_time < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`
    );
    return res.json({ ok: true, data: rows[0] || null });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.get("/active-employees", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM v_active_employees");
    return res.json({ ok: true, data: rows });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
