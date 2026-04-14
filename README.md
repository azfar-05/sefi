## SEFI — Software Engineering Failure Intelligence Platform

### Tagline
Analytical platform for CI/CD failure intelligence using relational modeling, recursive SQL, and interactive visualization.

## Overview
SEFI is a full-stack analytical system that converts CI/CD pipeline data into actionable engineering intelligence. It is designed to identify failure trends, surface flaky tests, trace regression commits, and compute mean time to resolution through relational analysis rather than basic CRUD operations.

## Key Features
- Trend analysis of failures over time
- Identification of failure-prone files using joins
- Flaky test detection via computed failure rates
- Regression commit analysis from pass-to-fail transitions
- Commit chain exploration with recursive SQL
- MTTR computation using timestamp-based resolution metrics
- Global developer-level filtering across dashboard views
- Synthetic data generation for demo and random scenarios

## System Architecture
- Frontend
  - React + Vite + TypeScript
  - Tailwind CSS and shadcn/ui for styling
  - Recharts for data visualization
- Backend
  - Node.js + Express
  - REST API layer for analytical queries and data generation
- Database
  - PostgreSQL relational schema
  - Analytical queries implemented in SQL
  - Recursive and aggregate queries to power insights

## Database Design
SEFI models CI/CD intelligence with related entities such as:
- commits
- tests
- file artifacts
- build and pipeline results
- developer metadata

The schema supports:
- joins between commits, tests, and files
- failure history aggregation
- developer-centric filtering
- commit ancestry and regression path analysis

## Core DBMS Concepts Used
- Joins
  - Linking commit, test, and file records to derive failure-prone components
- Aggregation
  - Computing failure rates, totals, and MTTR
- Recursive queries
  - Traversing commit chains and regression histories using recursive CTEs
- Derived metrics
  - Flakiness, regression commit identification, and resolution latency

## Pages & Functionality
- Dashboard
  - Visualizes failure trends, MTTR, and developer-specific metrics
- Insights
  - Displays failure-prone files, flaky tests, and regression commit analysis
- Data Control
  - Allows switching between demo and random synthetic datasets
- Filters
  - Global developer filtering across analytical views

## Synthetic Data Generation
- Demo Mode
  - Provides a consistent dataset for demonstration and evaluation
- Random Mode
  - Generates new synthetic CI/CD data for exploratory testing and validation

## Tech Stack
- Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Recharts
- Backend: Node.js, Express
- Database: PostgreSQL
- Architecture: REST APIs, SQL-driven analytics

## Setup Instructions
1. Install dependencies
   - `npm install` in frontend and backend directories
2. Configure PostgreSQL
   - Create the database
   - Apply schema and seed data from `/database` scripts
3. Start backend
   - `npm run dev` from `/backend`
4. Start frontend
   - `npm run dev` from `/frontend`
5. Open the local frontend URL in a browser
6. Use synthetic data controls in the UI to load demo or random datasets

## Future Improvements
- Add real CI/CD provider ingestion
- Introduce role-based access and developer dashboards
- Expand recursive analysis to multi-branch commit graphs
- Add configurable alerting for rising failure patterns

## Conclusion
SEFI is a database-driven failure intelligence platform built for analytical evaluation of CI/CD pipelines, emphasizing relational modeling, SQL-driven insight, and meaningful software engineering metrics.