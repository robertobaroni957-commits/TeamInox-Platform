-- Migration to add stable team identification
ALTER TABLE division_results ADD COLUMN wtrl_team_id INTEGER;
ALTER TABLE zrl_team_standings ADD COLUMN wtrl_team_id INTEGER;

-- Create indexes for better performance
CREATE INDEX idx_division_results_wtrl_team_id ON division_results(wtrl_team_id);
CREATE INDEX idx_zrl_team_standings_wtrl_team_id ON zrl_team_standings(wtrl_team_id);
