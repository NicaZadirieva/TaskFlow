'use client';
import { createUserDto } from '@/api/mappers';
import { changeHourlyRateReq } from "@/api/requests";
import { IUser } from "@/entities/user.interface";
import { Button, Form, InputNumber, message } from "antd";



interface HourlyRateFormValues {
  hourlyRate: number;
}

export default function ChangeHourlyRateForm({
  currentUser
}: {
  currentUser: IUser | null
}) {
  const [form] = Form.useForm<HourlyRateFormValues>();

  const handleChangeHourlyRate = async (values: HourlyRateFormValues) => {
    try {
      if (!currentUser) return;

      const response = await changeHourlyRateReq(
        createUserDto(currentUser),
        values.hourlyRate,
      );

      if (response.success) {
        message.success('Ставка успешно изменена');
      } else {
        message.error('Ошибка при изменении ставки');
      }
    } catch (error) {
      console.error('Ошибка изменения ставки:', error);
      message.error('Произошла ошибка при изменении ставки');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        hourlyRate: currentUser?.hourly_rate ?? 0,
      }}
      onFinish={handleChangeHourlyRate}
    >
      <Form.Item
        name="hourlyRate"
        label="Почасовая ставка"
        rules={[
          { required: true, message: 'Введите почасовую ставку' },
          {
            type: 'number',
            min: 0,
            message: 'Ставка должна быть неотрицательным числом',
          },
        ]}
      >
        <InputNumber
          min={0}
          step={0.01}
          precision={0}
          style={{ width: '300px' }}
          placeholder="Введите ставку"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Сохранить
        </Button>
      </Form.Item>
    </Form>
  );
}