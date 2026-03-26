from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import psycopg2
from typing import Optional

app = FastAPI(title="SEFI API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    return psycopg2.connect(
        dbname="sefi",
        user="azfar",
        host="localhost",
        port="5432"
    )


def normalize_filter(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    if value == "all":
        return None
    return value


@app.get("/")
def root():
    return {"message": "SEFI API running"}


# ----------------------------------
# Developer Failure Rate
# ----------------------------------
@app.get("/developers/failure-rate")
def developer_failure_rate(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    developer: Optional[str] = None,
    file: Optional[str] = None,
):

    start_date = normalize_filter(start_date)
    end_date = normalize_filter(end_date)
    developer = normalize_filter(developer)
    file = normalize_filter(file)

    conn = get_db()
    cur = conn.cursor()

    params = {
        "start_date": start_date,
        "end_date": end_date,
        "developer": developer,
        "file": file,
    }

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
        WHERE 1=1
        AND (%(start_date)s IS NULL OR c.commit_time >= %(start_date)s::date)
        AND (%(end_date)s IS NULL OR c.commit_time <= %(end_date)s::date)
        AND (%(developer)s IS NULL OR d.name = %(developer)s)
        AND (%(file)s IS NULL OR EXISTS (
            SELECT 1
            FROM file_changes fc
            JOIN files f ON fc.file_id = f.file_id
            WHERE fc.commit_id = c.commit_id
              AND f.file_path = %(file)s
        ))
        GROUP BY d.name
        ORDER BY failure_rate DESC;
    """, params)

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
def ci_failure_trend(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    developer: Optional[str] = None,
    file: Optional[str] = None,
):

    start_date = normalize_filter(start_date)
    end_date = normalize_filter(end_date)
    developer = normalize_filter(developer)
    file = normalize_filter(file)

    conn = get_db()
    cur = conn.cursor()

    params = {
        "start_date": start_date,
        "end_date": end_date,
        "developer": developer,
        "file": file,
    }

    cur.execute("""
        SELECT
            DATE(ci.start_time) AS build_date,
            COUNT(*) FILTER (WHERE status='FAILED') AS failures,
            COUNT(*) AS total_builds
        FROM ci_runs ci
        JOIN commits c ON ci.commit_id = c.commit_id
        JOIN developers d ON c.developer_id = d.developer_id
        WHERE 1=1
        AND (%(start_date)s IS NULL OR ci.start_time >= %(start_date)s::date)
        AND (%(end_date)s IS NULL OR ci.start_time <= %(end_date)s::date)
        AND (%(developer)s IS NULL OR d.name = %(developer)s)
        AND (%(file)s IS NULL OR EXISTS (
            SELECT 1
            FROM file_changes fc
            JOIN files f ON fc.file_id = f.file_id
            WHERE fc.commit_id = c.commit_id
              AND f.file_path = %(file)s
        ))
        GROUP BY build_date
        ORDER BY build_date;
    """, params)

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
def failure_prone_files(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    developer: Optional[str] = None,
    file: Optional[str] = None,
):

    start_date = normalize_filter(start_date)
    end_date = normalize_filter(end_date)
    developer = normalize_filter(developer)
    file = normalize_filter(file)

    conn = get_db()
    cur = conn.cursor()

    params = {
        "start_date": start_date,
        "end_date": end_date,
        "developer": developer,
        "file": file,
    }

    cur.execute("""
        SELECT
            f.file_path,
            COUNT(*) FILTER (WHERE ci.status='FAILED') AS failure_count
        FROM file_changes fc
        JOIN files f ON fc.file_id = f.file_id
        JOIN commits c ON fc.commit_id = c.commit_id
        JOIN developers d ON c.developer_id = d.developer_id
        JOIN ci_runs ci ON c.commit_id = ci.commit_id
        WHERE 1=1
        AND (%(start_date)s IS NULL OR c.commit_time >= %(start_date)s::date)
        AND (%(end_date)s IS NULL OR c.commit_time <= %(end_date)s::date)
        AND (%(developer)s IS NULL OR d.name = %(developer)s)
        AND (%(file)s IS NULL OR f.file_path = %(file)s)
        GROUP BY f.file_path
        ORDER BY failure_count DESC
        LIMIT 10;
    """, params)

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
def flaky_tests(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    developer: Optional[str] = None,
    file: Optional[str] = None,
):

    start_date = normalize_filter(start_date)
    end_date = normalize_filter(end_date)
    developer = normalize_filter(developer)
    file = normalize_filter(file)

    conn = get_db()
    cur = conn.cursor()

    params = {
        "start_date": start_date,
        "end_date": end_date,
        "developer": developer,
        "file": file,
    }

    cur.execute("""
        SELECT
            t.test_name,
            COUNT(*) FILTER (WHERE tr.status='FAILED') AS failures,
            COUNT(*) FILTER (WHERE tr.status='PASSED') AS passes
        FROM tests t
        JOIN test_results tr ON t.test_id = tr.test_id
        JOIN ci_runs ci ON tr.ci_id = ci.ci_id
        JOIN commits c ON ci.commit_id = c.commit_id
        JOIN developers d ON c.developer_id = d.developer_id
        WHERE 1=1
        AND (%(start_date)s IS NULL OR ci.start_time >= %(start_date)s::date)
        AND (%(end_date)s IS NULL OR ci.start_time <= %(end_date)s::date)
        AND (%(developer)s IS NULL OR d.name = %(developer)s)
        AND (%(file)s IS NULL OR EXISTS (
            SELECT 1
            FROM file_changes fc
            JOIN files f ON fc.file_id = f.file_id
            WHERE fc.commit_id = c.commit_id
              AND f.file_path = %(file)s
        ))
        GROUP BY t.test_name
        HAVING 
            COUNT(*) FILTER (WHERE tr.status='FAILED') > 0
            AND COUNT(*) FILTER (WHERE tr.status='PASSED') > 0
        ORDER BY failures DESC;
    """, params)

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
def mttr(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    developer: Optional[str] = None,
    file: Optional[str] = None,
):

    start_date = normalize_filter(start_date)
    end_date = normalize_filter(end_date)
    developer = normalize_filter(developer)
    file = normalize_filter(file)

    conn = get_db()
    cur = conn.cursor()

    params = {
        "start_date": start_date,
        "end_date": end_date,
        "developer": developer,
        "file": file,
    }

    cur.execute("""
        SELECT AVG(br.resolved_at - br.reported_at)
        FROM bug_reports br
        JOIN commits c ON br.introduced_in_commit = c.commit_id
        JOIN developers d ON c.developer_id = d.developer_id
        WHERE br.resolved_at IS NOT NULL
        AND (%(start_date)s IS NULL OR br.reported_at >= %(start_date)s::date)
        AND (%(end_date)s IS NULL OR br.reported_at <= %(end_date)s::date)
        AND (%(developer)s IS NULL OR d.name = %(developer)s)
        AND (%(file)s IS NULL OR EXISTS (
            SELECT 1
            FROM file_changes fc
            JOIN files f ON fc.file_id = f.file_id
            WHERE fc.commit_id = c.commit_id
              AND f.file_path = %(file)s
        ));
    """, params)

    row = cur.fetchone()

    cur.close()
    conn.close()

    mttr_value = row[0] if row else None
    return {"mttr": None if mttr_value is None else str(mttr_value)}


# ----------------------------------
# Build Summary
# ----------------------------------
@app.get("/build/summary")
def build_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    developer: Optional[str] = None,
    file: Optional[str] = None,
):

    start_date = normalize_filter(start_date)
    end_date = normalize_filter(end_date)
    developer = normalize_filter(developer)
    file = normalize_filter(file)

    conn = get_db()
    cur = conn.cursor()

    params = {
        "start_date": start_date,
        "end_date": end_date,
        "developer": developer,
        "file": file,
    }

    cur.execute("""
        SELECT
            COUNT(*) FILTER (WHERE ci.status='PASSED'),
            COUNT(*) FILTER (WHERE ci.status='FAILED')
        FROM ci_runs ci
        JOIN commits c ON ci.commit_id = c.commit_id
        JOIN developers d ON c.developer_id = d.developer_id
        WHERE 1=1
        AND (%(start_date)s IS NULL OR ci.start_time >= %(start_date)s::date)
        AND (%(end_date)s IS NULL OR ci.start_time <= %(end_date)s::date)
        AND (%(developer)s IS NULL OR d.name = %(developer)s)
        AND (%(file)s IS NULL OR EXISTS (
            SELECT 1
            FROM file_changes fc
            JOIN files f ON fc.file_id = f.file_id
            WHERE fc.commit_id = c.commit_id
              AND f.file_path = %(file)s
        ));
    """, params)

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
def failure_attribution(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    developer: Optional[str] = None,
    file: Optional[str] = None,
):

    start_date = normalize_filter(start_date)
    end_date = normalize_filter(end_date)
    developer = normalize_filter(developer)
    file = normalize_filter(file)

    conn = get_db()
    cur = conn.cursor()

    params = {
        "start_date": start_date,
        "end_date": end_date,
        "developer": developer,
        "file": file,
    }

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
        JOIN developers d ON c.developer_id = d.developer_id
        JOIN ci_runs ci ON c.commit_id = ci.commit_id
        WHERE 1=1
        AND (%(start_date)s IS NULL OR c.commit_time >= %(start_date)s::date)
        AND (%(end_date)s IS NULL OR c.commit_time <= %(end_date)s::date)
        AND (%(developer)s IS NULL OR d.name = %(developer)s)
        AND (%(file)s IS NULL OR f.file_path = %(file)s)
        GROUP BY f.file_path
        HAVING COUNT(*) > 5
        ORDER BY failure_ratio DESC
        LIMIT 10;
    """, params)

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