"use client";

import { useState } from "react";
import { IUser, TenantRole } from "../../../shared/interface/user.interface";
import DesktopUserTable from "./components/desktop/DesktopUserTable";
import MobileUserTable from "./components/mobile/MobileUserTable";
import UserEditor from "./components/shared/UserEditor";
import changeUserReq from "../api/change_user/change_user.req";
import { toNewUserSchema, toUserSchema } from "../../api/to_schema/to_user";
import { Button, message, Space } from "antd";
import { useRouter } from "next/navigation";
import UserAdditor from "../new/components/UserAdditor";
import createUserReq from "../api/create_user/create_user.req";

export default function UserTable({ users }: { users: IUser[] }) {
  const [editingRecord, setEditingRecord] = useState<IUser | null>(null);
  const [isAdding, setIsAdding] = useState(false);
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
