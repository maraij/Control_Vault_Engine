# Control Vault Engine
Control Vault Engine is a MySQL-based system for handling employees, projects, tasks, clients, and admin dashboard with secure authentication.

## 🚀 Project Overview

This system provides a centralized dashboard for administrators to efficiently manage organizational data using a MySQL database.

## ⚙️ Features

- 🔐 Admin authentication system (SQL-based login)
- 👨‍💼 Employee management (add, update, delete, view)
- 📁 Project management system
- 📌 Task assignment and tracking
- 👥 Client management module
- 📊 Dashboard with real-time database data
- 🧹 Automated retention system for inactive records
- 🔗 RESTful API integration between frontend and backend

## 🧠 Database

- Database: MySQL
- Database Name: control_vault
- Uses stored procedures for authentication
- Relational structure between tables (employees, projects, tasks, clients)

## 🔄 System Architecture

Frontend 
        ↓
Backend 
        ↓
MySQL Database
        ↓
Response → Dashboard UI

## ⚡ Setup Instructions

### Backend
npm install
npm run dev
