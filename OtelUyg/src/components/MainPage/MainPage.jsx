import React, { use, useState } from 'react';
import './MainPage.css';
import {
  PieChartOutlined,
  SettingOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
  ReadOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button } from 'antd';
import ShowRooms from '../Contents/ShowRooms';
import RoomSettings from '../Contents/AddRoom';
import Reservation from '../Contents/Reservation';
import RoomStatusReport from '../Contents/RoomStatusReport';
import { useNavigate } from "react-router-dom"; 



const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}
const items = [
  getItem('Oda Ekle', '1', <SettingOutlined />),
  getItem('Odaları Görüntüle', '2', <UnorderedListOutlined />),
  getItem('Rezervasyon', '6', <ReadOutlined />),
  getItem('Raporalar', '3', <PieChartOutlined />),
];
const MainPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenuKey, setSelectedMenuKey] = useState('1');
  const navigate = useNavigate();
  const logOut = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    navigate("/");
  }

  return (
    <Layout style={{ minHeight: '95vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items}
          onClick={({ key }) => setSelectedMenuKey(key)} />
      </Sider>
      <Layout>
        <Header>
          <div className='button-container'>
            <Button type='primary' danger ghost icon={<LogoutOutlined />} onClick={logOut} iconPosition='position'>Çıkış Yap </Button>
          </div>
        </Header>
        <Content style={{ margin: '20px 16px', minHeight: '85vh' }}>
          {selectedMenuKey === '1' && <RoomSettings />}
          {selectedMenuKey === '2' && <ShowRooms />}
          {selectedMenuKey === '6' && <Reservation />}
          {selectedMenuKey === '3' && <RoomStatusReport />}
          
        </Content>
      </Layout>
    </Layout>
  );
};
export default MainPage;