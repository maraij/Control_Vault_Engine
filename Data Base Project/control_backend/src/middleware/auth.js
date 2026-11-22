import { pool } from "../db.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, error: "MISSING_TOKEN" });
  }

  try {
    const [resultSets] = await pool.query("CALL sp_validate_session(?)", [
      token,
    ]);
    const session = resultSets?.[0]?.[0];

    if (!session) {
      return res.status(401).json({ ok: false, error: "INVALID_SESSION" });
    }

    req.token = token;
    req.adminSession = session;
    return next();
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
