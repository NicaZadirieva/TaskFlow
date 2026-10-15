"use client";

import { createUserDto } from '@/api/mappers';
import changeUserReq from '@/api/requests/user/change_user/change_user.req';
import { TenantRole, User } from '@/entities/user.interface';
import { message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import UserEditor from "../../features/UserEditor";
import DesktopUserTable from "./components/desktop";
import MobileUserTable from "./components/mobile";

export default function UserTable({ users }: { users: User[] }) {
  const [editingRecord, setEditingRecord] = useState<User | null>(null);
  const router = useRouter();
  const onEdit = (record: User) => {
    setEditingRecord(record);
  };

  const onSave = async (user: User) => {
    // Если роль — клиент, сбрасываем стоимость часа
    const normalized: User =
      user.role === TenantRole.CLIENT
        ? { ...user, hourly_rate: undefined }
        : user;
    try {
      await changeUserReq(normalized.id, createUserDto(normalized));
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
