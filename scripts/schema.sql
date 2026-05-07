CREATE TABLE usa_states (
    usa_states_id SERIAL PRIMARY KEY,
    usa_states_name VARCHAR(45) NOT NULL,
    usa_states_short VARCHAR(5) NOT NULL,
    usa_states_pop INTEGER NOT NULL,
    usa_states_sq_mi INTEGER NOT NULL,
    state_fips CHAR(5) NOT NULL,
    is_a_territory CHAR(3) DEFAULT 'No',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE usa_counties (
    usa_counties_id SERIAL PRIMARY KEY,
    usa_counties_name VARCHAR(45) NOT NULL,
    usa_counties_pop INTEGER NOT NULL,
    usa_counties_sq_mi INTEGER NOT NULL,
    usa_states_id INTEGER NOT NULL REFERENCES usa_states(usa_states_id),
    fips CHAR(5) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE usa_cities (
    usa_cities_id SERIAL PRIMARY KEY,
    usa_cities_name VARCHAR(45) NOT NULL,
    usa_cities_pop INTEGER NOT NULL,
    usa_cities_sq_mi INTEGER NOT NULL,
    usa_states_id INTEGER NOT NULL REFERENCES usa_states(usa_states_id),
    usa_counties_id INTEGER NOT NULL REFERENCES usa_counties(usa_counties_id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE usa_airports (
    usa_airports_id SERIAL PRIMARY KEY,
    usa_airports_iata VARCHAR(5) NOT NULL,
    usa_airports_name VARCHAR(75) NOT NULL,
    usa_airports_annual_domestic_pop INTEGER NOT NULL,
    usa_airports_annual_international_pop INTEGER NOT NULL,
    usa_states_id INTEGER NOT NULL REFERENCES usa_states(usa_states_id),
    usa_counties_id INTEGER NOT NULL REFERENCES usa_counties(usa_counties_id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE usa_hospitals (
    usa_hospitals_id SERIAL PRIMARY KEY,
    usa_hospitals_name VARCHAR(100) NOT NULL,
    usa_hospitals_address VARCHAR(75),
    usa_hospitals_city VARCHAR(50),
    usa_hospitals_zip INTEGER,
    usa_hospitals_fips CHAR(5),
    usa_hospitals_subtype VARCHAR(50),
    usa_hospitals_is_metro_micro VARCHAR(10),
    usa_states_id INTEGER NOT NULL REFERENCES usa_states(usa_states_id),
    usa_counties_id INTEGER NOT NULL REFERENCES usa_counties(usa_counties_id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE usa_county_adjacents (
    usa_county_main_id INTEGER NOT NULL REFERENCES usa_counties(usa_counties_id),
    usa_county_neighbor_id INTEGER NOT NULL REFERENCES usa_counties(usa_counties_id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (usa_county_main_id, usa_county_neighbor_id)
);

CREATE TABLE usa_state_adjacents (
    usa_state_main_id INTEGER NOT NULL REFERENCES usa_states(usa_states_id),
    usa_state_neighbor_id INTEGER NOT NULL REFERENCES usa_states(usa_states_id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (usa_state_main_id, usa_state_neighbor_id)
);

CREATE TABLE usa_county_totals (
    usa_county_totals_id SERIAL PRIMARY KEY,
    county_cases_max INTEGER,
    county_cases_double_rate INTEGER NOT NULL,
    county_cases_7_day_avg INTEGER NOT NULL,
    county_deaths_max INTEGER,
    county_deaths_double_rate INTEGER NOT NULL,
    county_deaths_7_day_avg INTEGER NOT NULL,
    usa_states_id INTEGER NOT NULL REFERENCES usa_states(usa_states_id),
    usa_counties_id INTEGER NOT NULL REFERENCES usa_counties(usa_counties_id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    county_cases_active INTEGER
);

CREATE TABLE usa_state_totals (
    usa_state_totals_id SERIAL PRIMARY KEY,
    state_cases_max INTEGER,
    state_cases_double_rate INTEGER NOT NULL,
    state_cases_7_day_avg INTEGER NOT NULL,
    state_deaths_max INTEGER,
    state_deaths_double_rate INTEGER NOT NULL,
    state_deaths_7_day_avg INTEGER NOT NULL,
    usa_states_id INTEGER NOT NULL REFERENCES usa_states(usa_states_id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    state_cases_active INTEGER
);

CREATE TABLE usa_raw_county_daily (
    usa_raw_county_daily_id SERIAL PRIMARY KEY,
    county_daily_counts_total_on_date INTEGER,
    county_daily_cases_double_rate INTEGER NOT NULL,
    county_daily_cases_7_day_avg INTEGER NOT NULL,
    county_daily_deaths_total_on_date INTEGER,
    county_daily_deaths_double_rate INTEGER NOT NULL,
    county_daily_deaths_7_day_avg INTEGER NOT NULL,
    county_daily_totals_date DATE,
    usa_states_id INTEGER NOT NULL REFERENCES usa_states(usa_states_id),
    usa_counties_id INTEGER NOT NULL REFERENCES usa_counties(usa_counties_id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    county_daily_cases_active INTEGER
);

CREATE TABLE usa_raw_state_daily (
    usa_raw_state_daily_id SERIAL PRIMARY KEY,
    state_daily_counts_total_on_date INTEGER,
    state_daily_cases_double_rate INTEGER NOT NULL,
    state_daily_cases_7_day_avg INTEGER NOT NULL,
    state_daily_deaths_total_on_date INTEGER,
    state_daily_deaths_double_rate INTEGER NOT NULL,
    state_daily_deaths_7_day_avg INTEGER NOT NULL,
    state_daily_totals_date DATE,
    usa_states_id INTEGER NOT NULL REFERENCES usa_states(usa_states_id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    state_daily_cases_active INTEGER
);

CREATE TABLE usa_raw_data (
    usa_raw_data_id SERIAL PRIMARY KEY,
    county_counts_total_on_date INTEGER,
    county_deaths_total_on_date INTEGER,
    county_totals_date DATE,
    usa_states_id INTEGER NOT NULL REFERENCES usa_states(usa_states_id),
    usa_counties_id INTEGER NOT NULL REFERENCES usa_counties(usa_counties_id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE usa_hospitals_latest (
    usa_hospitals_latest_id SERIAL PRIMARY KEY,
    usa_counties_id INTEGER NOT NULL REFERENCES usa_counties(usa_counties_id),
    usa_states_id INTEGER NOT NULL REFERENCES usa_states(usa_states_id),
    usa_hospitals_id INTEGER NOT NULL REFERENCES usa_hospitals(usa_hospitals_id),
    total_beds_7_day_avg INTEGER,
    total_inpatient_beds_7_day_avg INTEGER,
    total_inpatient_beds_used_7_day_avg INTEGER,
    total_adult_patients_confirmed_covid_7_day_avg INTEGER,
    total_pediatric_patients_hospitalized_confirmed_covid_7_day_avg INTEGER NOT NULL,
    total_icu_beds_7_day_avg INTEGER,
    total_icu_beds_used_7_day_avg INTEGER,
    total_staffed_adult_icu_patients_confirmed_covid_7_day_avg INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    collection_week_date DATE
);

CREATE TABLE usa_raw_hospital_weekly (
    usa_raw_hospital_weekly_id SERIAL PRIMARY KEY,
    collection_week_date DATE NOT NULL,
    total_beds_7_day_avg INTEGER,
    total_adult_beds_7_day_avg INTEGER,
    total_adult_inpatient_beds_7_day_avg INTEGER,
    total_inpatient_beds_used_7_day_avg INTEGER,
    total_adult_inpatient_beds_occupied_7_day_avg INTEGER,
    total_adult_patients_confirmed_covid_7_day_avg INTEGER,
    total_pediatric_patients_hospitalized_confirmed_covid_7_day_avg INTEGER,
    total_inpatient_beds_7_day_avg INTEGER,
    total_icu_beds_7_day_avg INTEGER,
    total_adult_staffed_icu_beds_7_day_avg INTEGER,
    total_icu_beds_used_7_day_avg INTEGER,
    total_staffed_adult_icu_beds_occupancy_7_day_avg INTEGER,
    total_staffed_adult_icu_patients_confirmed_covid_7_day_avg INTEGER,
    usa_states_id INTEGER NOT NULL REFERENCES usa_states(usa_states_id),
    usa_counties_id INTEGER NOT NULL REFERENCES usa_counties(usa_counties_id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    usa_hospitals_id INTEGER REFERENCES usa_hospitals(usa_hospitals_id)
);

CREATE INDEX idx_counties_state ON usa_counties(usa_states_id);
CREATE INDEX idx_raw_county_daily_state ON usa_raw_county_daily(usa_states_id);
CREATE INDEX idx_raw_county_daily_county ON usa_raw_county_daily(usa_counties_id);
CREATE INDEX idx_raw_county_daily_date ON usa_raw_county_daily(county_daily_totals_date);
CREATE INDEX idx_raw_state_daily_state ON usa_raw_state_daily(usa_states_id);
CREATE INDEX idx_raw_state_daily_date ON usa_raw_state_daily(state_daily_totals_date);
CREATE INDEX idx_raw_data_state ON usa_raw_data(usa_states_id);
CREATE INDEX idx_raw_data_county ON usa_raw_data(usa_counties_id);
CREATE INDEX idx_raw_data_date ON usa_raw_data(county_totals_date);
CREATE INDEX idx_raw_hospital_weekly_state ON usa_raw_hospital_weekly(usa_states_id);
CREATE INDEX idx_raw_hospital_weekly_date ON usa_raw_hospital_weekly(collection_week_date);
