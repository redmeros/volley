BEGIN;
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(255) NOT NULL UNIQUE,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_users_username" ON "users" ("username");
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");

CREATE TABLE IF NOT EXISTS "tournament" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "created_by" INTEGER REFERENCES "users" ("id") ON DELETE SET NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_tournament_name" ON "tournament" ("name");

CREATE TABLE IF NOT EXISTS "teams" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "tournament_id" INTEGER REFERENCES "tournament" ("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_teams_name" ON "teams" ("name");


CREATE TABLE IF NOT EXISTS "court" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "location" VARCHAR(255),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_court_name" ON "court" ("name");

CREATE TABLE IF NOT EXISTS "matches" (
    "id" SERIAL PRIMARY KEY,
    "tournament_id" INTEGER REFERENCES "tournament" ("id") ON DELETE CASCADE,
    "team_a_id" INTEGER REFERENCES "teams" ("id") ON DELETE SET NULL,
    "team_b_id" INTEGER REFERENCES "teams" ("id") ON DELETE SET NULL,
    "match_date" TIMESTAMP NOT NULL,
    "score_team_a" INTEGER DEFAULT 0,
    "score_team_b" INTEGER DEFAULT 0,
    "status" VARCHAR(50) DEFAULT 'scheduled',
    "court_id" INTEGER REFERENCES "court" ("id") ON DELETE SET NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_matches_tournament_id" ON "matches" ("tournament_id");
CREATE INDEX IF NOT EXISTS "idx_matches_team_a_id" ON "matches" ("team_a_id");
CREATE INDEX IF NOT EXISTS "idx_matches_team_b_id" ON "matches" ("team_b_id");
CREATE INDEX IF NOT EXISTS "idx_matches_court_id" ON "matches" ("court_id");

CREATE TABLE IF NOT EXISTS "match_results" (
    "id" SERIAL PRIMARY KEY,
    "match_id" INTEGER REFERENCES "matches" ("id") ON DELETE CASCADE,
    "team_a_score" INTEGER NOT NULL,
    "team_b_score" INTEGER NOT NULL,
    "winner_team_id" INTEGER REFERENCES "teams" ("id") ON DELETE SET NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;