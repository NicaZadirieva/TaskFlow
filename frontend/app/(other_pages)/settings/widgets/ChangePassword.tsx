"use client";

import { useState } from "react";
import {
  Button,
} from "antd";

import { IUser } from '@/app/shared/interface/user.interface';
import { usersMockData } from '../../users/mock-data/users';
import DesktopUserTable from './components/desktop/DesktopUserTable';
import MobileUserTable from './components/mobile/MobileUserTable';
import ChangePasswordModel from './components/shared/ChangePasswordModal';

export default function ChangePasswordTable() {
  const [dataSource] = useState<IUser[]>(usersMockData);
  const [selectedKey, setSelectedKey] = useState<React.Key | null>(null);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const selectedUser = dataSource.find((u) => u.key === selectedKey) ?? null;

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

      <DesktopUserTable dataSource={dataSource} onChooseRow={(row: IUser) => setSelectedKey(row.key)}/>

      <MobileUserTable dataSource={dataSource} selectUser={(row: IUser) => setSelectedKey(row.key)} selectedUser={selectedUser}/>

      <ChangePasswordModel selectedUser={selectedUser} hideModal={() => setModalOpen(false)} isOpen={isModalOpen}/>
      
    </>
  );
}