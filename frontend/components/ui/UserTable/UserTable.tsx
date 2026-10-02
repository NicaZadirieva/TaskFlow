"use client";

import { toUserSchema } from '@/api/mappers/from_entities/user';
import changeUserReq from '@/api/requests/user/change_user/change_user.req';
import { IUser, TenantRole } from '@/entities/user.interface';
import { message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DesktopUserTable from "./components/desktop/DesktopUserTable";
import MobileUserTable from "./components/mobile/MobileUserTable";
import UserEditor from "./components/shared/UserEditor";

export default function UserTable({ users }: { users: IUser[] }) {
  const [editingRecord, setEditingRecord] = useState<IUser | null>(null);
  const router = useRouter();
  const onEdit = (record: IUser) => {
    setEditingRecord(record);
  };

  const onSave = async (user: IUser) => {
    // Если роль — клиент, сбрасываем стоимость часа
    const normalized: IUser =
      user.role === TenantRole.CLIENT
        ? { ...user, hourly_rate: undefined }
        : user;
    try {
      await changeUserReq(normalized.id, toUserSchema(normalized));
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
        .user-table-desktop { display: none; }
        .user-table-mobile { display: block; }
        @media (min-width: 576px) {
          .user-table-desktop { display: block; }
          .user-table-mobile { display: none; }
        }
      `}</style>

      <DesktopUserTable onEdit={onEdit} dataSource={users} />

      <MobileUserTable onEdit={onEdit} dataSource={users} />

      {/* Модальное окно редактирования 
	  TODO: доступно только OWNER*/}
      <UserEditor
        onSave={onSave}
        editingRecord={editingRecord}
        onReset={onReset}
      />
    </>
  );
}
