"use client";

import { useState } from "react";
import { IProject } from "@/app/shared/interface/project.interface";


import changeProjectReq from "../api/change_project/change_project.req";

import { message } from "antd";
import { useRouter } from "next/navigation";
import DesktopProjectTable from './components/desktop/DesktopProjectTable';
import MobileProjectTable from './components/mobile/MobileProjectTable';
import ProjectEditor from './components/shared/ProjectEditor';
import { toProjectSchema } from '../../api/to_schema/to_project';


export default function ProjectTable({ projects }: { projects: IProject[] }) {
  const [editingRecord, setEditingRecord] = useState<IProject | null>(null);
  const router = useRouter();

  const onEdit = (record: IProject) => {
    setEditingRecord(record);
  };

  const onSave = async (project: IProject) => {
    // TODO: при необходимости добавьте нормализацию полей проекта
    // (например, сброс бюджета для определённого статуса)
    const normalized: IProject = project;

    try {
      await changeProjectReq(normalized.id, toProjectSchema(normalized));
      // TODO: заменить на React.Query или похожие средства next.js
      router.refresh();
      message.success("Обновление данных прошло успешно");
    } catch (e) {
      console.error("Ошибка обновления данных", e);
      message.error("Ошибка обновления данных");
    }
  };

  const onReset = () => setEditingRecord(null);

  return (
    <>
      <style>{`
        .project-table-desktop { display: none; }
        .project-table-mobile { display: block; }
        @media (min-width: 576px) {
          .project-table-desktop { display: block; }
          .project-table-mobile { display: none; }
        }
      `}</style>

      <DesktopProjectTable onEdit={onEdit} dataSource={projects} />

      <MobileProjectTable onEdit={onEdit} dataSource={projects} />

      {/* Модальное окно редактирования 
	  TODO: доступно только OWNER*/}
      <ProjectEditor
        onSave={onSave}
        editingRecord={editingRecord}
        onReset={onReset}
      />
    </>
  );
}