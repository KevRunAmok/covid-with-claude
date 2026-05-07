from fastapi import APIRouter, HTTPException
from database import get_cursor

router = APIRouter(prefix="/api/counties")


@router.get("")
def search_counties(search: str = ""):
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT
                c.usa_counties_id,
                c.usa_counties_name,
                s.usa_states_name,
                s.usa_states_short
            FROM usa_counties c
            JOIN usa_states s ON c.usa_states_id = s.usa_states_id
            WHERE c.usa_counties_name ILIKE %s
            ORDER BY s.usa_states_short, c.usa_counties_name
            LIMIT 100
            """,
            (f"%{search}%",),
        )
        return cur.fetchall()


@router.get("/{county_id}")
def get_county(county_id: int):
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT
                c.usa_counties_id        AS "ID",
                c.usa_counties_name      AS "County",
                s.usa_states_name        AS "State",
                s.usa_states_short       AS "State Code",
                c.fips                   AS "FIPS",
                c.usa_counties_pop       AS "Population",
                c.usa_counties_sq_mi     AS "Area (sq mi)",
                c.created_at             AS "Created At",
                c.updated_at             AS "Updated At"
            FROM usa_counties c
            JOIN usa_states s ON c.usa_states_id = s.usa_states_id
            WHERE c.usa_counties_id = %s
            """,
            (county_id,),
        )
        row = cur.fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="County not found")
        return row


@router.get("/{county_id}/timeseries")
def get_county_timeseries(county_id: int):
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT
                county_daily_totals_date        AS date,
                county_daily_counts_total_on_date AS total_cases,
                county_daily_cases_7_day_avg    AS cases_7day_avg,
                county_daily_cases_active       AS active_cases,
                county_daily_deaths_total_on_date AS total_deaths,
                county_daily_deaths_7_day_avg   AS deaths_7day_avg
            FROM usa_raw_county_daily
            WHERE usa_counties_id = %s
            ORDER BY county_daily_totals_date
            """,
            (county_id,),
        )
        rows = cur.fetchall()
        if not rows:
            raise HTTPException(status_code=404, detail="No timeseries data found")
        return rows
