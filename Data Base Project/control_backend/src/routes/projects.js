import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const { status, client_id } = req.query;
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }
  if (client_id) {
    conditions.push("client_id = ?");
    params.push(client_id);
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const [rows] = await pool.query(
      `SELECT * FROM projects ${whereSql} ORDER BY project_id DESC`,
      params
    );
    return res.json({ ok: true, data: rows });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.post("/", async (req, res) => {
  const {
    project_name,
    client_id,
    start_date,
    end_date,
    status,
    budget,
  } = req.body || {};

  if (!project_name || !client_id) {
    return res.status(400).json({ ok: false, error: "MISSING_FIELDS" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO projects (project_name, client_id, start_date, end_date, status, budget) VALUES (?,?,?,?,?,?)",
      [project_name, client_id, start_date || null, end_date || null, status || "ONGOING", budget || null]
    );
    return res.json({ ok: true, project_id: result.insertId });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.put("/:project_id", async (req, res) => {
  const { project_id } = req.params;
  const { project_name, client_id, start_date, end_date, status, budget } =
    req.body || {};

  const fields = [];
  const params = [];

  if (project_name) {
    fields.push("project_name = ?");
    params.push(project_name);
  }
  if (client_id) {
    fields.push("client_id = ?");
    params.push(client_id);
  }
  if (start_date !== undefined) {
    fields.push("start_date = ?");
    params.push(start_date || null);
  }
  if (end_date !== undefined) {
    fields.push("end_date = ?");
    params.push(end_date || null);
  }
  if (status) {
    fields.push("status = ?");
    params.push(status);
  }
  if (budget !== undefined) {
    fields.push("budget = ?");
    params.push(budget || null);
  }

  if (!fields.length) {
    return res.status(400).json({ ok: false, error: "NO_FIELDS_TO_UPDATE" });
  }

  params.push(project_id);

  try {
    await pool.query(
      `UPDATE projects SET ${fields.join(", ")} WHERE project_id = ?`,
      params
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.delete("/:project_id", async (req, res) => {
  const { project_id } = req.params;

  try {
    await pool.query("DELETE FROM projects WHERE project_id = ?", [project_id]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.post("/assign", async (req, res) => {
  const { emp_id, project_id } = req.body || {};

  if (!emp_id || !project_id) {
    return res.status(400).json({ ok: false, error: "MISSING_FIELDS" });
  }

  try {
    await pool.query("CALL sp_assign_project(?,?)", [emp_id, project_id]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.post("/complete", async (req, res) => {
  const { emp_id, project_id } = req.body || {};

  if (!emp_id || !project_id) {
    return res.status(400).json({ ok: false, error: "MISSING_FIELDS" });
  }

  try {
    await pool.query("CALL sp_complete_project(?,?)", [emp_id, project_id]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
