from pydantic import BaseModel, ConfigDict, Field


class CreateGithubLabelRequest(BaseModel):
    name: str
    description: str | None = None

class CreateGithubLabelResponse(BaseModel):
    id: int

class GithubLabelOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    description: str | None = None
    
class GithubLabelListOut(BaseModel):
    items: list[GithubLabelOut] = Field(default_factory=list)
