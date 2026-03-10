import { NavLink, Outlet } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useMessage from '../hooks/useMessage';
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
const AdminLayout = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useMessage();
  const logout = async () => {
    try {
      const response = await axios.post(`${API_BASE}/logout`);

      // console.log('登出成功', response.data);
      showSuccess('登出成功');
      navigate('/login');
    } catch (error) {
      // console.log('登出失敗', error.response);
      showError('登出失敗');
    }
  };
  return (
    <>
      <header className="bg-light py-3 mb-4">
        <div className="container">
          <div className="d-flex justify-content-between">
            <h1 className="m-0">後臺網站</h1>
            <button className="btn btn-danger " onClick={logout}>
              登出
            </button>
          </div>

          <nav>
            <NavLink className="h4 mt-5 mx-2" to="/admin/product">
              後臺產品列表
            </NavLink>

            <NavLink className="h4 mt-5 mx-2" to="/admin/order">
              後臺訂單列表
            </NavLink>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="mt-5 text-center">
        <p>© 2025 我的網站</p>
      </footer>
    </>
  );
};
export default AdminLayout;
