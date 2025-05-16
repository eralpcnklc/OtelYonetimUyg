import { Button, Form, Input, InputNumber, Row, Col, message } from "antd";
import "./AddRoom.css";
import TextArea from "antd/es/input/TextArea";
import nocodeApiService from "../../api/apiService";

const AddRoom = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const handleAddRoom = async (values) => {
    const { roomName, roomSize, personCount, roomPrice, roomFeatures } = values;

    const newRoomRow = [
      roomName,
      roomSize.toString(),
      personCount.toString(),
      roomPrice.toString(),
      roomFeatures,
      "", // checkInDate
      ""
    ];

    console.log("Yeni Oda (2D Array):", newRoomRow);

    try {
      await nocodeApiService.add(newRoomRow);
      messageApi.open({
        type: "success",
        content: "Oda başarıyla eklendi!",
      });
      form.resetFields();
    } catch (error) {
      console.error("Oda eklenirken hata oluştu:", error.message);
      messageApi.open({
        type: "error",
        content: "Oda eklenirken hata oluştu!",
      });
    }
  };

  return (
    <div className="form-container-outer">
      {contextHolder}
      <h1>Oda Ekle</h1>
      <Form form={form} layout="vertical" className="form-container-inner" onFinish={handleAddRoom}>
        
        {/* Oda Adı */}
        <Form.Item
          label="Oda Adı"
          name="roomName"
          rules={[{ required: true, message: "Oda adını giriniz!" }]}
        >
          <Input placeholder="Oda Adı" />
        </Form.Item>

        {/* Yan yana üçlü alan: Büyüklük - Kişi Sayısı - Fiyat */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Oda Büyüklüğü"
              name="roomSize"
              rules={[{ required: true, message: "Oda büyüklüğünü giriniz!" }]}
            >
              <InputNumber suffix="m²" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Kişi Sayısı"
              name="personCount"
              rules={[{ required: true, message: "Kişi sayısını giriniz!" }]}
            >
              <InputNumber min={1} max={10} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Oda Fiyatı"
              name="roomPrice"
              rules={[{ required: true, message: "Oda fiyatını giriniz!" }]}
            >
              <InputNumber suffix="₺" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        {/* Oda Özellikleri */}
        <Form.Item
          label="Oda Özellikleri"
          name="roomFeatures"
          rules={[{ required: true, message: "Oda özelliklerini giriniz!" }]}
        >
          <TextArea
            autoSize={{ minRows: 4, maxRows: 6 }}
            placeholder="Örnek: 2 adet tek kişilik yatak, klima, TV, banyo"
          />
        </Form.Item>

        {/* Buton */}
        <Form.Item className="add-room-button">
          <Button type="default" htmlType="submit">
            Oda Ekle
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddRoom;
