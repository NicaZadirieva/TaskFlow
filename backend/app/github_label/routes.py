from typing import Annotated

from fastapi import APIRouter, Depends, Query


from app.github_label.schemas import CreateGithubLabelRequest, CreateGithubLabelResponse, GithubLabelListOut, GithubLabelOut
from app.github_label.service import GithubLabelServiceDeps
from app.user.current_user import CurrentUserDeps

router = APIRouter(prefix="/v1/tag", tags=["Tags"])


@router.post(
    "/create",
    response_model=CreateGithubLabelResponse,
    status_code=201,
    summary="Создать тег для текущего тенанта",
)
async def create_tag(
    dto: CreateGithubLabelRequest,
    service: GithubLabelServiceDeps,
    user: CurrentUserDeps,
) -> CreateGithubLabelResponse:
    tag = await service.create(
        tenant_id=user.tenant_id,
        dto=dto,
    )
    return CreateGithubLabelResponse(id=tag.id)


@router.get(
    "/all",
    response_model=GithubLabelListOut,
    summary="Список всех тегов",
)
async def list_all_tags(
    service: GithubLabelServiceDeps,
    user: CurrentUserDeps
) -> GithubLabelListOut:
    tags = await service.get_all(
        tenant_id=user.tenant_id
    )
    return GithubLabelListOut(
        items=[GithubLabelOut.model_validate(tag) for tag in tags]
    )
