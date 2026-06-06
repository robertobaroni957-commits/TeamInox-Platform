DELETE FROM team_members
WHERE rowid NOT IN (
    SELECT MIN(rowid)
    FROM team_members
    GROUP BY team_id, athlete_id, season_id
);