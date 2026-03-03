import { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { RotatingLines } from 'react-loader-spinner';
import SingleProductModal from '../../../components/SingleProductModal';
import * as bootstrap from 'bootstrap'; //因為用到bootstrap 所以需要引入
import EmailValidation from '../../utils/validation';

const API_PATH = import.meta.env.VITE_API_PATH;
const API_BASE = import.meta.env.VITE_API_BASE;
export default function Checkout() {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState([]);
  const [carts, setCarts] = useState([]);
  const [total, setTotal] = useState(0);
  // 載入狀態
  const [loadingCartId, setLoadingCartId] = useState(null); //產品列表的產品按下去加入購物車時的loading
  const [loadingProductId, setLoadingProductId] = useState(null);
  // useRef 建立對 DOM 元素的參照

  const modalRef = useRef(null);
  const bsModal = useRef(null);
  // 在 useEffect 中初始化
  useEffect(() => {
    bsModal.current = new bootstrap.Modal(modalRef.current);

    // Modal 關閉時移除焦點
    modalRef.current.addEventListener('hide.bs.modal', () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
  }, []);
  // 使用 ref 控制 Modal
  const openModal = () => {
    bsModal.current.show();
  };
  const closeModal = () => {
    bsModal.current.hide();
  };
  //加入產品列表相關功能
  const getProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/products/all`);
      // 建議檢查資料格式，有些 API 回傳的是 res.data 或 res.data.products
      setProducts(res.data.products);
      console.log('取得產品列表', res.data.products);
    } catch (error) {
      // 實務上建議可以用 alert 或 toast 通知使用者
      console.error('載入產品列表失敗', error);
    }
  };

  //查看更多按鈕要跳轉到單一產品頁面
  const handleViewMore = async (id) => {
    setLoadingProductId(id); // 設定正在載入產品頁面的 ID
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/product/${id}`
      );
      console.log('取得單一產品資料', response.data.product);
      setProduct([response.data.product]); // 將單一產品資料放入 products 狀態中
      openModal(); // 開啟 Modal
    } catch (error) {
      console.error('載入產品列表失敗', error);
    } finally {
      setLoadingProductId(null); // 重置正在載入產品頁面的 ID
    }
  };
  //加入表單驗證功能
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    mode: 'onChange',
  });
  // 送出form表單的處理函式
  const onSubmit = (data) => {
    // console.log('表單資料', data);

    // 這裡可以加入送出訂單的邏輯，例如呼叫 API 將訂單資料傳到後端
    const submitOrder = async () => {
      const orderData = {
        data: {
          user: {
            name: data.name,
            email: data.email,
            tel: data.tel,
            address: data.address,
          },
          message: data.message,
        },
      };
      try {
        const res = await axios.post(`${API_BASE}/api/${API_PATH}/order`, {
          data: orderData.data,
        });
        alert('訂單已送出！'); // 顯示成功訊息
        console.log('訂單送出回應', res.data);
        // 這裡可以加入送出訂單成功後的處理邏輯，例如清空購物車、導向訂單完成頁面等
        await getCart(); // 送出訂單後重新取得購物車資料以更新畫面
        reset(); // 重置表單
      } catch (error) {
        console.error('訂單送出失敗', error);
        alert('訂單送出失敗，請稍後再試！'); // 顯示錯誤訊息
      }
    };
    submitOrder();
  };
  const getCart = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      // 處理取得的購物車資料
      console.log('取得購物車列表', res.data);
      setCarts(res.data.data.carts);
      setTotal(res.data.data.final_total);
    } catch (error) {
      console.error('取得購物車資料失敗', error);
    }
  };
  // 加入購物車 API
  const addToCart = async (id, qty = 1) => {
    try {
      setLoadingCartId(id); // 設定正在加入購物車的產品 ID
      const res = await axios.post(`${API_BASE}/api/${API_PATH}/cart`, {
        data: {
          product_id: id,
          qty: Number(qty),
        },
      });
      alert('已加入購物車！');
      console.log('加入購物車成功', res.data);
      getCart(); // 加入購物車後重新取得購物車資料以更新畫面
    } catch (error) {
      console.error('加入購物車失敗', error);
    } finally {
      setLoadingCartId(null); // 重置正在加入購物車的產品 ID
    }
  };
  useEffect(() => {
    // 這裡可以加入取得購物車資料的邏輯
    // 取得購物車資料
    getCart();
    // 取得產品列表資料
    getProducts();
  }, []);
  function handleClearCart() {
    // 這裡可以加入清空購物車的邏輯
    const clearCart = async () => {
      try {
        await axios.delete(`${API_BASE}/api/${API_PATH}/carts`);
        alert('購物車已清空！');
        setCarts([]); // 清空前端的購物車資料
      } catch (error) {
        console.error('清空購物車失敗', error);
      }
    };
    clearCart();
  }
  function handleRemoveItem(productId) {
    // 這裡可以加入刪除購物車項目的邏輯
    const removeItem = async () => {
      try {
        await axios.delete(`${API_BASE}/api/${API_PATH}/cart/${productId}`);
        alert('已從購物車刪除該項目！'); // 顯示成功訊息
        getCart(); // 重新取得購物車資料以更新畫面
      } catch (error) {
        console.error('刪除購物車項目失敗', error);
      }
    };
    removeItem();
  }

  // 即時更新購物車項目數量
  const updateCartItem = async (cartId, productId, newQty) => {
    try {
      const res = await axios.put(
        `${API_BASE}/api/${API_PATH}/cart/${cartId}`,
        {
          data: {
            product_id: productId,
            qty: Number(newQty),
          },
        }
      );
      alert('已更新購物車項目數量！'); // 顯示成功訊息
      getCart(); // 重新取得購物車資料以更新畫面
    } catch (error) {
      console.error('更新購物車項目失敗', error);
    }
  };
  return (
    <div className="container">
      <h2>購物車列表</h2>
      {/* 產品列表 */}
      <table className="table align-middle">
        <thead>
          <tr>
            <th>圖片</th>
            <th>商品名稱</th>
            <th>價格</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td style={{ width: '200px' }}>
                <div
                  style={{
                    height: '100px',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `url(${product.imageUrl})`,
                  }}
                ></div>
              </td>
              <td>{product.title}</td>
              <td>
                <del className="h6">原價：{product.origin_price}</del>
                <div className="h5">特價：{product.price}</div>
              </td>
              <td>
                <div className="btn-group btn-group-sm">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => handleViewMore(product.id)}
                    disabled={loadingProductId === product.id}
                  >
                    {loadingProductId === product.id ? (
                      <RotatingLines color="grey" width={80} height={16} />
                    ) : (
                      '查看更多'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    disabled={loadingCartId === product.id} // 當正在加入購物車的產品 ID 與當前產品 ID 相同時，禁用按鈕 並顯示 loading 狀態
                    onClick={() => {
                      addToCart(product.id, 1);
                    }}
                  >
                    {loadingCartId === product.id ? (
                      <RotatingLines color="grey" width={80} height={16} />
                    ) : (
                      '加入購物車'
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-end mt-4">
        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={handleClearCart}
          disabled={carts.length === 0}
        >
          清空購物車
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">品名</th>
            <th scope="col">數量/單位</th>
            <th scope="col">小計</th>
          </tr>
        </thead>
        <tbody>
          {
            /* 這裡應該要有購物車項目的渲染邏輯 */
            carts.map((cart) => (
              <tr key={cart.id}>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => {
                      handleRemoveItem(cart.id);
                    }}
                  >
                    刪除
                  </button>
                </td>
                <th scope="row">{cart.product.title}</th>

                <td>
                  <div
                    className="input-group input-group-sm"
                    style={{ width: '150px' }}
                  >
                    {/* 數量輸入框 */}
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={cart.qty}
                      // 當數值改變時，即時呼叫 API
                      onChange={(e) =>
                        updateCartItem(cart.id, cart.product_id, e.target.value)
                      }
                    />
                    {/* 單位顯示 */}
                    <span className="input-group-text" id="basic-addon2">
                      {cart.product.unit}
                    </span>
                  </div>
                </td>
                <td className="text-end">{cart.final_total}</td>
              </tr>
            ))
          }
        </tbody>

        <tfoot>
          <tr>
            <td className="text-end" colSpan="3">
              總計
            </td>
            <td className="text-end">{total}</td>
          </tr>
        </tfoot>
      </table>
      {/* 加入結帳table */}
      {/* 結帳頁面 */}
      <div className="my-5 row justify-content-center">
        <form className="col-md-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="請輸入 Email"
              defaultValue="test@gamil.com"
              {...register('email', EmailValidation)}
            />
            {errors.email && (
              <div className="text-danger">{errors.email.message}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              收件人姓名
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              placeholder="請輸入姓名"
              defaultValue="小明"
              {...register('name', {
                required: '姓名為必填',
                minLength: {
                  value: 2,
                  message: '姓名至少兩個字元',
                },
              })}
            />
            {errors.name && (
              <div className="text-danger">{errors.name.message}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="tel" className="form-label">
              收件人電話
            </label>
            <input
              id="tel"
              name="tel"
              type="tel"
              className="form-control"
              placeholder="請輸入電話"
              defaultValue="0912345678"
              {...register('tel', {
                required: '電話為必填',
                pattern: {
                  value: /^09\d{8}$/,
                  message: '電話僅能輸入數字，需為 09 開頭的 10 位數字',
                },
              })}
            />
            {errors.tel && (
              <div className="text-danger">{errors.tel.message}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="address" className="form-label">
              收件人地址
            </label>
            <input
              id="address"
              name="address"
              type="text"
              className="form-control"
              placeholder="請輸入地址"
              defaultValue="臺北市信義區信義路5段7號"
              {...register('address', {
                required: '地址為必填',
              })}
            />
            {errors.address && (
              <div className="text-danger">{errors.address.message}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="message" className="form-label">
              留言
            </label>
            <textarea
              id="message"
              className="form-control"
              cols="30"
              rows="10"
              {...register('message')}
            ></textarea>
          </div>
          <div className="text-end">
            <button
              type="submit"
              className="btn btn-danger"
              disabled={!isValid}
            >
              送出訂單
            </button>
          </div>
        </form>
      </div>
      {/* 單一產品 Modal */}
      <SingleProductModal
        ref={modalRef}
        product={product[0]}
        addToCart={addToCart}
        closeModal={closeModal}
      />
    </div>
  );
}
