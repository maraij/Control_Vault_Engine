-- ==========================================================
-- CONTROL_VAULT FULL SYSTEM (NO TOKEN BASED AUTH)
-- MySQL
-- ==========================================================

DROP DATABASE IF EXISTS control_vault;
CREATE DATABASE control_vault;
USE control_vault;

-- ==========================================================
-- 1) ADMIN (NO SESSIONS/TOKENS)
-- ==========================================================
CREATE TABLE admin (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,   -- demo: SHA2; real app: bcrypt in backend
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed admin (username=admin, password=123)adclientsmin
INSERT INTO admin(username, password_hash) VALUES ('admin', SHA2('123',256));

-- ==========================================================
-- 2) CORE TABLES (CLIENTS, PROJECTS, EMPLOYEES)
-- ==========================================================
CREATE TABLE clients (
  client_id INT AUTO_INCREMENT PRIMARY KEY,
  client_name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  company_address VARCHAR(255),
  city VARCHAR(50),
  country VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
  project_id INT AUTO_INCREMENT PRIMARY KEY,
  project_name VARCHAR(100) NOT NULL,
  client_id INT NOT NULL,
  start_date DATE,
  end_date DATE,
  status ENUM('ONGOING','COMPLETED','HOLD') DEFAULT 'ONGOING',
  budget DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(client_id)
);

CREATE TABLE employees (
  emp_id INT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  department VARCHAR(80) NOT NULL,
  join_date DATE,
  absent_days INT DEFAULT 0,
  last_active_date DATE,
  status ENUM('ACTIVE','ARCHIVED','DELETED') DEFAULT 'ACTIVE'
);

