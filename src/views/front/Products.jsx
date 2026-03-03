import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

// 建議將環境變數放在 import 之後
const API_PATH = import.meta.env.VITE_API_PATH;
const API_BASE = import.meta.env.VITE_API_BASE;

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  //查看更多按鈕要跳轉到單一產品頁面
  const handleViewMore = (id) => {
    navigate(`/product/${id}`);
  };
  const getProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/products/all`);
      // 建議檢查資料格式，有些 API 回傳的是 res.data 或 res.data.products
      setProducts(res.data.products);
    } catch (error) {
      // 實務上建議可以用 alert 或 toast 通知使用者
      console.error('載入產品列表失敗', error);
    }
  };

  useEffect(() => {
    getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container">
      <h2>產品列表</h2>
      <p>這裡是前台網站的產品列表內容。</p>

      {/* 建議加上渲染邏輯，方便確認資料有抓到 */}
      <ul className="row">
        {products.map((product) => (
          <li key={product.id} className="col-md-4">
            <div className="card">
              <img
                src={product.imageUrl}
                className="card-img-top"
                alt={product.title}
                style={{
                  height: '300px',
                  objectFit: 'cover',
                }}
              />
              <div className="card-body">
                <h5 className="card-title">{product.title}</h5>
                <p className="card-text">{product.price} 元</p>
                <button
                  className="btn btn-primary"
                  onClick={() => handleViewMore(product.id)}
                >
                  查看更多
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
