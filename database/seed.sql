-- =========================
-- DEVELOPERS
-- =========================
INSERT INTO developers (id, name, email) VALUES
(1, 'Alice', 'alice@example.com'),
(2, 'Bob', 'bob@example.com'),
(3, 'Charlie', 'charlie@example.com');

-- =========================
-- REPOSITORY
-- =========================
INSERT INTO repositories (id, name) VALUES
(1, 'sefi-platform');

-- =========================
-- FILES
-- =========================
INSERT INTO files (id, path) VALUES
(1, 'auth.js'),
(2, 'payment.js'),
(3, 'cart.js'),
(4, 'ui.js'),
(5, 'db.js');

-- =========================
-- COMMITS
-- =========================
INSERT INTO commits (id, repo_id, developer_id, message, commit_time) VALUES
(1, 1, 1, 'Initial commit', '2024-01-01'),
(2, 1, 1, 'Add auth module', '2024-01-02'),
(3, 1, 2, 'Modify payment logic (bug introduced)', '2024-01-03'),
(4, 1, 2, 'Refactor payment', '2024-01-04'),
(5, 1, 2, 'More payment changes', '2024-01-05'),
(6, 1, 3, 'Fix payment bug', '2024-01-06'),
(7, 1, 1, 'UI updates', '2024-01-07'),
(8, 1, 2, 'New cart logic (bug)', '2024-01-08'),
(9, 1, 2, 'Cart fixes attempt', '2024-01-09'),
(10, 1, 3, 'Fix cart bug', '2024-01-10'),
(11, 1, 1, 'Minor improvements', '2024-01-11'),
(12, 1, 2, 'Quick patch (bug)', '2024-01-12');

-- =========================
-- COMMIT PARENTS (LINEAR)
-- =========================
INSERT INTO commit_parents (commit_id, parent_commit_id) VALUES
(2,1),(3,2),(4,3),(5,4),(6,5),
(7,6),(8,7),(9,8),(10,9),(11,10),(12,11);

-- =========================
-- FILE CHANGES
-- =========================
INSERT INTO file_changes VALUES
-- stable commits
(1,1,'added'),
(2,1,'modified'),

-- buggy commits (payment.js heavy)
(3,2,'modified'),
(4,2,'modified'),
(5,2,'modified'),

-- fix
(6,2,'modified'),

-- stable
(7,4,'modified'),

-- bug again
(8,3,'modified'),
(9,3,'modified'),

-- fix
(10,3,'modified'),

-- stable
(11,5,'modified'),

-- bug
(12,2,'modified');

-- =========================
-- CI RUNS
-- =========================
INSERT INTO ci_runs (id, commit_id, status, run_time) VALUES
(1,1,'passed','2024-01-01'),
(2,2,'passed','2024-01-02'),
(3,3,'failed','2024-01-03'),
(4,4,'failed','2024-01-04'),
(5,5,'failed','2024-01-05'),
(6,6,'passed','2024-01-06'),
(7,7,'passed','2024-01-07'),
(8,8,'failed','2024-01-08'),
(9,9,'failed','2024-01-09'),
(10,10,'passed','2024-01-10'),
(11,11,'passed','2024-01-11'),
(12,12,'failed','2024-01-12');

-- =========================
-- TESTS
-- =========================
INSERT INTO tests (id, name) VALUES
(1,'test_login'),
(2,'test_payment'),
(3,'test_cart'),
(4,'test_ui');

-- =========================
-- TEST RESULTS
-- =========================
INSERT INTO test_results VALUES
-- mostly stable
(1,1,'passed'),(1,2,'passed'),(1,3,'passed'),(1,4,'passed'),
(2,1,'passed'),(2,2,'passed'),(2,3,'passed'),(2,4,'passed'),

-- failures start
(3,1,'passed'),(3,2,'failed'),(3,3,'passed'),(3,4,'passed'),
(4,1,'passed'),(4,2,'failed'),(4,3,'passed'),(4,4,'passed'),
(5,1,'passed'),(5,2,'failed'),(5,3,'passed'),(5,4,'passed'),

-- fix
(6,1,'passed'),(6,2,'passed'),(6,3,'passed'),(6,4,'passed'),

-- flaky behavior
(8,1,'passed'),(8,2,'failed'),(8,3,'passed'),(8,4,'passed'),
(9,1,'passed'),(9,2,'passed'),(9,3,'failed'),(9,4,'passed'),

-- fix again
(10,1,'passed'),(10,2,'passed'),(10,3,'passed'),(10,4,'passed'),

-- last bug
(12,1,'passed'),(12,2,'failed'),(12,3,'passed'),(12,4,'passed');

-- =========================
-- BUG REPORTS
-- =========================
INSERT INTO bug_reports VALUES
(1,'Payment failure','2024-01-03','2024-01-06'),
(2,'Cart issue','2024-01-08','2024-01-10'),
(3,'Minor patch bug','2024-01-12',NULL);

-- =========================
-- BUG ↔ COMMIT MAP
-- =========================
INSERT INTO bug_commit_map VALUES
(1,3),(1,6),
(2,8),(2,10),
(3,12);