import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import authRoutes from "./routes/auth.js";
import employeeRoutes from "./routes/employees.js";
import projectRoutes from "./routes/projects.js";
import taskRoutes from "./routes/tasks.js";
import reportRoutes from "./routes/reports.js";
import clientRoutes from "./routes/clients.js";
import { archiveInactiveEmployees } from "./retention.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// test route
app.get("/health", async (req, res) => {
  try {
    const [[timeRow]] = await pool.query("SELECT NOW() AS now");
    const [[dbRow]] = await pool.query("SELECT DATABASE() AS db_name");
    const [[countRow]] = await pool.query(
      "SELECT COUNT(*) AS employee_count FROM employees"
    );
    const [[serverRow]] = await pool.query(
      "SELECT @@hostname AS host, @@port AS port, @@socket AS socket, @@version AS version"
    );
    res.json({
      ok: true,
      db_time: timeRow?.now,
      db_name: dbRow?.db_name || null,
      employee_count: countRow?.employee_count ?? 0,
      db_host: serverRow?.host || null,
      db_port: serverRow?.port || null,
      db_socket: serverRow?.socket || null,
      db_version: serverRow?.version || null,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.use("/auth", authRoutes);
app.use("/employees", employeeRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/reports", reportRoutes);
app.use("/clients", clientRoutes);

const port = Number(process.env.PORT) || 4000;
const server = app.listen(port, () => {
  console.log("Backend running on:", port);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});

server.on("close", () => {
  console.warn("Server closed");
});

const retentionIntervalMs = 60 * 60 * 1000;
setInterval(() => {
  archiveInactiveEmployees({ days: 1 })
    .then((result) => {
      if (result.archived > 0 || result.backed_up > 0) {
        console.log("Retention job:", result);
      }
    })
    .catch((err) => {
      console.error("Retention job failed:", err.message);
    });
}, retentionIntervalMs);

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});
