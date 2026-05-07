from typing import Optional
from fastapi import APIRouter
from database import get_cursor

router = APIRouter(prefix="/api/map")


@router.get("/date-range")
def get_date_range():
    with get_cursor() as cur:
        cur.execute("""
            SELECT
                MIN(county_daily_totals_date) AS min_date,
                MAX(county_daily_totals_date) AS max_date
            FROM usa_raw_county_daily
            WHERE county_daily_totals_date IS NOT NULL
        """)
        return cur.fetchone()


@router.get("/states")
def get_states():
    with get_cursor() as cur:
        cur.execute("""
            SELECT
                usa_states_name                  AS name,
                usa_states_short                 AS short,
                LPAD(state_fips::text, 2, '0')   AS fips
            FROM usa_states
            ORDER BY usa_states_name
        """)
        return cur.fetchall()


@router.get("/cases")
def get_cases_by_date(date: str, state_fips: Optional[str] = None):
    with get_cursor() as cur:
        query = """
            SELECT
                LPAD(c.fips, 5, '0')                              AS fips,
                COALESCE(r.county_daily_counts_total_on_date, 0)  AS cases,
                COALESCE(r.county_daily_deaths_total_on_date, 0)  AS deaths,
                c.usa_counties_name                               AS county,
                s.usa_states_short                                AS state
            FROM usa_raw_county_daily r
            JOIN usa_counties c ON r.usa_counties_id = c.usa_counties_id
            JOIN usa_states s   ON r.usa_states_id   = s.usa_states_id
            WHERE r.county_daily_totals_date = %s
        """
        params: list = [date]
        if state_fips:
            query += " AND LPAD(s.state_fips::text, 2, '0') = %s"
            params.append(state_fips.zfill(2))
        cur.execute(query, params)
        return cur.fetchall()
