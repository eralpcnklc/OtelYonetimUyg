import React from "react";
import { Button, Form, Input, message } from "antd";
import "./Login.css";
import nocodeApiServiceUsers from "../../api/apiServiceUsers";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const errorMessage = () => {
    messageApi.open({
      type: "error",
      content: "Kullanıcı adı veya şifre yanlış.",
    });
  };
  const logIn = async (values) => {
    const { username, password } = values;
    try {
      const users = await nocodeApiServiceUsers.search(username);
      console.log(users);
      const user = users.data[0]; // İlk kullanıcıyı alıyoruz
      console.log(user);
      if (user === undefined) {
        errorMessage();
      } else {
        if (user.userPassword === password) {
          localStorage.setItem("username", username);
          localStorage.setItem("password", password);
          navigate("/MainPage");
        } else {
          errorMessage();
          console.log("gasdada");
        }
      }
    } catch (error) {
      console.error("Giriş hatası:", error);
      alert("Bir hata oluştu. Lütfen tekrar deneyiniz.");
    }
  };

  return (
    <div>
      {contextHolder}
      
      <div className="login-container">
        
        <Form
          className="login-form"
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          autoComplete="off"
          onFinish={logIn}
        >
          <div className="pushright">Kullanıcı Adı</div>
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Lütfen kullanıcı adınızı giriniz!" }]}
          >
            <Input placeholder="Kullanıcı Adı" />
          </Form.Item>
          <div className="pushright">Şifre</div>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Lütfen şifrenizi giriniz!" }]}
          >
            <Input.Password placeholder="Şifre" />
          </Form.Item>

          <Form.Item>
            <Button className="form-button" type="primary" htmlType="submit">
              Giriş Yap
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>

  );
};

export default Login;
