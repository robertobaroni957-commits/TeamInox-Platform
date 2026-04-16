-- Migration to add missing fields to teams and athletes for WTRL sync
ALTER TABLE teams ADD COLUMN tttid INTEGER;
ALTER TABLE teams ADD COLUMN club_name TEXT;
ALTER TABLE teams ADD COLUMN gender TEXT;
ALTER TABLE teams ADD COLUMN league TEXT;
ALTER TABLE teams ADD COLUMN zrldivision TEXT;
ALTER TABLE teams ADD COLUMN league_color TEXT;
ALTER TABLE teams ADD COLUMN rec INTEGER;
ALTER TABLE teams ADD COLUMN status INTEGER;
ALTER TABLE teams ADD COLUMN is_dev INTEGER;
ALTER TABLE teams ADD COLUMN rounds TEXT;
ALTER TABLE teams ADD COLUMN member_count INTEGER;

ALTER TABLE athletes ADD COLUMN zftp REAL;
ALTER TABLE athletes ADD COLUMN zftpw INTEGER;
ALTER TABLE athletes ADD COLUMN zmap REAL;
ALTER TABLE athletes ADD COLUMN zmapw INTEGER;
ALTER TABLE athletes ADD COLUMN profile_id INTEGER;
ALTER TABLE athletes ADD COLUMN wtrl_user_id TEXT;
