DB_DSN ?= postgres://myuser:mypassword@localhost:5432/mydatabase?sslmode=disable

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  db-migrate  Run database migrations"
	@echo "  help        Show this help message"
	
.PHONY: db-migrate
db-migrate:
	@echo "Running database migrations..."
	psql "$(DB_DSN)" -f migrations/001_initial.sql
