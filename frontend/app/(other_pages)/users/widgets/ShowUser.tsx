"use client";

import { useState } from "react";
import { IUser } from '../../../shared/interface/user.interface';
import { usersMockData } from '../mock-data/users';
import DesktopUserTable from './components/desktop/DesktopUserTable';
import MobileUserTable from './components/mobile/MobileUserTable';
import UserEditor from './components/shared/UserEditor';
import { UserRoleEnum } from '@/app/shared/userRoleEnum';


export default function UserTable() {
  const [dataSource, setDataSource] = useState<IUser[]>(usersMockData);
  const [editingRecord, setEditingRecord] = useState<IUser | null>(null);

  const onEdit = (record: IUser) => {
    setEditingRecord(record);
  };

  const onSave = (user: IUser) => {
    // Если роль — клиент, сбрасываем стоимость часа
      const normalized: Partial<IUser> =
        user.role === UserRoleEnum.CLIENT
          ? { ...user, hourly_rate: undefined }
          : user;

      setDataSource((prev) =>
        prev.map((item: IUser) =>
          item.key === editingRecord?.key ? { ...item, ...normalized } : item,
        ),
      );
  }

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

      <DesktopUserTable onEdit={onEdit} dataSource={dataSource}/>

      <MobileUserTable onEdit={onEdit} dataSource={dataSource}/>

      {/* Модальное окно редактирования 
	  TODO: доступно только OWNER*/}
      <UserEditor onSave={onSave} editingRecord={editingRecord} onReset={onReset}/>
    </>
  );
}
