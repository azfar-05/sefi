-- =========================================
-- 1. FAILURE-PRONE FILES
-- Files most associated with failed CI runs
-- =========================================

SELECT 
    f.path,
    COUNT(*) FILTER (WHERE c.status = 'failed') AS failure_count,
    COUNT(*) AS total_changes,
    ROUND(
        COUNT(*) FILTER (WHERE c.status = 'failed') * 100.0 / COUNT(*),
        2
    ) AS failure_rate_percentage
FROM file_changes fc
JOIN files f ON fc.file_id = f.id
JOIN ci_runs c ON fc.commit_id = c.commit_id
GROUP BY f.path
ORDER BY failure_rate_percentage DESC;


-- =========================================
-- 2. FLAKY TESTS
-- Tests that both pass and fail across runs
-- =========================================

SELECT 
    t.name,
    COUNT(*) FILTER (WHERE tr.status = 'passed') AS passed_count,
    COUNT(*) FILTER (WHERE tr.status = 'failed') AS failed_count,
    ROUND(
        COUNT(*) FILTER (WHERE tr.status = 'failed') * 100.0 / COUNT(*),
        2
    ) AS failure_rate_percentage
FROM test_results tr
JOIN tests t ON tr.test_id = t.id
GROUP BY t.name
HAVING COUNT(DISTINCT tr.status) > 1
ORDER BY failure_rate_percentage DESC;


-- =========================================
-- 3. REGRESSION-INDUCING COMMITS
-- Commits that caused failures after a pass
-- =========================================

SELECT 
    c.id AS commit_id,
    d.name AS developer,
    c.message,
    c.commit_time
FROM commits c
JOIN developers d ON c.developer_id = d.id
JOIN ci_runs curr ON c.id = curr.commit_id
JOIN commit_parents cp ON c.id = cp.commit_id
JOIN ci_runs prev ON cp.parent_commit_id = prev.commit_id
WHERE curr.status = 'failed'
  AND prev.status = 'passed'
ORDER BY c.commit_time;


-- =========================================
-- 4. MTTR (Mean Time To Repair)
-- Average resolution time in days
-- =========================================

SELECT 
    ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400), 2) 
    AS avg_mttr_days
FROM bug_reports
WHERE resolved_at IS NOT NULL;


-- Individual bug resolution times (UI friendly)

SELECT 
    id,
    title,
    ROUND(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400, 2) 
    AS resolution_time_days
FROM bug_reports
WHERE resolved_at IS NOT NULL;


-- =========================================
-- 5. COMMIT CHAIN (RECURSIVE QUERY)
-- Trace commit history backwards
-- =========================================

WITH RECURSIVE commit_chain AS (
    SELECT 
        c.id,
        c.message,
        c.commit_time
    FROM commits c
    WHERE c.id = 12  -- will be dynamic in UI

    UNION ALL

    SELECT 
        parent.id,
        parent.message,
        parent.commit_time
    FROM commits parent
    JOIN commit_parents cp ON parent.id = cp.parent_commit_id
    JOIN commit_chain cc ON cp.commit_id = cc.id
)

SELECT * FROM commit_chain
ORDER BY commit_time DESC;


-- =========================================
-- 6. FAILURE TRENDS OVER TIME
-- Daily failure rate
-- =========================================

SELECT 
    DATE(run_time) AS day,
    COUNT(*) AS total_runs,
    COUNT(*) FILTER (WHERE status = 'failed') AS failed_runs,
    ROUND(
        COUNT(*) FILTER (WHERE status = 'failed') * 100.0 / COUNT(*), 
        2
    ) AS failure_rate_percentage
FROM ci_runs
GROUP BY day
ORDER BY day;