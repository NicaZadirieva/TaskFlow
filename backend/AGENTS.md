# Backend guidance

Organize domain code into `schema.py`, `routes.py`, `service.py`, and `repository.py`. Keep request and response schemas in `schema.py`, HTTP handling in `routes.py`, business logic in `service.py`, and database queries in `repository.py`. Wire repositories and services through FastAPI `Depends`, following the existing domain patterns. Keep models in `models.py`.
