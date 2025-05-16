import React, { useState, useEffect } from 'react';
import {
  DatePicker,
  InputNumber,
  Button,
  List,
  Card,
  Typography,
  message,
  Input,
  Modal,
  Form,
} from 'antd';
import dayjs from 'dayjs';
import nocodeApiService from "../../api/apiService";
import nocodeApiServiceCustomers from '../../api/apiServiseCustomers';

const { RangePicker } = DatePicker;
const { Title } = Typography;

const Reservation = () => {
  const [dateRange, setDateRange] = useState([]);
  const [guestCount, setGuestCount] = useState(1);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility
  const [guestDetails, setGuestDetails] = useState([]);
  const [form] = Form.useForm();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();


  useEffect(() => {
    fetchRoomData();
  }, []);


  const fetchRoomData = async () => {
    try {
      const response = await nocodeApiService.getAll();
      setAllRooms(response.data);
    } catch (error) {
      message.error("Oda verileri alınamadı!");
      console.error("API Hatası:", error);
    }
  };

  const handleFilter = () => {
    if (dateRange.length !== 2) {
      message.warning('Lütfen giriş ve çıkış tarihlerini seçin.');
      return;
    }

    const [checkIn, checkOut] = dateRange;
    const userStart = dayjs(checkIn);
    const userEnd = dayjs(checkOut);

    const availableRooms = allRooms.filter((room) => {
      if (guestCount > room.personCount) return false;

      const reservedStart = room.startDate ? dayjs(room.startDate) : null;
      const reservedEnd = room.finishDate ? dayjs(room.finishDate) : null;

      // Eğer hiç rezervasyon yoksa oda boştur
      if (!reservedStart || !reservedEnd) return true;

      // Çakışma yoksa oda müsaittir
      return userEnd.isBefore(reservedStart, 'day') || userStart.isAfter(reservedEnd, 'day');
    });

    setFilteredRooms(availableRooms);
  };

  const handleBookingClick = (room) => {
    const guestInputs = [];
    for (let i = 0; i < guestCount; i++) {
      guestInputs.push({ name: `guest-${i + 1}`, surname: `surname-${i + 1}`, tc: `tc-${i + 1}` });
    }
    setGuestDetails(guestInputs);
    setSelectedRoom(room); // Seçilen odayı burada set et
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      // Odanın rowId'si kullanılacak
      const MusteriOda = selectedRoom?.row_id; // Oda rowId'si

      for (let i = 0; i < guestCount; i++) {
        const MusteriAd = values[`guest-${i}-name`];
        const MusteriSoyad = values[`guest-${i}-surname`];
        const MusteriTC = values[`guest-${i}-tc`];

        const row = [
          MusteriOda,                             // MusteriOda: oda rowId’si
          MusteriAd,                                   // MusteriAd
          MusteriSoyad,                                // MusteriSoyad
          MusteriTC,                                     // MusteriTC// Çıkış tarihi
        ];
        const updatedRoom = {
          row_id: selectedRoom.row_id,
          roomName: selectedRoom.roomName,
          roomSize: selectedRoom.roomSize,
          personCount: selectedRoom.personCount,
          roomPrice: selectedRoom.roomPrice,
          roomFeatures: selectedRoom.roomFeatures,
          startDate: dateRange[0].format('YYYY-MM-DD'), // Giriş tarihi
          finishDate: dateRange[1].format('YYYY-MM-DD'),
        };
        await nocodeApiService.update(updatedRoom); // Oda bilgilerini güncelle    // Çıkış tarihi};
        console.log("Yeni Misafir (2D Array):", row); // Debug
        await nocodeApiServiceCustomers.add(row);

        messageApi.open({
          type: 'success',
          content: 'Rezervasyon başarıyla tamamlandı!',
        });
        // API’ye tek tek gönder
      }

      setIsModalVisible(false);
      form.resetFields();
      setGuestDetails([]);
      setSelectedRoom(null); // Temizle
    } catch (error) {
      console.error("Hata:", error);
      message.error("Lütfen tüm alanları doğru doldurduğunuzdan emin olun.");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false); // Close the modal without submitting
  };

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      <Title level={3}>Rezervasyon Yap</Title>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
        <RangePicker
          onChange={(values) => setDateRange(values)}
          disabledDate={(current) => current && current < dayjs().startOf('day')}
        />

        <InputNumber
          min={1}
          max={10}
          defaultValue={1}
          onChange={(value) => setGuestCount(value)}
          placeholder="Kişi Sayısı"
        />

        <Button type="primary" onClick={handleFilter}>
          Filtrele
        </Button>
      </div>

      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={filteredRooms}
        locale={{ emptyText: 'Uygun oda bulunamadı.' }}
        renderItem={(room) => {
          const [checkIn, checkOut] = dateRange;
          const days = checkIn && checkOut ? dayjs(checkOut).diff(dayjs(checkIn), 'day') : 0;
          const totalPrice = days * room.roomPrice;

          return (
            <List.Item>
              <Card title={`Oda: ${room.roomName}`}>
                <p>Büyüklük: {room.roomSize} m²</p>
                <p>Kapasite: {room.personCount} kişi</p>
                <p>Günlük Fiyat: ₺{room.roomPrice}</p>
                <p>Özellikler: {room.roomFeatures}</p>
                {days > 0 && (
                  <p>
                    {days} gece x ₺{room.roomPrice} ={' '}
                    <strong>₺{totalPrice.toLocaleString()}</strong>
                  </p>
                )}
                <Button
                  type="primary"
                  onClick={() => handleBookingClick(room)}
                  disabled={guestCount > room.personCount}
                >
                  Rezervasyon Yap
                </Button>
              </Card>
            </List.Item>
          );
        }}
      />

      {/* Modal for booking */}
      <Modal
        title="Misafir Bilgilerini Girin"
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="back" onClick={handleModalCancel}>
            Vazgeç
          </Button>,
          <Button
            key="submit"
            type="primary"
            htmlType="submit"
            form="guestForm" // Specify the form for submission
          >
            Rezervasyonu Tamamla
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="guestForm" // Give the form an ID
          onFinish={handleModalOk} // Trigger when form is valid
          onFinishFailed={() => message.error("Lütfen tüm alanları doldurduğunuzdan emin olun.")}
        >
          {guestDetails.map((guest, index) => (
            <div key={index} style={{ marginBottom: 16 }}>
              <Title level={4}>Misafir {index + 1}</Title>
              <Form.Item
                name={`guest-${index}-name`}
                rules={[{ required: true, message: "Misafir adını giriniz!" }]}
              >
                <Input placeholder={`Misafir ${index + 1} Adı`} />
              </Form.Item>
              <Form.Item
                name={`guest-${index}-surname`}
                rules={[{ required: true, message: "Misafir soyadını giriniz!" }]}
              >
                <Input placeholder={`Misafir ${index + 1} Soyadı`} />
              </Form.Item>
              <Form.Item
                name={`guest-${index}-tc`}
                rules={[{ required: true, message: "Misafir TC numarasını giriniz!" }]}
              >
                <Input placeholder={`Misafir ${index + 1} TC No`} />
              </Form.Item>
            </div>
          ))}
        </Form>
      </Modal>
    </div>
  );
};

export default Reservation;
