import axios from 'axios';
import { RotatingLines, RotatingTriangles } from 'react-loader-spinner';
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
function ProtectedRoute({ children }) {
  //以下都是從 adminProduct copy過來
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  //檢查登入狀態, 之後初始化都可以先確認一次(使用useEffect,就不需要每次登入頁面都要重新登入)

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('myToken='))
      ?.split('=')[1];
    console.log('目前token', token);
    if (!token) return;

    axios.defaults.headers.common.Authorization = token;

    const checkLogin = async () => {
      try {
        const res = await axios.post(`${API_BASE}/api/user/check`);
        console.log(res);
        setIsAuth(true);
      } catch (error) {
        alert('登入狀態已過期,請重新登入');
        console.log('登入驗證失敗', error.response);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);
  if (loading) {
    return (
      <RotatingTriangles
        strokeWidth="5"
        animationDuration="0.75"
        width="96"
        visible={true}
      ></RotatingTriangles>
    );
  }
  if (!isAuth) return <Navigate to="/login"></Navigate>;
  return children;
}

export default ProtectedRoute;