-- Employee can work on MULTIPLE projects
CREATE TABLE employee_projects (
  emp_project_id INT AUTO_INCREMENT PRIMARY KEY,
  emp_id INT NOT NULL,
  project_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  assignment_status ENUM('ASSIGNED','COMPLETED','REMOVED') DEFAULT 'ASSIGNED',
  UNIQUE(emp_id, project_id),
  FOREIGN KEY (emp_id) REFERENCES employees(emp_id),
  FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

-- Daily Attendance tracking
CREATE TABLE employee_attendance (
  attendance_id INT AUTO_INCREMENT PRIMARY KEY,
  emp_id INT NOT NULL,
  attend_date DATE NOT NULL,
  status ENUM('PRESENT','ABSENT','LEAVE') NOT NULL,
  check_in TIME NULL,
  check_out TIME NULL,
  remarks VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (emp_id, attend_date),
  FOREIGN KEY (emp_id) REFERENCES employees(emp_id)
);

-- Performance reviews (manual ratings)
CREATE TABLE employee_performance (
  performance_id INT AUTO_INCREMENT PRIMARY KEY,
  emp_id INT NOT NULL,
  review_period VARCHAR(20),
  rating INT,
  remarks VARCHAR(255),
  reviewed_by VARCHAR(100),
  review_date DATE DEFAULT (CURDATE()),
  FOREIGN KEY (emp_id) REFERENCES employees(emp_id)
);

-- Backup storage for archived employees (retention backups)
CREATE TABLE employee_backup (
  backup_id INT AUTO_INCREMENT PRIMARY KEY,
  emp_id INT,
  full_name VARCHAR(100),
  department VARCHAR(80),
  join_date DATE,
  absent_days INT,
  last_active_date DATE,
  employee_status ENUM('ACTIVE','ARCHIVED','DELETED'),
  backup_reason VARCHAR(100),
  backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- History of deleted employee records
CREATE TABLE deleted_employees (
  del_id INT AUTO_INCREMENT PRIMARY KEY,
  emp_id INT,
  full_name VARCHAR(100),
  department VARCHAR(80),
  join_date DATE,
  absent_days INT,
  last_active_date DATE,
  deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log (who did what, when)
CREATE TABLE audit_logs (
  audit_id INT AUTO_INCREMENT PRIMARY KEY,
  action_type VARCHAR(30),
  table_name VARCHAR(50),
  record_id INT NULL,
  description VARCHAR(255),
  action_by VARCHAR(100),
  action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_date ON audit_logs(action_time);
CREATE INDEX idx_emp_status ON employees(status);

-- ==========================================================
-- 3) TASKS SYSTEM
-- ==========================================================
CREATE TABLE tasks (
  task_id INT AUTO_INCREMENT PRIMARY KEY,
  task_title VARCHAR(150) NOT NULL,
  project_id INT NOT NULL,
  client_id INT NOT NULL,
  status ENUM('OPEN','IN_PROGRESS','DONE','CANCELLED') DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATE NULL,
  FOREIGN KEY (project_id) REFERENCES projects(project_id),
  FOREIGN KEY (client_id) REFERENCES clients(client_id)
);

CREATE TABLE employee_tasks (
  emp_task_id INT AUTO_INCREMENT PRIMARY KEY,
  emp_id INT NOT NULL,
  task_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  status ENUM('ASSIGNED','DONE') DEFAULT 'ASSIGNED',
  UNIQUE(emp_id, task_id),
  FOREIGN KEY (emp_id) REFERENCES employees(emp_id),
  FOREIGN KEY (task_id) REFERENCES tasks(task_id)
);

-- ==========================================================
-- 4) STORED PROCEDURES (NO TOKEN PARAMS)
-- ==========================================================
DELIMITER //

-- Simple admin check (no session). Your backend can call this and decide.
CREATE PROCEDURE sp_admin_login(
  IN p_username VARCHAR(50),
  IN p_password VARCHAR(100)
)
BEGIN
  DECLARE v_admin_id INT;

  SELECT admin_id INTO v_admin_id
  FROM admin
  WHERE username = p_username
    AND password_hash = SHA2(p_password,256)
    AND is_active = 1
  LIMIT 1;

  IF v_admin_id IS NULL THEN
    SELECT 0 AS ok, 'INVALID_CREDENTIALS' AS message;
  ELSE
    INSERT INTO audit_logs(action_type, table_name, record_id, description, action_by)
    VALUES('LOGIN','admin',v_admin_id,'Admin login','ADMIN');

    SELECT 1 AS ok, 'OK' AS message, v_admin_id AS admin_id;
  END IF;
END//

-- Employee CRUD
CREATE PROCEDURE sp_add_employee(
  IN p_emp_id INT,
  IN p_full_name VARCHAR(100),
  IN p_department VARCHAR(80),
  IN p_join_date DATE
)
BEGIN
  INSERT INTO employees(emp_id, full_name, department, join_date, absent_days, last_active_date, status)
  VALUES(p_emp_id, p_full_name, p_department, p_join_date, 0, CURDATE(), 'ACTIVE');

  INSERT INTO audit_logs(action_type, table_name, record_id, description, action_by)
  VALUES('INSERT','employees',p_emp_id,CONCAT('Added employee: ',p_full_name),'ADMIN');
END//

CREATE PROCEDURE sp_edit_employee(
  IN p_emp_id INT,
  IN p_full_name VARCHAR(100),
  IN p_department VARCHAR(80)
)
BEGIN
  UPDATE employees
  SET full_name = p_full_name,
      department = p_department
  WHERE emp_id = p_emp_id AND status <> 'DELETED';

  INSERT INTO audit_logs(action_type, table_name, record_id, description, action_by)
  VALUES('UPDATE','employees',p_emp_id,'Edited employee','ADMIN');
END//

CREATE PROCEDURE sp_view_active_employees()
BEGIN
  SELECT * FROM employees WHERE status='ACTIVE' ORDER BY emp_id;
END//

CREATE PROCEDURE sp_delete_employee(
  IN p_emp_id INT
)
BEGIN
  INSERT INTO deleted_employees(emp_id, full_name, department, join_date, absent_days, last_active_date)
  SELECT emp_id, full_name, department, join_date, absent_days, last_active_date
  FROM employees
  WHERE emp_id = p_emp_id;

  UPDATE employees
  SET status='DELETED'
  WHERE emp_id = p_emp_id;

  INSERT INTO audit_logs(action_type, table_name, record_id, description, action_by)
  VALUES('DELETE','employees',p_emp_id,'Logical delete employee','ADMIN');
END//

CREATE PROCEDURE sp_backup_employee_now(
  IN p_emp_id INT,
  IN p_reason VARCHAR(100)
)
BEGIN
  INSERT INTO employee_backup(emp_id, full_name, department, join_date, absent_days, last_active_date, employee_status, backup_reason)
  SELECT emp_id, full_name, department, join_date, absent_days, last_active_date, status, p_reason
  FROM employees
  WHERE emp_id = p_emp_id;

  INSERT INTO audit_logs(action_type, table_name, record_id, description, action_by)
  VALUES('BACKUP','employee_backup',p_emp_id,CONCAT('Manual backup: ',p_reason),'ADMIN');
END//

CREATE PROCEDURE sp_restore_from_backup(
  IN p_backup_id INT
)
BEGIN
  UPDATE employees e
  JOIN employee_backup b ON b.emp_id = e.emp_id
  SET e.status = 'ACTIVE',
      e.last_active_date = CURDATE()
  WHERE b.backup_id = p_backup_id;

  DELETE FROM employee_backup WHERE backup_id = p_backup_id;

  INSERT INTO audit_logs(action_type, table_name, record_id, description, action_by)
  VALUES('RESTORE','employee_backup',p_backup_id,'Restored employee from backup','ADMIN');
END//

-- Projects assignment
CREATE PROCEDURE sp_assign_project(
  IN p_emp_id INT,
  IN p_project_id INT
)
BEGIN
  INSERT INTO employee_projects(emp_id, project_id, assignment_status)
  VALUES(p_emp_id, p_project_id, 'ASSIGNED')
  ON DUPLICATE KEY UPDATE assignment_status='ASSIGNED', completed_at=NULL;

  INSERT INTO audit_logs(action_type, table_name, record_id, description, action_by)
  VALUES('ASSIGN','employee_projects',p_emp_id,CONCAT('Assigned project_id=',p_project_id),'ADMIN');
END//

CREATE PROCEDURE sp_complete_project(
  IN p_emp_id INT,
  IN p_project_id INT
)
BEGIN
  UPDATE employee_projects
  SET assignment_status='COMPLETED', completed_at=NOW()
  WHERE emp_id=p_emp_id AND project_id=p_project_id;

  INSERT INTO audit_logs(action_type, table_name, record_id, description, action_by)
  VALUES('COMPLETE','employee_projects',p_emp_id,CONCAT('Completed project_id=',p_project_id),'ADMIN');
END//

-- Tasks
CREATE PROCEDURE sp_create_task(
  IN p_title VARCHAR(150),
  IN p_project_id INT,
  IN p_client_id INT
)
BEGIN
  INSERT INTO tasks(task_title, project_id, client_id, status)
  VALUES(p_title, p_project_id, p_client_id, 'OPEN');

  INSERT INTO audit_logs(action_type, table_name, record_id, description, action_by)
  VALUES('INSERT','tasks',LAST_INSERT_ID(),'Created task','ADMIN');
END//

CREATE PROCEDURE sp_assign_task(
  IN p_emp_id INT,
  IN p_task_id INT
)
BEGIN
  INSERT INTO employee_tasks(emp_id, task_id, status)
  VALUES(p_emp_id, p_task_id, 'ASSIGNED')
  ON DUPLICATE KEY UPDATE status='ASSIGNED', completed_at=NULL;

  UPDATE tasks SET status='IN_PROGRESS' WHERE task_id=p_task_id;

  INSERT INTO audit_logs(action_type, table_name, record_id, description, action_by)
  VALUES('ASSIGN','employee_tasks',p_task_id,CONCAT('Task assigned to emp_id=',p_emp_id),'ADMIN');
END//

CREATE PROCEDURE sp_mark_task_done(
  IN p_emp_id INT,
  IN p_task_id INT
)
BEGIN
  UPDATE employee_tasks
  SET status='DONE', completed_at=NOW()
  WHERE emp_id=p_emp_id AND task_id=p_task_id;

  UPDATE tasks SET status='DONE' WHERE task_id=p_task_id;

  UPDATE employees SET last_active_date = CURDATE() WHERE emp_id = p_emp_id;

  INSERT INTO audit_logs(action_type, table_name, record_id, description, action_by)
  VALUES('DONE','employee_tasks',p_task_id,CONCAT('Task done by emp_id=',p_emp_id),'ADMIN');
END//

DELIMITER ;

-- ==========================================================
-- 5) DATA RETENTION EVENT (2 days inactive -> ARCHIVE + BACKUP)
-- ==========================================================
-- SET GLOBAL event_scheduler = ON;

DELIMITER //

CREATE EVENT IF NOT EXISTS ev_archive_inactive_employees
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
  INSERT INTO employee_backup(emp_id, full_name, department, join_date, absent_days, last_active_date, employee_status, backup_reason)
  SELECT emp_id, full_name, department, join_date, absent_days, last_active_date, status, 'AUTO_RETENTION_2_DAYS'
  FROM employees
  WHERE status='ACTIVE'
    AND last_active_date IS NOT NULL
    AND last_active_date < (CURDATE() - INTERVAL 2 DAY);

  UPDATE employees
  SET status='ARCHIVED'
  WHERE status='ACTIVE'
    AND last_active_date IS NOT NULL
    AND last_active_date < (CURDATE() - INTERVAL 2 DAY);

  INSERT INTO audit_logs(action_type, table_name, record_id, description, action_by)
  VALUES('ARCHIVE','employees',NULL,'Auto-archived employees inactive 2+ days','SYSTEM_EVENT');
END//

DELIMITER ;

-- ==========================================================
-- 6) VIEWS (REPORTS)
-- ==========================================================
CREATE OR REPLACE VIEW v_active_employees AS
SELECT * FROM employees WHERE status='ACTIVE';

