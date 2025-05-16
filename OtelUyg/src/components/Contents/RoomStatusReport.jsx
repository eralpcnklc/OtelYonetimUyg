import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, DatePicker, Select, Tag, Typography ,Spin} from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import updateLocale from "dayjs/plugin/updateLocale";
import nocodeApiService from "../../api/apiService";
import "dayjs/locale/tr";
import "./RoomStatusReport.css";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);
dayjs.extend(isBetween);
dayjs.extend(updateLocale);
dayjs.updateLocale("en", { weekStart: 1 });

const { Option } = Select;
const { Title } = Typography;

const RoomStatusReport = () => {
  const [roomData, setRoomData] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [reportType, setReportType] = useState("day");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState(true);

  const fetchRoomData = async () => {
    try {
      const data = await nocodeApiService.getAll();
      setRoomData(data.data);
      setLoading(false);
    } catch (error) {
      console.error("Veri çekme hatası:", error.message);
    }
  };

  useEffect(() => {
    fetchRoomData();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [selectedDate, reportType, roomData]);

  const filterRooms = () => {
    const start = getStartDate();
    const end = getEndDate();

    const result = roomData.map((room) => {
      const isOccupiedInRange =
        room.startDate &&
        room.finishDate &&
        dayjs(room.startDate).isBefore(end) &&
        dayjs(room.finishDate).isAfter(start);

      return {
        ...room,
        isOccupiedInSelectedRange: isOccupiedInRange,
      };
    });

    setFilteredRooms(result);
  };

  const getStartDate = () => {
    if (!selectedDate) return null;
    if (reportType === "day") return selectedDate.startOf("day");
    if (reportType === "week") return selectedDate.startOf("week");
    if (reportType === "month") return selectedDate.startOf("month");
    return selectedDate;
  };

  const getEndDate = () => {
    if (!selectedDate) return null;
    if (reportType === "day") return selectedDate.endOf("day");
    if (reportType === "week") return selectedDate.endOf("week");
    if (reportType === "month") return selectedDate.endOf("month");
    return selectedDate;
  };


  const occupiedCount = filteredRooms.filter(r => r.isOccupiedInSelectedRange).length;
  const emptyCount = filteredRooms.filter(r => !r.isOccupiedInSelectedRange).length;

  return (
    <div className="room-status-report">
      <Title level={3}>Oda Durum Raporu</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Select
            value={reportType}
            onChange={setReportType}
            style={{ width: "100%" }}
          >
            <Option value="day">Günlük</Option>
            <Option value="week">Haftalık</Option>
            <Option value="month">Aylık</Option>
          </Select>
        </Col>
        <Col span={8}>
          {reportType === "day" && (
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              format="YYYY-MM-DD"
              style={{ width: "100%" }}
            />
          )}
          {reportType === "week" && (
            <DatePicker
              picker="week"
              value={selectedDate}
              onChange={setSelectedDate}
              format="YYYY-[W]WW"
              style={{ width: "100%" }}
            />
          )}
          {reportType === "month" && (
            <DatePicker
              picker="month"
              value={selectedDate}
              onChange={setSelectedDate}
              format="YYYY-MM"
              style={{ width: "100%" }}
            />
          )}
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 32 }}>
        <Col span={12}>
          <Card>
            <Statistic
              title="Dolu Oda Sayısı"
              value={occupiedCount}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="Boş Oda Sayısı"
              value={emptyCount}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>
      <Spin spinning={loading} tip="Yükleniyor" size="large">
        <Row gutter={[16, 16]}>
          {filteredRooms.map((room, index) => (
            <Col xs={24} sm={24} md={12} lg={8} key={index}>
              <Card
                title={
                  <>
                    {room.roomName}{" "}
                    <Tag
                      color={room.isOccupiedInSelectedRange ? "red" : "green"}
                      style={{ marginLeft: 8 }}
                    >
                      {room.isOccupiedInSelectedRange ? "Dolu" : "Boş"}
                    </Tag>
                  </>
                }
                variant="bodered"
                hoverable
              >
                <p><strong>Büyüklük:</strong> {room.roomSize} m²</p>
                <p><strong>Kişi Sayısı:</strong> {room.personCount}</p>
                <p><strong>Fiyat:</strong> {room.roomPrice}₺</p>
                <p><strong>Özellikler:</strong> {room.roomFeatures}</p>
                <>
                  {room.isOccupiedInSelectedRange && (
                    <p><strong>Çıkış Tarihi:</strong> {dayjs(room.finishDate).format("YYYY-MM-DD")}</p>
                  )}
                </>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>
    </div>
  );
};

export default RoomStatusReport;
