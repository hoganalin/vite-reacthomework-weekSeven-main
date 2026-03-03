import axios from 'axios';
import { useRef, useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
//宣告modal儲存的資料
const INITIAL_TEMPLATE_DATA = {
  id: '',
  title: '',
  category: '',
  origin_price: '',
  price: '',
  unit: '',
  description: '',
  content: '',
  is_enabled: false,
  imageUrl: '',
  imagesUrl: [''],
  size: '',
};
//載入Bootstrap 的js/css
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import * as bootstrap from 'bootstrap';
//import style
import './assets/style.css';
import ProductModal from '../components/ProductModal';
import Pagination from '../components/Pagination';
import Login from './views/Login';

function App() {
  const [isAuth, setIsAuth] = useState(false); // 登入狀態

  const [products, setProducts] = useState([]); //產品列data
  const [modalType, setModalType] = useState(''); //設定modal要做什麼? 新增 or 編輯
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA); //單一產品DATA儲存格式
  const [pagination, setPagination] = useState({});
  const productModalRef = useRef(null);
  const myModal = useRef(null);

  //取得產品們的資料
  const getData = async (page = 1) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`
      );
      // console.log('產品列表載入成功', response.data);
      setProducts(response.data.products);
      setPagination(response.data.pagination); //也把分頁儲存
    } catch (error) {
      console.log(`取得產品資料錯誤`, error.response?.data?.message);
    }
  };

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
        getData();
      } catch (error) {
        alert('登入狀態已過期,請重新登入');
        console.log('登入驗證失敗', error.response);
      }
    };
    checkLogin();
  }, []);
  //宣告input的值綁定欄位方式

  //綁定Modal useRef
  useEffect(() => {
    if (!isAuth) return;
    if (!productModalRef.current) return;

    if (!myModal.current) {
      myModal.current = new bootstrap.Modal(productModalRef.current, {
        backdrop: true,
        keyboard: false,
      });
    }
  }, [isAuth]);

  //打開modal方式
  const openModal = (type, product) => {
    // console.log(product);
    setModalType(type);
    setTemplateProduct({
      ...INITIAL_TEMPLATE_DATA,
      ...product,
    });
    if (myModal.current) {
      myModal.current.show();
    }
  };
  //關閉modal方式
  const closeModal = () => {
    if (myModal.current) {
      myModal.current.hide();
    }
  };
  return isAuth ? (
    <div className="container">
      <div className="text-end mt-4">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            openModal('create', INITIAL_TEMPLATE_DATA);
          }}
        >
          建立新的產品
        </button>
      </div>

      <h2 className="mt-1">產品列表</h2>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">分類</th>
            <th scope="col">產品名稱</th>
            <th scope="col">原價</th>
            <th scope="col">售價</th>
            <th scope="col">是否啟用</th>
            <th scope="col">編輯</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <th scope="row">{product.category}</th>
              <td>{product.title}</td>
              <td>{product.origin_price}</td>
              <td>{product.price}</td>
              <td className={`${product.is_enabled ? 'text-success' : ''}`}>
                {product.is_enabled ? '啟用' : '未啟用'}
              </td>
              <td>
                <div
                  className="btn-group"
                  role="group"
                  aria-label="Basic example"
                >
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => {
                      openModal('edit', product);
                    }}
                  >
                    編輯
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => {
                      openModal('delete', product);
                    }}
                  >
                    刪除
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination pagination={pagination} onChangePage={getData} />
      <ProductModal
        modalType={modalType}
        templateProduct={templateProduct}
        getData={getData}
        closeModal={closeModal}
        productModalRef={productModalRef}
      />
    </div>
  ) : (
    <Login getData={getData} setIsAuth={setIsAuth} />
  );
}
export default App;
