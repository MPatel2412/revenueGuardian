# 🛡️ Revenue Guardian (InsuranceAgent Pro)

A comprehensive CRM and Commission Tracking system for Insurance Agents. This application allows agents to manage clients, track policies, view upcoming renewals, and reconcile commission statements.

## 🚀 Tech Stack

* **Frontend:** React (Vite), TypeScript, Tailwind CSS, Lucide React, React Router DOM.
* **Backend:** Python, Django Rest Framework (DRF).
* **Database:** PostgreSQL 
* **Authentication:** JWT (JSON Web Tokens).

---

## 🛠️ Prerequisites

* [Node.js](https://nodejs.org/) (v16+)
* [Python](https://www.python.org/) (v3.9+)
* [PostgreSQL](https://www.postgresql.org/) (Optional, can use SQLite for local dev)

---

## 📥 Installation Guide


## 1. Backend Setup (Django)
#### Navigate to the backend folder and set up the Python environment.

```bash
# 1. Navigate to backend
cd revenue_guardian_backend

# 2. Create Virtual Environment (Using conda is preferred)
python -m venv venv 


# 3. Activate Virtual Environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install Dependencies
pip install -r requirements.txt

# 5. Run Migrations (Initialize Database)
python manage.py migrate

# 6. Create a Superuser (Admin)
python manage.py createsuperuser

# 7. Start the Server
python manage.py runserver

```
The Backend API will run at: http://127.0.0.1:8000/


## 1. Frontend Setup (React)
#### Open a new terminal, navigate to the frontend folder, and install node modules.
```bash
# 1. Navigate to frontend
cd revenue_guardian_frontend

# 2. Install Dependencies
npm install

# 3. Start the Development Server
npm run dev
```
The Frontend App will run at: http://localhost:5173/

## 🔑 Default Login & Testing

## Register a User:

* Currently, registration is done via API or Admin panel.

* To start quickly, log in to the Django Admin (http://127.0.0.1:8000/admin) with the superuser you created in step 2.6.

* Create a "Client" and assign it to your user to see data in the dashboard.

* Access the Dashboard:

Go to http://localhost:5173/ and log in.
