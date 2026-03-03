import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router';

const API_PATH = import.meta.env.VITE_API_PATH;
const API_BASE = import.meta.env.VITE_API_BASE;

export default function SingleProduct() {
  const { id } = useParams();
  const [singleProduct, setSingleProduct] = useState(null);
  const [qty, setQty] = useState(1); // 管理購買數量
  const [isLoading, setIsLoading] = useState(true);

  // 取得單一產品 API
  useEffect(() => {
    async function getSingleProduct() {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE}/api/${API_PATH}/product/${id}`
        );
        setSingleProduct(res.data.product);
      } catch (error) {
        console.error('取得單一產品資料失敗', error);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) getSingleProduct();
  }, [id]);

  // 加入購物車 API
  const addToCart = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/${API_PATH}/cart`, {
        data: {
          product_id: id,
          qty: Number(qty),
        },
      });
      alert('已加入購物車！');
      console.log('加入購物車成功', res.data);
    } catch (error) {
      console.error('加入購物車失敗', error);
    }
  };

  if (isLoading) return <div className="container mt-5">載入中...</div>;
  if (!singleProduct) return <div className="container mt-5">找不到產品。</div>;

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="row g-0">
          {/* 左側產品圖片 */}
          <div className="col-md-6">
            <img
              src={singleProduct.imageUrl}
              alt={singleProduct.title}
              className="img-fluid rounded-start h-100"
              style={{ objectFit: 'cover' }}
            />
          </div>

          {/* 右側產品內容與按鈕 */}
          <div className="col-md-6">
            <div className="card-body p-4">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <small>產品列表</small>
                  </li>
                  <li className="breadcrumb-item active">
                    <small>{singleProduct.category}</small>
                  </li>
                </ol>
              </nav>

              <h2 className="card-title fw-bold">{singleProduct.title}</h2>
              <p className="card-text text-muted">
                {singleProduct.description}
              </p>
              <p className="card-text">{singleProduct.content}</p>

              <div className="h4 text-danger mb-4">
                NT$ {singleProduct.price}
              </div>

              {/* 數量選擇與按鈕組 */}
              <div className="d-flex align-items-center gap-3">
                <div className="input-group w-50">
                  <label className="input-group-text">數量</label>
                  <select
                    className="form-select"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn btn-primary px-4 py-2"
                  onClick={addToCart}
                >
                  <i className="bi bi-cart-plus me-2"></i>
                  加入購物車
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
