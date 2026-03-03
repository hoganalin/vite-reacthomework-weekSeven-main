import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router';

const API_PATH = import.meta.env.VITE_API_PATH;
const API_BASE = import.meta.env.VITE_API_BASE;
export default function Cart() {
  const [carts, setCarts] = useState([]);
  const [total, setTotal] = useState(0);
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
  useEffect(() => {
    // 這裡可以加入取得購物車資料的邏輯
    // 取得購物車資料

    getCart();
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
    </div>
  );
}