CREATE OR REPLACE VIEW v_employee_performance_summary AS
SELECT
  e.emp_id,
  e.full_name,
  e.department,
  e.status,
  (SELECT COUNT(*)
   FROM employee_tasks et
   WHERE et.emp_id = e.emp_id
     AND et.status='DONE'
     AND DATE(et.completed_at)=CURDATE()
  ) AS tasks_done_today,
  (SELECT COUNT(*)
   FROM employee_tasks et
   WHERE et.emp_id = e.emp_id
     AND et.status='DONE'
  ) AS total_tasks_done,
  (SELECT COUNT(*)
   FROM employee_projects ep
   WHERE ep.emp_id=e.emp_id
     AND ep.assignment_status='ASSIGNED'
  ) AS active_projects,
  (SELECT COUNT(*)
   FROM employee_projects ep
   WHERE ep.emp_id=e.emp_id
     AND ep.assignment_status='COMPLETED'
  ) AS completed_projects,
  (SELECT COUNT(DISTINCT t.client_id)
   FROM employee_tasks et
   JOIN tasks t ON t.task_id=et.task_id
   WHERE et.emp_id=e.emp_id
  ) AS clients_handled
FROM employees e;

CREATE OR REPLACE VIEW v_audit_today AS
SELECT
  SUM(action_type='INSERT' AND table_name='employees' AND DATE(action_time)=CURDATE()) AS employees_added_today,
  SUM(action_type='DELETE' AND table_name='employees' AND DATE(action_time)=CURDATE()) AS employees_deleted_today,
  SUM(action_type='ARCHIVE' AND table_name='employees' AND DATE(action_time)=CURDATE()) AS employees_archived_today
