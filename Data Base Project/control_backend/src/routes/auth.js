import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ ok: false, error: "MISSING_CREDENTIALS" });
  }

  try {
    const [resultSets] = await pool.query("CALL sp_admin_login(?,?)", [
      username,
      password,
    ]);
    const row = resultSets?.[0]?.[0];

    if (!row || row.ok !== 1) {
      return res.status(401).json({
        ok: false,
        message: row?.message || "INVALID_CREDENTIALS",
      });
    }

    return res.json({ ok: true, message: row.message, admin_id: row.admin_id });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.post("/logout", async (req, res) => {
  return res.json({ ok: true });
});

router.get("/me", (req, res) => {
  return res.json({ ok: true, session: null });
});

export default router;
