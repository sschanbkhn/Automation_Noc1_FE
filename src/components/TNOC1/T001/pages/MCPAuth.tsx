import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import './MCPAuth.css';

interface MCPAuthProps {
  onSuccess?: () => void;
}

const MCPAuth: React.FC<MCPAuthProps> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Gửi POST request đến backend để xác thực MCP và lấy token
      const response = await fetch('http://10.155.43.200:8001/api/v1/authenticate/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: values.username,
          passWord: values.password,
        }),
      });

      if (response.ok) {
        // Kiểm tra xem response có body không trước khi parse JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const result = await response.json();
            console.log('MCP Authentication success:', result);
          } catch (e) {
            console.log('MCP Authentication success (no JSON body)');
          }
        }
        
        message.success('Xác thực MCP thành công');
        
        // Backend đã lưu token vào DB, không cần lưu ở FE
        // Gọi callback để quay lại trang chính
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const errorText = await response.text();
        let errorMessage = 'Xác thực thất bại. Vui lòng kiểm tra lại Username và Password.';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          // Nếu không parse được JSON, dùng errorText
          if (errorText && errorText.length < 200) {
            errorMessage = errorText;
          }
        }
        
        message.error(errorMessage);
        console.error('MCP Authentication error:', errorText);
      }
    } catch (error: any) {
      console.error('Error authenticating MCP:', error);
      message.error('Lỗi khi xác thực MCP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mcp-auth-container">
      <Card className="mcp-auth-card">
        <div className="mcp-auth-header">
          <h4>Xác thực vào hệ thống MCP Ciena Đông Bắc 6500</h4>
        </div>
        
        <div className="mcp-auth-notice">
          <p style={{ color: '#1890ff', margin: 0, fontSize: '12px', lineHeight: '1.5' }}>
            <strong>Lưu ý:</strong> Mỗi lần xác thực vào MCP của hệ thống Truyền dẫn Ciena Đông Bắc có thời gian 30 ngày. 
            Sau khi hết phiên hoạt động cần thực hiện đăng nhập lại!
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mcp-auth-form"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập Username' }]}
            style={{ marginBottom: '12px' }}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="User Name"
              size="middle"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập Password' }]}
            style={{ marginBottom: '12px' }}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="middle"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="middle"
              block
              className="mcp-auth-submit-btn"
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default MCPAuth;

