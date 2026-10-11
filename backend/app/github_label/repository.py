from typing import Annotated

from fastapi import Depends
from sqlalchemy import select

from app.github_label.models import GithubLabel
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
        stmt = select(GithubLabel).where(GithubLabel.tenant_id == tenant_id, GithubLabel.name == name)
        res = await self.db_session.execute(stmt)
        return res.scalar_one_or_none()


def get_github_label_repository(db_session: DbSessionDeps):
    return GithubLabelRepo(db_session)

GithubLabelRepoDeps = Annotated[GithubLabelRepo, Depends(get_github_label_repository)]
