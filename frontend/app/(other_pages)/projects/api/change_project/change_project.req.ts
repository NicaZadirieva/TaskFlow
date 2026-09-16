import isMockEnabled from "@/app/shared/utils/isMockEnabled";

import { Project } from "@/app/shared/schema/project.types";
import changeProjectReqMock from "./change_project.req.mock";
import changeProjectReqReal from "./change_project.req.real";

export default async function changeProjectReq(
  projectId: number,
  newProject: Project,
) {
  if (isMockEnabled()) {
    return await changeProjectReqMock(projectId, newProject);
  }
  return await changeProjectReqReal(projectId, newProject);
}
