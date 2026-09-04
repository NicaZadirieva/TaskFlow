from datetime import datetime, timedelta

from app.db.entities.assigned_task import AssignedTask
from app.db.entities.project import Project, Status
from app.db.entities.task import Priority, Task
from app.db.entities.tenant import Tenant
from app.db.entities.user import TenantRole, User


async def seed_freelance_data(session):
    # 1. Создаём тенант (клиент)
    client_tenant = Tenant(name="ООО Ромашка", slug="romashka")
    session.add(client_tenant)
    await session.flush()  # чтобы получить client_tenant.id

    # 2. Создаём пользователей: владелец (ты) и клиент
    freelancer = User(
        tenant_id=client_tenant.id,
        role=TenantRole.OWNER,
        name="Анна Фрилансер",
        email="anna@example.com",
        password_hash="fake_hash_123",
    )
    client = User(
        tenant_id=client_tenant.id,
        role=TenantRole.CLIENT,
        name="Иван Клиент",
        email="ivan@romashka.ru",
        password_hash="fake_hash_456",
    )
    session.add_all([freelancer, client])
    await session.flush()

    # 3. Проект внутри тенанта
    project = Project(
        tenant_id=client_tenant.id,
        name="Верстка лендинга",
        description="Лендинг для промоакции",
        status=Status.IN_PROGRESS,
        budget_cents=150000,  # 1500 руб
        deadline=datetime.now() + timedelta(days=7),
    )
    session.add(project)
    await session.flush()

    # 4. Задача внутри проекта
    task = Task(
        tenant_id=client_tenant.id,
        project_id=project.id,
        title="Сверстать секцию Hero",
        description="Мобильная и десктопная версия, адаптив, без JS",
        status=Status.IN_PROGRESS,
        priority=Priority.HIGH,
        due_date=datetime.now() + timedelta(days=2),
        estimated_hours=4.0,
        created_by=freelancer.id,
    )
    session.add(task)
    await session.flush()

    # 5. Назначаем пользователей на задачу
    assignment_executor = AssignedTask(
        tenant_id=client_tenant.id,
        user_id=freelancer.id,
        task_id=task.id,
        role_in_task="executor",
        is_active=True,
    )
    assignment_reviewer = AssignedTask(
        tenant_id=client_tenant.id,
        user_id=client.id,
        task_id=task.id,
        role_in_task="reviewer",
        is_active=True,
    )
    session.add_all([assignment_executor, assignment_reviewer])

    await session.commit()

    return client_tenant, freelancer, client, project, task
