import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM clients ORDER BY client_id DESC"
    );
    return res.json({ ok: true, data: rows });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.post("/", async (req, res) => {
  const {
    client_name,
    contact_person,
    email,
    phone,
    company_address,
    city,
    country,
  } = req.body || {};

  if (!client_name) {
    return res.status(400).json({ ok: false, error: "MISSING_CLIENT_NAME" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO clients (client_name, contact_person, email, phone, company_address, city, country) VALUES (?,?,?,?,?,?,?)",
      [
        client_name,
        contact_person || null,
        email || null,
        phone || null,
        company_address || null,
        city || null,
        country || null,
      ]
    );
    return res.json({ ok: true, client_id: result.insertId });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.put("/:client_id", async (req, res) => {
  const { client_id } = req.params;
  const {
    client_name,
    contact_person,
    email,
    phone,
    company_address,
    city,
    country,
  } = req.body || {};

  const fields = [];
  const params = [];

  if (client_name) {
    fields.push("client_name = ?");
    params.push(client_name);
  }
  if (contact_person !== undefined) {
    fields.push("contact_person = ?");
    params.push(contact_person || null);
  }
  if (email !== undefined) {
    fields.push("email = ?");
    params.push(email || null);
  }
  if (phone !== undefined) {
    fields.push("phone = ?");
    params.push(phone || null);
  }
  if (company_address !== undefined) {
    fields.push("company_address = ?");
    params.push(company_address || null);
  }
  if (city !== undefined) {
    fields.push("city = ?");
    params.push(city || null);
  }
  if (country !== undefined) {
    fields.push("country = ?");
    params.push(country || null);
  }

  if (!fields.length) {
    return res.status(400).json({ ok: false, error: "NO_FIELDS_TO_UPDATE" });
  }

  params.push(client_id);

  try {
    await pool.query(
      `UPDATE clients SET ${fields.join(", ")} WHERE client_id = ?`,
      params
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.delete("/:client_id", async (req, res) => {
  const { client_id } = req.params;

  try {
    await pool.query("DELETE FROM clients WHERE client_id = ?", [client_id]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
