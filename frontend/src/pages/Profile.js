import { useState, useEffect } from "react";
import API from "../api/axios";

function Profile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    // lấy user từ localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        password: "",
      });
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await API.put("/users/profile", form);

      setMessage("Cập nhật thành công!");

      // cập nhật lại localStorage
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
  console.log(err.response);
  setMessage(err.response?.data?.message || "Lỗi cập nhật!");
}
  };

  return (
    <div>
      <h2>Cập nhật thông tin</h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleUpdate}>
        <input
          type="text"
          name="name"
          placeholder="Tên"
          value={form.name}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Mật khẩu mới"
          value={form.password}
          onChange={handleChange}
        />

        <button type="submit">Cập nhật</button>
      </form>
    </div>
  );
}

export default Profile;