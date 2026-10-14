from pydantic import BaseModel, ConfigDict, Field


class CreateGithubLabelRequest(BaseModel):
    name: str

class CreateGithubLabelResponse(BaseModel):
    id: int

class GithubLabelOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    
class GithubLabelListOut(BaseModel):
    items: list[GithubLabelOut] = Field(default_factory=list)
