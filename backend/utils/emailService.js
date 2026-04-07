const nodemailer = require('nodemailer');

// Tạo transporter LAZILY (bên trong hàm) để đảm bảo process.env đã được load
const createTransporter = () => {
  // Xóa khoảng trắng trong mật khẩu App Google (đề phòng lỗi env var)
  const emailPass = (process.env.EMAIL_PASS || '').replace(/\s/g, '');
  const emailUser = (process.env.EMAIL_USER || '').trim();

  console.log(`📧 Email config: user=${emailUser}, pass_length=${emailPass.length}`);

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // dùng STARTTLS (port 587)
    auth: {
      user: emailUser,
      pass: emailPass
    },
    tls: {
      rejectUnauthorized: false // bỏ qua lỗi certificate trên cloud
    }
  });
};


exports.sendOTPVerificationEmail = async (email, otpCode) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"Vé Tàu Online" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Mã Xác Thực Đăng Ký Tài Khoản",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0056b3; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Xác Thực Tài Khoản</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Chào bạn,<br/><br/>
            Cảm ơn bạn đã đăng ký tài khoản tại hệ thống đặt vé tàu của chúng tôi.
            Đây là mã xác thực (OTP) của bạn:
          </p>
          <div style="background-color: #f8f9fa; border: 1px dashed #0056b3; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <span style="font-size: 36px; font-weight: bold; color: #0056b3; letter-spacing: 8px;">${otpCode}</span>
          </div>
          <p style="font-size: 14px; color: #666;">
            ⏳ Mã có hiệu lực trong vòng <strong>5 phút</strong>.<br/>
            🔒 Vui lòng không chia sẻ mã này cho bất kỳ ai.
          </p>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888;">
          © 2026 Hệ thống Bán Vé Tàu Online. Tất cả các quyền được bảo lưu.
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Đã gửi OTP tới ${email}`);
};

exports.sendForgotPasswordEmail = async (email, otpCode) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"Vé Tàu Online" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Mã Xác Thực Đặt Lại Mật Khẩu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #c9503a; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔑 Đặt Lại Mật Khẩu</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Chào bạn,<br/><br/>
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản này.
            Đây là mã OTP của bạn:
          </p>
          <div style="background-color: #fff5f0; border: 2px dashed #c9503a; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 20px;">
            <span style="font-size: 36px; font-weight: bold; color: #c9503a; letter-spacing: 8px;">${otpCode}</span>
          </div>
          <p style="font-size: 14px; color: #666;">
            ⏳ Mã có hiệu lực trong vòng <strong>10 phút</strong>.<br/>
            🚫 Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.
          </p>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888;">
          © 2026 Hệ thống Bán Vé Tàu Online. Tất cả các quyền được bảo lưu.
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Đã gửi email đặt lại mật khẩu tới ${email}`);
};
