import psycopg2
from faker import Faker
import random
import uuid
from datetime import datetime, timedelta

fake = Faker()

# -----------------------------
# Connect to PostgreSQL
# -----------------------------
conn = psycopg2.connect(
    dbname="sefi",
    user="azfar",
    host="localhost",
    port="5432"
)

cur = conn.cursor()

print("Connected to database")

# -----------------------------
# Reset generated data
# -----------------------------
print("Clearing previous synthetic data...")

cur.execute("DELETE FROM bug_reports")
cur.execute("DELETE FROM test_results")
cur.execute("DELETE FROM file_changes")
cur.execute("DELETE FROM ci_runs")
cur.execute("DELETE FROM files")
cur.execute("DELETE FROM commits")
cur.execute("DELETE FROM tests")

conn.commit()

# -----------------------------
# Ensure repository exists
# -----------------------------
cur.execute("""
INSERT INTO repositories (name)
VALUES ('synthetic-repo')
ON CONFLICT (name) DO NOTHING
RETURNING repo_id
""")

repo = cur.fetchone()

if repo:
    repo_id = repo[0]
else:
    cur.execute("SELECT repo_id FROM repositories WHERE name='synthetic-repo'")
    repo_id = cur.fetchone()[0]

print("Repository ID:", repo_id)

# -----------------------------
# Generate developers (if none)
# -----------------------------
cur.execute("SELECT COUNT(*) FROM developers")
count = cur.fetchone()[0]

if count == 0:
    print("Generating developers...")

    for _ in range(20):
        name = fake.name()
        email = fake.unique.email()
        exp = random.randint(0, 10)

        cur.execute("""
        INSERT INTO developers (name, email, experience_years)
        VALUES (%s,%s,%s)
        """, (name, email, exp))

    conn.commit()
    print("20 developers generated")

# get developer ids
cur.execute("SELECT developer_id FROM developers")
developers = [d[0] for d in cur.fetchall()]

# -----------------------------
# Generate commits
# -----------------------------
print("Generating commits...")

num_commits = 100
parent_commit = None
current_time = datetime.now() - timedelta(days=30)

for i in range(num_commits):

    dev = random.choice(developers)
    commit_hash = uuid.uuid4().hex[:12]

    cur.execute("""
    INSERT INTO commits (
        repo_id,
        developer_id,
        parent_commit_id,
        commit_hash,
        message,
        commit_time
    )
    VALUES (%s,%s,%s,%s,%s,%s)
    RETURNING commit_id
    """,
    (
        repo_id,
        dev,
        parent_commit,
        commit_hash,
        fake.sentence(nb_words=6),
        current_time
    ))

    commit_id = cur.fetchone()[0]
    parent_commit = commit_id
    current_time += timedelta(minutes=random.randint(10, 60))

conn.commit()

print(f"{num_commits} commits generated.")

# -----------------------------
# Generate files
# -----------------------------
print("Generating files...")

num_files = 30
files = []

for i in range(num_files):

    file_path = f"src/module_{random.randint(1,5)}/file_{i}.py"

    cur.execute("""
    INSERT INTO files (repo_id, file_path)
    VALUES (%s,%s)
    RETURNING file_id
    """, (repo_id, file_path))

    files.append(cur.fetchone()[0])

conn.commit()

print(f"{num_files} files created.")

# -----------------------------
# Generate file changes
# -----------------------------
print("Generating file changes...")

cur.execute("SELECT commit_id FROM commits")
commit_ids = [c[0] for c in cur.fetchall()]

change_types = ["ADD", "MODIFY", "DELETE"]

for commit in commit_ids:

    changed_files = random.sample(files, random.randint(1, 5))

    for file_id in changed_files:

        cur.execute("""
        INSERT INTO file_changes
        (commit_id, file_id, change_type, lines_added, lines_deleted)
        VALUES (%s,%s,%s,%s,%s)
        """,
        (
            commit,
            file_id,
            random.choice(change_types),
            random.randint(0, 50),
            random.randint(0, 20)
        ))

conn.commit()

print("File changes generated.")

# -----------------------------
# Generate CI runs
# -----------------------------
print("Generating CI runs...")

ci_ids = []

for commit in commit_ids:

    start_time = datetime.now() - timedelta(days=random.randint(0,30))
    duration = random.randint(60,600)
    end_time = start_time + timedelta(seconds=duration)

    status = random.choices(
        ["PASSED","FAILED"],
        weights=[0.8,0.2]
    )[0]

    cur.execute("""
    INSERT INTO ci_runs
    (commit_id, status, start_time, end_time, duration_seconds)
    VALUES (%s,%s,%s,%s,%s)
    RETURNING ci_id
    """,
    (
        commit,
        status,
        start_time,
        end_time,
        duration
    ))

    ci_ids.append(cur.fetchone()[0])

conn.commit()

print("CI runs generated.")

# -----------------------------
# Generate tests
# -----------------------------
print("Generating tests...")

test_ids = []

for i in range(15):

    test_name = f"test_case_{i}"
    module = f"module_{random.randint(1,5)}"

    cur.execute("""
    INSERT INTO tests (test_name, module)
    VALUES (%s,%s)
    RETURNING test_id
    """, (test_name, module))

    test_ids.append(cur.fetchone()[0])

conn.commit()

print("Tests generated.")

# -----------------------------
# Generate test results
# -----------------------------
print("Generating test results...")

print("Generating test results...")

for ci_id in ci_ids:

    ci_failed = False

    for test_id in test_ids:

        status = random.choices(
            ["PASSED","FAILED","SKIPPED"],
            weights=[0.85,0.1,0.05]
        )[0]

        if status == "FAILED":
            ci_failed = True

        execution_time = random.uniform(0.1, 3.0)

        cur.execute("""
        INSERT INTO test_results
        (ci_id, test_id, status, execution_time)
        VALUES (%s,%s,%s,%s)
        """,
        (ci_id, test_id, status, execution_time))

    # update CI status if any test failed
    if ci_failed:
        cur.execute("""
        UPDATE ci_runs
        SET status='FAILED'
        WHERE ci_id=%s
        """, (ci_id,))

conn.commit()

print("Test results generated.")
# -----------------------------
# Generate bug reports
# -----------------------------
print("Generating bug reports...")

cur.execute("SELECT commit_id FROM commits")
commit_ids = [c[0] for c in cur.fetchall()]

num_bugs = random.randint(10, 25)

for _ in range(num_bugs):

    introduced_commit = random.choice(commit_ids)

    # pick a later commit to fix it
    later_commits = [c for c in commit_ids if c > introduced_commit]

    fixed_commit = random.choice(later_commits) if later_commits else None

    reported_time = datetime.now() - timedelta(days=random.randint(1,20))

    resolved_time = None
    if fixed_commit:
        resolved_time = reported_time + timedelta(days=random.randint(1,10))

    severity = random.choice(["LOW","MEDIUM","HIGH","CRITICAL"])

    cur.execute("""
    INSERT INTO bug_reports
    (repo_id, introduced_in_commit, fixed_in_commit,
     severity, reported_at, resolved_at)
    VALUES (%s,%s,%s,%s,%s,%s)
    """,
    (
        repo_id,
        introduced_commit,
        fixed_commit,
        severity,
        reported_time,
        resolved_time
    ))

conn.commit()

print("Bug reports generated.")

# -----------------------------
# Close connection
# -----------------------------
cur.close()
conn.close()

print("Synthetic dataset generation complete.")