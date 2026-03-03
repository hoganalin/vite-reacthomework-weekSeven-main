import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
import { useForm } from 'react-hook-form';
import EmailValidation from '../utils/validation';
export default function Login({ getData, setIsAuth }) {
  // const [formData, setFormData] = useState({
  //   username: '',
  //   password: '',
  // });
  const navigate = useNavigate();
  //以上都不需要,要改為使用useForm
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
    },
  });
  //處理表單填值
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmitLogin = async (formData) => {
    //處理提交表單
    // e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      console.log(response.data);
      const { token, expired } = response.data;
      //儲存token到cookie
      document.cookie = `myToken=${token};expires=${new Date(expired)}`;
      //設定axios的預設headers
      axios.defaults.headers.common.Authorization = `${token}`;
      //載入產品資料
      // getData();
      //更新登入狀態為true
      // setIsAuth(true);
      //導航頁面到後台產品列表
      navigate('/admin/product');
    } catch (error) {
      console.log('提交表單出錯了,error為', error);
    }
  };
  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center">
      <div className="w-100" style={{ maxWidth: '500px' }}>
        <form action="" onSubmit={handleSubmit(handleSubmitLogin)}>
          <h1>請先登入</h1>
          <div className="form-floating mb-3 ">
            <input
              type="email"
              className="form-control"
              id="floatingInput"
              placeholder="name@example.com"
              name="username"
              {...register('username', EmailValidation)}

              // value={formData.username}
              // onChange={handleInputChange}
            />
            <label htmlFor="floatingInput">Email address</label>
            {errors.username && (
              <div className="text-danger mt-1">{errors.username.message}</div>
            )}
          </div>
          <div className="form-floating mb-3">
            <input
              type="password"
              className="form-control"
              id="floatingPassword"
              placeholder="Password"
              name="password"
              {...register('password', { required: '請輸入密碼' })}
              // value={formData.password}
              // onChange={handleInputChange}
            />
            <label htmlFor="floatingPassword">Password</label>
            {errors.password && (
              <div className="text-danger mt-1">{errors.password.message}</div>
            )}
          </div>
          <button className="btn btn-primary" type="submit" disabled={!isValid}>
            登入
          </button>
        </form>
      </div>
    </div>
  );
}
