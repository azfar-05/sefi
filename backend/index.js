const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================================
   BASIC ROUTES
========================================= */

// Health check
app.get("/", (req, res) => {
  res.send("SEFI Backend Running");
});

// DB test
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

/* =========================================
   1. FAILURE-PRONE FILES
========================================= */

app.get("/api/files/failure-prone", async (req, res) => {
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
    res.status(500).json({ error: "Failed to fetch failure-prone files" });
  }
});

/* =========================================
   2. FLAKY TESTS
========================================= */

app.get("/api/tests/flaky", async (req, res) => {
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
    res.status(500).json({ error: "Failed to fetch flaky tests" });
  }
});

/* =========================================
   3. REGRESSION COMMITS
========================================= */

app.get("/api/commits/regressions", async (req, res) => {
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
    res.status(500).json({ error: "Failed to fetch regression commits" });
  }
});

/* =========================================
   4. MTTR
========================================= */

// Average MTTR
app.get("/api/bugs/mttr", async (req, res) => {
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
    res.status(500).json({ error: "Failed to fetch MTTR" });
  }
});

// Individual bug resolution
app.get("/api/bugs/resolution-times", async (req, res) => {
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
    res.status(500).json({ error: "Failed to fetch bug resolution times" });
  }
});

/* =========================================
   5. COMMIT CHAIN (DYNAMIC)
========================================= */

