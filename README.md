# Angular Organization Hierarchy Management

## 📌 Project Overview
This Angular application provides a user interface to upload an organization hierarchy from an Excel file and validate it based on specific business rules. The validation includes error handling for incorrect reporting structures and cycle detection in the hierarchy.

## 🏗️ Features
- **Excel Upload**: Allows users to upload an Excel file containing the organization's hierarchy.
- **Validation**: Ensures the following rules:
  - Admins can have multiple managers.
  - Admins report only to the Root (super admin).
  - Managers can report to other managers or an admin.
  - Callers report only to managers.
  - Every user has only one parent.
- **Cycle Detection**: Prevents infinite reporting loops (e.g., A reports to B, B reports to C, and C reports back to A).
- **Error Reporting**: Displays errors for violations of the hierarchy rules.

## 📌 Live Demo
[Click here to see the live demo](https://orgchart-gules.vercel.app/)
