import React, { useEffect, useState } from "react";
import { Button, Card, Input, InputNumber, Space, Form, message, Spin } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import nocodeApiService from "../../api/apiService";

const ShowRooms = () => {
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true); // Spinner'ı başlat
      const response = await nocodeApiService.getAll();
      setData(response.data);
    } catch (error) {
      console.error("Veri çekme hatası:", error.message);
    } finally {
      setLoading(false); // İşlem bitince spinner'ı durdur
    }
  };

  const handleDelete = async (rowId) => {
    try {
      await nocodeApiService.delete(rowId);
      messageApi.open({
        type: 'success',
        content: 'Oda başarıyla silindi!',
      });
      setData((prevData) => prevData.filter((room) => room.row_id !== rowId));
    } catch (err) {
      console.error("Silme hatası:", err.message);
      messageApi.open({
        type: 'error',
        content: 'Oda silinirken hata oluştu!',
      });
    }
  };

  const handleEdit = (room) => {
    setEditId(room.row_id);
    editForm.setFieldsValue({
      roomName: room.roomName,
      roomSize: Number(room.roomSize),
      personCount: Number(room.personCount),
      roomPrice: Number(room.roomPrice),
      roomFeatures: room.roomFeatures,
    });
  };

  const handleEditFinish = async (values) => {
    const updatedRoom = {
      row_id: editId,
      roomName: values.roomName,
      roomSize: values.roomSize,
      personCount: values.personCount,
      roomPrice: values.roomPrice,
      roomFeatures: values.roomFeatures,
    };

    try {
      await nocodeApiService.update(updatedRoom);
      messageApi.open({
        type: 'success',
        content: 'Oda başarıyla güncellendi!',
      });
      setEditId(null);
      await fetchRooms();
    } catch (err) {
      console.error("Güncelleme hatası:", err.message);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      <Spin spinning={loading} tip="Yükleniyor..." size="large">
        <Space direction="horizontal" size={16} wrap>
          {data.map((room) => (
            <Card key={room.row_id} title={room.roomName} style={{ width: 300 }}>
              {editId === room.row_id ? (
                <Form form={editForm} onFinish={handleEditFinish} layout="vertical">
                  <Form.Item name="roomName" label="Oda Adı" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="roomSize" label="Oda Büyüklüğü" rules={[{ required: true }]}>
                    <InputNumber min={1} />
                  </Form.Item>
                  <Form.Item name="personCount" label="Kişi Sayısı" rules={[{ required: true }]}>
                    <InputNumber min={1} />
                  </Form.Item>
                  <Form.Item name="roomPrice" label="Oda Fiyatı" rules={[{ required: true }]}>
                    <InputNumber min={0} />
                  </Form.Item>
                  <Form.Item name="roomFeatures" label="Oda Özellikleri" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">Kaydet</Button>
                    <Button onClick={() => setEditId(null)} style={{ marginLeft: 8 }}>
                      İptal
                    </Button>
                  </Form.Item>
                </Form>
              ) : (
                <>
                  <p>Oda Büyüklüğü: {room.roomSize} m²</p>
                  <p>Kişi Sayısı: {room.personCount}</p>
                  <p>Oda Fiyatı: {room.roomPrice} ₺</p>
                  <p>Oda Özellikleri: {room.roomFeatures}</p>
                  <Button
                    icon={<EditOutlined />}
                    style={{ marginRight: 8 }}
                    onClick={() => handleEdit(room)}
                  >
                    Düzenle
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(room.row_id)}
                  >
                    Sil
                  </Button>
                </>
              )}
            </Card>
          ))}
        </Space>
      </Spin>
    </div>
  );
};

export default ShowRooms;
