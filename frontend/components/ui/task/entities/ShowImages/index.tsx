import { Image, Modal, Typography } from 'antd';
const { Text } = Typography;

export default function ShowImages({isOpen, onClose, imageUrls}: {isOpen: boolean, onClose: () => void, imageUrls: string[]}) {
	return (
		<Modal
        title="Изображения задачи"
        OPEN={isOpen}
        onCancel={onClose}
        footer={null}
        width={800}
        centered
        destroyOnHidden
      >
        {imageUrls.length > 0 ? (
          <Image.PreviewGroup>
            <div>
              {imageUrls.map((src, idx) => (
                <Image
                  key={idx}
                  src={src}
                  alt={`Изображение ${idx + 1}`}
                  width="100%"
                />
              ))}
            </div>
          </Image.PreviewGroup>
        ) : (
          <Text type="secondary">Изображений нет</Text>
        )}
      </Modal>
	)
}