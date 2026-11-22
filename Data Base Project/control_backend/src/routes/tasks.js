import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const { status, project_id, client_id } = req.query;
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }
  if (project_id) {
    conditions.push("project_id = ?");
    params.push(project_id);
  }
  if (client_id) {
    conditions.push("client_id = ?");
    params.push(client_id);
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const [rows] = await pool.query(
      `SELECT tasks.*, task_title AS title FROM tasks ${whereSql} ORDER BY task_id DESC`,
      params
    );
    return res.json({ ok: true, data: rows });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { title, task_title, project_id, client_id } = req.body || {};
  const finalTitle = task_title || title;

  if (!finalTitle || !project_id || !client_id) {
    return res.status(400).json({ ok: false, error: "MISSING_FIELDS" });
  }

  try {
    await pool.query("CALL sp_create_task(?,?,?)", [
      finalTitle,
      project_id,
      client_id,
    ]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.post("/assign", async (req, res) => {
  const { emp_id, task_id } = req.body || {};

  if (!emp_id || !task_id) {
    return res.status(400).json({ ok: false, error: "MISSING_FIELDS" });
  }

  try {
    await pool.query("CALL sp_assign_task(?,?)", [emp_id, task_id]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.post("/done", async (req, res) => {
  const { emp_id, task_id } = req.body || {};

  if (!emp_id || !task_id) {
    return res.status(400).json({ ok: false, error: "MISSING_FIELDS" });
  }

  try {
    await pool.query("CALL sp_mark_task_done(?,?)", [emp_id, task_id]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