FROM audit_logs;

-- ==========================================================
-- 7) SEED DATA (optional)
-- ==========================================================
INSERT INTO clients (client_name, contact_person, email, phone, company_address, city, country)
VALUES
('Client X','John Doe','john@clientx.com','03001234567','Street 1, CityX','Karachi','Pakistan'),
('Client Y','Jane Smith','jane@clienty.com','03007654321','Street 2, CityY','Lahore','Pakistan'),
('Client Z','Ali Khan','ali@clientz.com','03005551234','Street 3, CityZ','Islamabad','Pakistan');
INSERT INTO clients (client_name, contact_person, email, phone, company_address, city, country)
VALUES('Waleed','Ali Khan','waleed@123','0312578835','Street 2 ','Sahiwal','Pakistan');

INSERT INTO projects (project_name, client_id, start_date, end_date, status, budget)
VALUES
('Project Alpha', 1, '2024-01-01', '2024-03-31', 'COMPLETED', 500000.00),
('Project Beta', 2, '2024-02-01', '2024-06-30', 'ONGOING', 350000.75),
('Project Gamma', 3, '2024-03-01', '2024-09-30', 'HOLD', 800000.50);

INSERT INTO employees (emp_id, full_name, department, join_date, absent_days, last_active_date, status)
VALUES
(1,'Ali Khan','IT','2024-01-01',0,CURDATE(),'ACTIVE'),
(2,'Sara Ahmed','HR','2024-01-03',0,CURDATE(),'ACTIVE');