app.get("/api/commits/chain/:id", async (req, res) => {
  const commitId = parseInt(req.params.id, 10);

  try {
    const result = await pool.query(
      `
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
    `,
      [commitId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch commit chain" });
  }
});

/* =========================================
   6. FAILURE TRENDS
========================================= */

app.get("/api/ci/failure-trends", async (req, res) => {
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
    res.status(500).json({ error: "Failed to fetch failure trends" });
  }
});

app.post("/api/generate-data", async (req, res) => {
  console.log("GENERATE START");

  try {
    const now = new Date();
    const mode = req.query.mode || "random";

    // ========================
    // CLEAR
    // ========================
    await pool.query(`
      TRUNCATE 
        file_changes,
        files,
        ci_runs,
        commit_parents,
        commits,
        test_results,
        tests,
        bug_reports
      RESTART IDENTITY CASCADE
    `);

    // ========================
    // COMMIT MESSAGES
    // ========================
    const randomMessages = [
      "Refactor login flow",
      "Fix cart calculation bug",
      "Improve payment handling",
      "Optimize search performance",
      "Add caching layer",
      "Fix race condition",
      "Update API logic",
      "Improve validation",
      "Refactor component structure",
      "Enhance error handling",
    ];

    const demoMessages = [
      "Initial setup",
      "Add login module",
      "Fix login validation",
      "Add cart functionality",
      "Refactor cart logic",
      "⚠️ Payment integration (bug introduced)",
      "Fix payment issue",
      "Improve error handling",
      "Refactor API layer",
      "⚠️ Checkout update (bug introduced)",
      "Fix checkout bug",
      "Optimize performance",
      "Refactor components",
      "Minor fixes",
      "Stability improvements",
    ];

    const getMessage = (i) => {
      if (mode === "demo") return demoMessages[i - 1];
      return randomMessages[Math.floor(Math.random() * randomMessages.length)];
    };

    // ========================
    // COMMITS
    // ========================
    for (let i = 1; i <= 15; i++) {
      await pool.query(
        `INSERT INTO commits (id, message, developer_id, commit_time)
         VALUES ($1, $2, $3, $4)`,
        [
          i,
          getMessage(i),
          i % 2 === 0 ? 1 : 2,
          new Date(now.getTime() - (15 - i) * 86400000),
        ]
      );
    }

    // ========================
    // CHAIN
    // ========================
    for (let i = 2; i <= 15; i++) {
      await pool.query(
        `INSERT INTO commit_parents (commit_id, parent_commit_id)
         VALUES ($1, $2)`,
        [i, i - 1]
      );
    }

    // ========================
    // CI RUNS (KEY FIX)
    // ========================
    for (let i = 1; i <= 15; i++) {
      let failed;

      if (mode === "demo") {
        // clear regression points
        failed = i === 6 || i === 10;
      } else {
        failed = Math.random() < 0.3;
      }

      await pool.query(
        `INSERT INTO ci_runs (commit_id, status, run_time)
         VALUES ($1, $2, $3)`,
        [
          i,
          failed ? "failed" : "passed",
          new Date(now.getTime() - (15 - i) * 86400000),
        ]
      );
    }

    // ========================
    // FILES
    // ========================
    const filePaths = ["login.js", "cart.js", "payment.js"];

    for (let i = 0; i < filePaths.length; i++) {
      await pool.query(
        `INSERT INTO files (id, path) VALUES ($1, $2)`,
        [i + 1, filePaths[i]]
      );
    }

    // ========================
    // FILE CHANGES (RISKY FILE)
    // ========================
    for (let i = 1; i <= 15; i++) {
      let fileId;

      if (mode === "demo") {
        // payment.js dominates
        fileId = i <= 10 ? 3 : (i % 3) + 1;
      } else {
        fileId = Math.floor(Math.random() * 3) + 1;
      }

      await pool.query(
        `INSERT INTO file_changes (file_id, commit_id)
         VALUES ($1, $2)`,
        [fileId, i]
      );
    }

    // ========================
    // TESTS
    // ========================
    const tests = ["Login", "Cart", "Payment", "Search"];

    for (let i = 0; i < tests.length; i++) {
      await pool.query(
        `INSERT INTO tests (id, name) VALUES ($1, $2)`,
        [i + 1, tests[i]]
      );
    }

    // ========================
    // TEST RESULTS 
    // ========================
    for (let commit = 1; commit <= 15; commit++) {
      const runRes = await pool.query(
        `SELECT id FROM ci_runs WHERE commit_id = $1`,
        [commit]
      );

      const ciRunId = runRes.rows[0]?.id;
      if (!ciRunId) continue;

      for (let test = 1; test <= 4; test++) {
        let isFailure;

        if (mode === "demo") {
          // test 3 is flaky, failures align with bad commits
          if (test === 3) isFailure = Math.random() < 0.5;
          else isFailure = commit === 6 || commit === 10;
        } else {
          isFailure = Math.random() < 0.3;
        }

        await pool.query(
          `INSERT INTO test_results (test_id, ci_run_id, status)
           VALUES ($1, $2, $3)`,
          [
            test,
            ciRunId,
            isFailure ? "failed" : "passed",
          ]
        );
      }
    }

    // ========================
    // BUG REPORTS (MTTR CLEAN)
    // ========================
    if (mode === "demo") {
      const demoBugs = [
        { title: "Payment failure", days: 3 },
        { title: "Checkout issue", days: 2 },
        { title: "Login bug", days: 4 },
      ];

      for (let i = 0; i < demoBugs.length; i++) {
        const created = new Date(now.getTime() - (i + 6) * 86400000);
        const resolved = new Date(created.getTime() + demoBugs[i].days * 86400000);

        await pool.query(
          `INSERT INTO bug_reports (title, created_at, resolved_at)
           VALUES ($1, $2, $3)`,
          [demoBugs[i].title, created, resolved]
        );
      }
    } else {
      for (let i = 1; i <= 3; i++) {
        const created = new Date(now.getTime() - (i + 5) * 86400000);
        const days = Math.floor(Math.random() * 4) + 1;
        const resolved = new Date(created.getTime() + days * 86400000);

        await pool.query(
          `INSERT INTO bug_reports (title, created_at, resolved_at)
           VALUES ($1, $2, $3)`,
          [`Bug ${i}`, created, resolved]
        );
      }
    }

    console.log("GENERATE SUCCESS");

    res.json({ message: "Dataset generated", mode });

  } catch (err) {
    console.error("GEN ERROR:", err);
    res.status(500).json({ error: "Generation failed" });
  }
});/* =========================================
   SERVER
========================================= */

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
