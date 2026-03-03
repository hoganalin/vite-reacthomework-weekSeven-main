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
import Pagination from '../../../components/Pagination';
import ProductModal from '../../../components/ProductModal';

// import { createAsyncMessage } from '../../slices/messageSlice';
// import { useDispatch } from 'react-redux';
import useMessage from '../../hooks/useMessage';

function AdminProducts() {
  // const dispatch = useDispatch();
  const { showSuccess, showError } = useMessage();
  // const [isAuth, setIsAuth] = useState(false); // 登入狀態

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
      console.log('取的產品資料成功');
      showSuccess('產品列表載入成功');
    } catch (error) {
      console.log(`取得產品資料錯誤`, error.response?.data?.message);
      // dispatch(createAsyncMessage(error.response?.data));
      showError('取得產品資料錯誤');
    }
  };

  useEffect(() => {
    getData();
  }, []);
  //宣告input的值綁定欄位方式

  // //綁定Modal useRef
  useEffect(() => {
    if (!productModalRef.current) return;

    myModal.current = new bootstrap.Modal(productModalRef.current, {
      backdrop: true,
      keyboard: false,
    });

    return () => {
      myModal.current?.dispose();
      myModal.current = null;
    };
  }, []);

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
  return (
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
  );
}
export default AdminProducts;
