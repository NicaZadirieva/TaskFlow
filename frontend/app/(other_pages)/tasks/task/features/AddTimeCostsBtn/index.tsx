import { Button } from "antd";

export default function AddTimeCostsBtn({ onClick }: { onClick: () => void }) {
  return (
    <Button key="log" type="link" data-stop-card-click onClick={onClick}>
      Изменить свои часы
    </Button>
  );
}
