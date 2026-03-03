import { NavLink, Outlet } from 'react-router-dom';
const FrontendLayout = () => {
  return (
    <>
      <header className="bg-light py-3 mb-4">
        <div className="container">
          <h1 className="m-0">前台網站</h1>
          <nav>
            <NavLink className="h4 mt-5 mx-2" to="/">
              首頁
            </NavLink>
            <NavLink className="h4 mt-5 mx-2" to="/products">
              產品頁面
            </NavLink>
            <NavLink className="h4 mt-5 mx-2" to="/cart">
              購物車頁面
            </NavLink>
            <NavLink className="h4 mt-5 mx-2" to="/checkout">
              結帳頁面
            </NavLink>
            <NavLink className="h4 mt-5 mx-2" to="/login">
              登入頁面
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
export default FrontendLayout;
