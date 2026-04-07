const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

/* =========================================
   BASIC ROUTES
========================================= */

// Health check
app.get('/', (req, res) => {
  res.send('SEFI Backend Running');
});

// DB test
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});

/* =========================================
   1. FAILURE-PRONE FILES
========================================= */

app.get('/api/files/failure-prone', async (req, res) => {
  try {
    const result = await pool.query(`
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
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch failure-prone files' });
  }
});

/* =========================================
   2. FLAKY TESTS
========================================= */

app.get('/api/tests/flaky', async (req, res) => {
  try {
    const result = await pool.query(`
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
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch flaky tests' });
  }
});

/* =========================================
   3. REGRESSION COMMITS
========================================= */

app.get('/api/commits/regressions', async (req, res) => {
  try {
    const result = await pool.query(`
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
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch regression commits' });
  }
});

/* =========================================
   4. MTTR
========================================= */

// Average MTTR
app.get('/api/bugs/mttr', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400), 2) 
        AS avg_mttr_days
      FROM bug_reports
      WHERE resolved_at IS NOT NULL;
    `);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch MTTR' });
  }
});

// Individual bug resolution
app.get('/api/bugs/resolution-times', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
          id,
          title,
          ROUND(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400, 2) 
          AS resolution_time_days
      FROM bug_reports
      WHERE resolved_at IS NOT NULL;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bug resolution times' });
  }
});

/* =========================================
   5. COMMIT CHAIN (DYNAMIC)
========================================= */

app.get('/api/commits/chain/:id', async (req, res) => {
  const commitId = req.params.id;

  try {
    const result = await pool.query(`
      WITH RECURSIVE commit_chain AS (
          SELECT id, message, commit_time
          FROM commits
          WHERE id = $1

          UNION ALL

          SELECT parent.id, parent.message, parent.commit_time
          FROM commits parent
          JOIN commit_parents cp ON parent.id = cp.parent_commit_id
          JOIN commit_chain cc ON cp.commit_id = cc.id
      )
      SELECT * FROM commit_chain
      ORDER BY commit_time DESC;
    `, [commitId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch commit chain' });
  }
});

/* =========================================
   6. FAILURE TRENDS
========================================= */

app.get('/api/ci/failure-trends', async (req, res) => {
  try {
    const result = await pool.query(`
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
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch failure trends' });
  }
});

/* =========================================
   SERVER
========================================= */

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});