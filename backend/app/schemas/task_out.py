from datetime import datetime

from pydantic import BaseModel, ConfigDict, computed_field
from pydantic.alias_generators import to_camel


class TaskOut(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )

    estimated_hours: float | None
    actual_hours: float | None
    due_date: datetime | None

    @computed_field
    @property
    def ratio(self) -> float | None:
        if self.estimated_hours and self.actual_hours is not None:
            return self.actual_hours / self.estimated_hours
        return None

    @computed_field
    @property
    def overdue_days(self) -> int:
        if self.due_date and self.due_date < datetime.now():
            return (datetime.now() - self.due_date).days
        return 0
