from typing import Annotated

from fastapi import Depends

from app.github_label.models import GithubLabel
from app.github_label.repository import GithubLabelRepoDeps
from app.github_label.schemas import CreateGithubLabelRequest


class GithubLabelService:
    def __init__(self, github_label_repo: GithubLabelRepoDeps):
        self.github_label_repo = github_label_repo
        
    async def create(self, tenant_id: int, dto: CreateGithubLabelRequest):
        github_label = await self.github_label_repo.get(name=dto.name, tenant_id=tenant_id)
        if github_label is not None:
            raise ValueError("Github label already exists")
        new_github_label = GithubLabel(
            name=dto.name,
            tenant_id=dto.tenant_id,
            description=dto.description
        )
        return await self.github_label_repo.save(new_github_label)
    
    async def get_all(self, tenant_id: int) -> list[GithubLabel]:
        return await self.github_label_repo.get_all(tenant_id=tenant_id)

def get_github_label_service(github_label_repo: GithubLabelRepoDeps):
    return GithubLabelService(github_label_repo=github_label_repo)
    
GithubLabelServiceDeps = Annotated[GithubLabelService, Depends(get_github_label_service)]
