import psycopg2

conn_str = "postgresql://postgres:rutvik1016@localhost:5432/PropTrailDB"
conn = psycopg2.connect(conn_str)
cur = conn.cursor()

def print_table(table_name):
    print(f"\n=== TABLE: {table_name} ===")
    try:
        cur.execute(f"SELECT * FROM \"{table_name}\"")
        colnames = [desc[0] for desc in cur.description]
        print(colnames)
        rows = cur.fetchall()
        for row in rows:
            print(row)
    except Exception as e:
        print(f"Error reading {table_name}: {e}")
    conn.rollback()

print_table("Brokers")
print_table("Leads")
print_table("Properties")
print_table("Visits")

# Check Foreign Keys on Visits table
print("\n=== FOREIGN KEYS ON Visits ===")
cur.execute("""
    SELECT
        tc.table_schema, 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='Visits';
""")
for fk in cur.fetchall():
    print(fk)

cur.close()
conn.close()
