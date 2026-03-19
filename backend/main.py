from fastapi import FastAPI
import psycopg2

app = FastAPI(title="SEFI API")

def get_db():
    return psycopg2.connect(
        dbname="sefi",
        user="azfar",
        host="localhost",
        port="5432"
    )


@app.get("/")
def root():
    return {"message": "SEFI API running"}


# ----------------------------------
# Developer Failure Rate
# ----------------------------------
@app.get("/developers/failure-rate")
def developer_failure_rate():

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            d.name,
            COUNT(*) FILTER (WHERE ci.status = 'FAILED') AS failures,
            COUNT(*) AS total_builds,
            ROUND(
                COUNT(*) FILTER (WHERE ci.status='FAILED') * 100.0 /
                COUNT(*),
                2
            ) AS failure_rate
        FROM developers d
        JOIN commits c ON d.developer_id = c.developer_id
        JOIN ci_runs ci ON c.commit_id = ci.commit_id
        GROUP BY d.name
        ORDER BY failure_rate DESC;
    """)

    rows = cur.fetchall()

    result = []
    for r in rows:
        result.append({
            "developer": r[0],
            "failures": r[1],
            "total_builds": r[2],
            "failure_rate": float(r[3])
        })

    cur.close()
    conn.close()

    return result


# ----------------------------------
# CI Failure Trend
# ----------------------------------
@app.get("/ci/failure-trend")
def ci_failure_trend():

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            DATE(start_time) AS build_date,
            COUNT(*) FILTER (WHERE status='FAILED') AS failures,
            COUNT(*) AS total_builds
        FROM ci_runs
        GROUP BY build_date
        ORDER BY build_date;
    """)

    rows = cur.fetchall()

    result = []
    for r in rows:
        result.append({
            "date": str(r[0]),
            "failures": r[1],
            "total_builds": r[2]
        })

    cur.close()
    conn.close()

    return result


# ----------------------------------
# Failure-Prone Files
# ----------------------------------
@app.get("/files/failure-prone")
def failure_prone_files():

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            f.file_path,
            COUNT(*) FILTER (WHERE ci.status='FAILED') AS failure_count
        FROM file_changes fc
        JOIN files f ON fc.file_id = f.file_id
        JOIN commits c ON fc.commit_id = c.commit_id
        JOIN ci_runs ci ON c.commit_id = ci.commit_id
        GROUP BY f.file_path
        ORDER BY failure_count DESC
        LIMIT 10;
    """)

    rows = cur.fetchall()

    result = []
    for r in rows:
        result.append({
            "file": r[0],
            "failures": r[1]
        })

    cur.close()
    conn.close()

    return result


# ----------------------------------
# Flaky Tests
# ----------------------------------
@app.get("/tests/flaky")
def flaky_tests():

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            t.test_name,
            COUNT(*) FILTER (WHERE tr.status='FAILED') AS failures,
            COUNT(*) FILTER (WHERE tr.status='PASSED') AS passes
        FROM tests t
        JOIN test_results tr ON t.test_id = tr.test_id
        GROUP BY t.test_name
        HAVING 
            COUNT(*) FILTER (WHERE tr.status='FAILED') > 0
            AND COUNT(*) FILTER (WHERE tr.status='PASSED') > 0
        ORDER BY failures DESC;
    """)

    rows = cur.fetchall()

    result = []
    for r in rows:
        result.append({
            "test": r[0],
            "failures": r[1],
            "passes": r[2]
        })

    cur.close()
    conn.close()

    return result


# ----------------------------------
# Mean Time To Repair
# ----------------------------------
@app.get("/bugs/mttr")
def mttr():

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT AVG(resolved_at - reported_at)
        FROM bug_reports
        WHERE resolved_at IS NOT NULL;
    """)

    row = cur.fetchone()

    cur.close()
    conn.close()

    return {"mttr": str(row[0])}


# ----------------------------------
# Build Summary
# ----------------------------------
@app.get("/build/summary")
def build_summary():

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            COUNT(*) FILTER (WHERE status='PASSED'),
            COUNT(*) FILTER (WHERE status='FAILED')
        FROM ci_runs;
    """)

    row = cur.fetchone()

    cur.close()
    conn.close()

    return {
        "passed_builds": row[0],
        "failed_builds": row[1]
    }

# ----------------------------------
# Failure Attribution (Root Cause Signal)
# ----------------------------------
@app.get("/files/failure-attribution")
def failure_attribution():

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            f.file_path,
            COUNT(*) FILTER (WHERE ci.status='FAILED') AS failure_hits,
            COUNT(*) AS total_changes,
            ROUND(
                COUNT(*) FILTER (WHERE ci.status='FAILED') * 100.0 /
                COUNT(*),
                2
            ) AS failure_ratio
        FROM file_changes fc
        JOIN files f ON fc.file_id = f.file_id
        JOIN commits c ON fc.commit_id = c.commit_id
        JOIN ci_runs ci ON c.commit_id = ci.commit_id
        GROUP BY f.file_path
        HAVING COUNT(*) > 5
        ORDER BY failure_ratio DESC
        LIMIT 10;
    """)

    rows = cur.fetchall()

    result = []
    for r in rows:
        result.append({
            "file": r[0],
            "failure_hits": r[1],
            "total_changes": r[2],
            "failure_ratio": float(r[3])
        })

    cur.close()
    conn.close()

    return result