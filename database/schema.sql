-- =========================
-- DEVELOPERS
-- =========================
CREATE TABLE developers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
);

-- =========================
-- REPOSITORIES
-- =========================
CREATE TABLE repositories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- COMMITS
-- =========================
CREATE TABLE commits (
    id SERIAL PRIMARY KEY,
    repo_id INT REFERENCES repositories(id),
    developer_id INT REFERENCES developers(id),
    message TEXT,
    commit_time TIMESTAMP NOT NULL
);

-- =========================
-- COMMIT PARENTS (DAG)
-- =========================
CREATE TABLE commit_parents (
    commit_id INT REFERENCES commits(id),
    parent_commit_id INT REFERENCES commits(id),
    PRIMARY KEY (commit_id, parent_commit_id)
);

-- =========================
-- FILES
-- =========================
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    path TEXT NOT NULL
);

-- =========================
-- FILE CHANGES
-- =========================
CREATE TABLE file_changes (
    commit_id INT REFERENCES commits(id),
    file_id INT REFERENCES files(id),
    change_type TEXT CHECK (change_type IN ('added', 'modified', 'deleted')),
    PRIMARY KEY (commit_id, file_id)
);

-- =========================
-- CI RUNS
-- =========================
CREATE TABLE ci_runs (
    id SERIAL PRIMARY KEY,
    commit_id INT REFERENCES commits(id),
    status TEXT CHECK (status IN ('passed', 'failed')),
    run_time TIMESTAMP NOT NULL
);

-- =========================
-- TESTS
-- =========================
CREATE TABLE tests (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- =========================
-- TEST RESULTS
-- =========================
CREATE TABLE test_results (
    ci_run_id INT REFERENCES ci_runs(id),
    test_id INT REFERENCES tests(id),
    status TEXT CHECK (status IN ('passed', 'failed')),
    PRIMARY KEY (ci_run_id, test_id)
);

-- =========================
-- BUG REPORTS
-- =========================
CREATE TABLE bug_reports (
    id SERIAL PRIMARY KEY,
    title TEXT,
    created_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP
);

-- =========================
-- BUG ↔ COMMIT MAP
-- =========================
CREATE TABLE bug_commit_map (
    bug_id INT REFERENCES bug_reports(id),
    commit_id INT REFERENCES commits(id),
    PRIMARY KEY (bug_id, commit_id)
);