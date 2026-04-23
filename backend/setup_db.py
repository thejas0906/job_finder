import mysql.connector as sq
con=sq.connect(user="root",password="root",host="localhost")
cur=con.cursor()


cur.execute("create database if not exist job_finder")
cur.execute("use job_finder")
cur.execute("""
            create table if not exist job_seeker(
            seeker_id BINARY(16) PRIMARY KEY, 
            seeker_name varchar(100), 
            seeker_email varchar(60),
            password varchar(30),
            age int,
            degree varchar(20),
            experience int,
            expected_salary decimal(10,2),
            field varchar(30),
            preferred_work_mode varchar(30),
            location varchar(30))
            """)
cur.execute("""
            create table if not exist seeker_resume(
            seeker_id BINARY(16) references job_seeker(seeker_id),
            resume varchar(50))
            """)
cur.execute("""
            create table if not exist recruiter_info(
            comp_id BINARY(16) PRIMARY KEY,
            password varchar(30),
            company_name varchar(100),
            comp_email varchar(60),
            phone int,location varchar(50))
            """)
cur.execute("""
            create table if not exist jobs(
            job_id BINARY(16) PRIMARY KEY,
            comp_id BINARY(16) references recruiter_info(comp_id),
            job_title varchar(20),
            job_desc varchar(100),
            salary decimal(10,2),
            location varchar(30),skills TEXT)
            """)
cur.execute("""
            create table if not exist applied_jobs(
            job_id BINARY(16) references jobs(job_id),
            seeker_id BINARY(16) references job_seeker(seeker_id),
            status varchar(20),
            PRIMARY KEY (job_id,seeker_id))
            """)