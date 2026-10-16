from typing import Annotated

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.dialects.postgresql import insert

from app.github_label.models import GithubLabel, task_github_label
from app.shared.db import DbSessionDeps


class GithubLabelRepo:
    def __init__(self, db_session: DbSessionDeps):
        self.db_session = db_session

    async def save(self, tag: GithubLabel) -> GithubLabel:
        self.db_session.add(tag)
        await self.db_session.commit()
        await self.db_session.refresh(tag)
        return tag

    async def get_all(self, tenant_id: int) -> list[GithubLabel]:
        stmt = select(GithubLabel).where(GithubLabel.tenant_id == tenant_id)
        res = await self.db_session.execute(stmt)
        return list(res.scalars().all())

    async def get(self, name: str, tenant_id: int) -> GithubLabel | None:
        stmt = select(GithubLabel).where(
            GithubLabel.tenant_id == tenant_id,
            GithubLabel.name == name,
        )
        res = await self.db_session.execute(stmt)
        return res.scalar_one_or_none()

    async def attach_or_create(
        self,
        task_id: int,
        tenant_id: int,
        name: str,
    ) -> GithubLabel:
        """
        Привязывает GithubLabel к задаче по task_id.
        Если метки с таким name у tenant нет — создаёт её.
        """
        label = await self.get(name=name, tenant_id=tenant_id)

        if label is None:
            label = GithubLabel(
                tenant_id=tenant_id,
                name=name,
            )
            self.db_session.add(label)
            try:
                await self.db_session.flush()
            except IntegrityError:
                #  TODO: тест сделать на одновременное добавление
                # гонка: кто-то успел создать — перечитываем
                await self.db_session.rollback()
                label = await self.get(name=name, tenant_id=tenant_id)

        insert_stmt = (
            insert(task_github_label)
            .values(task_id=task_id, github_label_id=label.id)
            .on_conflict_do_nothing(
                index_elements=["task_id", "github_label_id"]
            )
        )
        await self.db_session.execute(insert_stmt)
        await self.db_session.commit()

        return label


def get_github_label_repository(db_session: DbSessionDeps):
    return GithubLabelRepo(db_session)


GithubLabelRepoDeps = Annotated[
    GithubLabelRepo, Depends(get_github_label_repository)
]
