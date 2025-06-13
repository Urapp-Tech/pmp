.PHONY: start migrate makemig rollback current history

# Start the FastAPI app with Docker
dev:
	docker-compose up --build

start:
	docker-compose up --build

rebuild:
	docker-compose build

up:
	docker-compose up -d

rebuild_up:
	make rebuild
	make up

# Create Alembic migration (example: make migration name=initial)
migration:
	docker-compose exec api alembic revision --autogenerate -m "$(name)"

# Apply all migrations up to head
migrate:
	docker-compose exec api alembic upgrade head

# usage = make alter-migration m='your message here'
alter-migration:
	@if not defined m ( \
		echo ❌ Please provide a migration message using: make alter-migration m="your message here" & \
		exit /b 1 \
	) else ( \
		docker-compose exec api alembic revision --autogenerate -m "$(m)" \
	)
	
# Seed roles and permissions
seed:
	docker-compose exec api python -m app.db.seed

# Rollback migrations by one step (or specify steps with 'steps' variable)
rollback:
ifndef steps
	$(error Please provide steps to downgrade. Example: make rollback steps=1)
endif
	docker-compose exec api alembic downgrade -$(steps)

# Rollback to a specific revision
rollback-to:
ifndef rev
	$(error Please provide revision ID. Example: make rollback-to rev=d16578fe52ee)
endif
	docker-compose exec api alembic downgrade $(rev)

# Rollback to base (no migrations applied)
rollback-base:
	docker-compose exec api alembic downgrade base

# Show current applied migration version
current:
	docker-compose exec api alembic current

# Show migration history
history:
	docker-compose exec api alembic history

# Stop the FastAPI app with Docker
stop:
	docker-compose down

resetdb:
	docker-compose exec api bash -c "alembic downgrade base"
