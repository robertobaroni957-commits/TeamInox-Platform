# newZRL/blueprints/admin/reports.py
from flask import Blueprint, render_template, request, send_file, flash, redirect
from newZRL.models import db, Rider, Team, RaceLineup
import pandas as pd
import io
import datetime
import locale

# Locale italiano
try:
    locale.setlocale(locale.LC_TIME, "it_IT.UTF-8")
except locale.Error:
    try:
        locale.setlocale(locale.LC_TIME, "it_IT")
    except locale.Error:
        locale.setlocale(locale.LC_TIME, "")

admin_reports_bp = Blueprint("admin_reports", __name__, url_prefix="/admin/reports")

# ---------------------------
# Visualizza report
# ---------------------------
@admin_reports_bp.route("/")
def index():
    report_type = (request.args.get("report_type") or "riders_compact").strip()
    category_filter = (request.args.get("category") or "").strip().upper()
    team_filter = (request.args.get("team") or "").strip()

    valid_reports = ["riders_compact", "riders", "teams", "lineup", "team_composition"]
    if report_type not in valid_reports:
        flash("Tipo di report non valido", "danger")
        report_type = "riders_compact"

    # Categorie e team
    categories = [c[0] for c in db.session.query(Rider.category).filter(Rider.active==True).distinct().all()]
    teams_list = [t.name for t in db.session.query(Team.name).all()]

    rows, columns, lineup_per_team, team_categories, race_date = [], [], {}, {}, None

    # ---------------------------
    # Riders / Riders Compact
    # ---------------------------
    if report_type in ["riders", "riders_compact"]:
        query = db.session.query(
            Rider.zwift_power_id,
            Rider.name,
            Rider.category,
            Team.name.label("team_name")
        ).outerjoin(Rider.teams)

        if category_filter:
            query = query.filter(Rider.category.ilike(category_filter))

        df = pd.read_sql(query.statement, db.session.bind)

        df["team_name"] = df["team_name"].fillna("")
        split_teams = df.groupby("zwift_power_id")["team_name"].agg(lambda x: ",".join(x.unique()))
        df = df.drop("team_name", axis=1).merge(split_teams.rename("teams"), left_on="zwift_power_id", right_index=True)
        split = df["teams"].str.split(",", n=1, expand=True)
        df["team1"] = split[0].fillna("")
        df["team2"] = split[1].fillna("") if 1 in split.columns else ""
        df = df[["zwift_power_id", "name", "category", "team1", "team2"]]
        rows = df.to_dict(orient="records")
        columns = list(df.columns)

    # ---------------------------
    # Teams
    # ---------------------------
    elif report_type == "teams":
        teams = Team.query.all()
        rows = []
        for t in teams:
            rows.append({
                "team": t.name,
                "category": t.category,
                "n_riders": len(t.riders),
                "captain": t.captain.name if t.captain else ""
            })
        columns = ["team", "category", "n_riders", "captain"]

    # ---------------------------
    # Lineup
    # ---------------------------
    elif report_type == "lineup":
        query = db.session.query(
            RaceLineup,
            Rider.name.label("rider_name"),
            Rider.category.label("category"),
            Team.name.label("team_name"),
            Team.captain_zwift_id
        ).join(RaceLineup.rider).join(RaceLineup.team)

        if category_filter:
            query = query.filter(Rider.category.ilike(category_filter))

        rows_raw = query.all()
        lineup_per_team, team_categories = {}, {}
        for r in rows_raw:
            team = r.team_name or "Senza Team"
            lineup_per_team.setdefault(team, []).append({
                "rider_name": r.rider_name,
                "category": r.category,
                "race_date": r.RaceLineup.race_date,
                "captain": r.RaceLineup.team.captain.name if r.RaceLineup.team.captain else ""
            })
        columns = ["team", "rider_name", "category", "race_date", "captain"]

    # ---------------------------
    # Team Composition
    # ---------------------------
    elif report_type == "team_composition":
        teams = Team.query.all()
        lineup_per_team = {}
        for t in teams:
            riders = []
            for r in t.riders:
                if category_filter and r.category.upper() != category_filter:
                    continue
                riders.append({
                    "rider_name": r.name,
                    "category": r.category,
                    "captain": t.captain.name if t.captain else ""
                })
            if team_filter and t.name != team_filter:
                continue
            lineup_per_team[t.name] = riders
        columns = ["team_name", "rider_name", "category", "captain"]

    return render_template(
        "admin/reports/index.html",
        report_type=report_type,
        rows=rows,
        columns=columns,
        categories=categories,
        teams=teams_list,
        category_filter=category_filter,
        team_filter=team_filter,
        lineup_per_team=lineup_per_team if report_type in ["lineup", "team_composition"] else None,
        team_categories=team_categories if report_type in ["lineup", "team_composition"] else None,
        race_date=race_date
    )
