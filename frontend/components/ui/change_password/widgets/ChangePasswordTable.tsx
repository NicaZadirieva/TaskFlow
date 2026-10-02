"use client";

import {
    Button,
} from "antd";
import { useState } from "react";

import { IUser } from '@/entities/user.interface';
import DesktopUserTable from './components/desktop/DesktopUserTable';
import MobileUserTable from './components/mobile/MobileUserTable';
import ChangePasswordModel from './components/shared/ChangePasswordModal';

export default function ChangePasswordTable({users}: {users: IUser[]}) {
  const [dataSource] = useState<IUser[]>(users);
  const [selectedKey, setSelectedKey] = useState<React.Key | null>(null);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const selectedUser = dataSource.find((u) => u.id === selectedKey) ?? null;

  const openPasswordModal = () => {
    if (!selectedUser) return;
    setModalOpen(true);
  };

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

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 12,
        }}
      >
        <Button
          type="primary"
          disabled={!selectedUser}
          onClick={openPasswordModal}
        >
          Изменить пароль
          {selectedUser ? ` (${selectedUser.name})` : ""}
        </Button>
      </div>

      <DesktopUserTable dataSource={dataSource} onChooseRow={(row: IUser) => setSelectedKey(row.id)}/>

      <MobileUserTable dataSource={dataSource} selectUser={(row: IUser) => setSelectedKey(row.id)} selectedUser={selectedUser}/>

      <ChangePasswordModel selectedUser={selectedUser} hideModal={() => setModalOpen(false)} isOpen={isModalOpen}/>
      
    </>
  );
}