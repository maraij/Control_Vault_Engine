import { Router } from "express";
import { pool } from "../db.js";
import { archiveInactiveEmployees } from "../retention.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM employees ORDER BY emp_id"
    );
    return res.json({ ok: true, data: rows });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { emp_id, full_name, department, join_date } = req.body || {};

  if (!full_name || !department || !join_date) {
    return res.status(400).json({ ok: false, error: "MISSING_FIELDS" });
  }

  try {
    let finalEmpId = emp_id;

    if (finalEmpId !== undefined && finalEmpId !== null) {
      const [existing] = await pool.query(
        "SELECT 1 FROM employees WHERE emp_id = ? LIMIT 1",
        [finalEmpId]
      );
      if (existing.length) {
        finalEmpId = null;
      }
    }

    if (finalEmpId === undefined || finalEmpId === null) {
      const [rows] = await pool.query(
        "SELECT COALESCE(MAX(emp_id), 0) + 1 AS next_id FROM employees"
      );
      finalEmpId = rows[0]?.next_id || 1;
    }

    await pool.query("CALL sp_add_employee(?,?,?,?)", [
      finalEmpId,
      full_name,
      department,
      join_date,
    ]);
    return res.json({ ok: true, emp_id: finalEmpId });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.put("/:emp_id", async (req, res) => {
  const { emp_id } = req.params;
  const { full_name, department } = req.body || {};

  if (!full_name || !department) {
    return res.status(400).json({ ok: false, error: "MISSING_FIELDS" });
  }

  try {
    await pool.query("CALL sp_edit_employee(?,?,?)", [
      emp_id,
      full_name,
      department,
    ]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.delete("/:emp_id", async (req, res) => {
  const { emp_id } = req.params;

  try {
    await pool.query("CALL sp_delete_employee(?)", [emp_id]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.post("/:emp_id/backup", async (req, res) => {
  const { emp_id } = req.params;
  const { reason } = req.body || {};

  if (!reason) {
    return res.status(400).json({ ok: false, error: "MISSING_REASON" });
  }

  try {
    await pool.query("CALL sp_backup_employee_now(?,?)", [emp_id, reason]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.post("/restore", async (req, res) => {
  const { backup_id } = req.body || {};

  if (!backup_id) {
    return res.status(400).json({ ok: false, error: "MISSING_BACKUP_ID" });
  }

  try {
    await pool.query("CALL sp_restore_from_backup(?)", [backup_id]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.post("/archive", async (req, res) => {
  const { days } = req.body || {};
  const daysNum =
    days === undefined || days === null ? 1 : Number.parseInt(days, 10);

  if (!Number.isFinite(daysNum) || daysNum <= 0) {
    return res.status(400).json({ ok: false, error: "INVALID_DAYS" });
  }

  try {
    const result = await archiveInactiveEmployees({ days: daysNum });
    return res.json({ ok: true, ...result });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
