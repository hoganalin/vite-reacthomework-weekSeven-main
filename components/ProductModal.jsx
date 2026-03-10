import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { createAsyncMessage } from '../src/slices/messageSlice';
export default function ProductModal({
  modalType,
  templateProduct,
  closeModal,
  productModalRef,

  getData,
}) {
  const dispatch = useDispatch();
  const API_BASE = import.meta.env.VITE_API_BASE;
  const API_PATH = import.meta.env.VITE_API_PATH;
  const fileInputRef = useRef(null);
  const [tempData, setTempData] = useState(templateProduct);
  //新增useEffect
  useEffect(() => {
    setTempData(templateProduct);
  }, [templateProduct]);
  //處理副圖的url
  const handleImageChange = (index, value) => {
    setTempData((prevData) => {
      const newImages = [...prevData.imagesUrl];
      newImages[index] = value;

      // 填寫最後一個空輸入框時，自動新增空白輸入框
      if (
        value !== '' &&
        index === newImages.length - 1 &&
        newImages.length < 5
      ) {
        newImages.push('');
      }

      // 清空輸入框時，移除最後的空白輸入框
      if (
        value === '' &&
        newImages.length > 1 &&
        newImages[newImages.length - 1] === ''
      ) {
        newImages.pop();
      }

      return { ...prevData, imagesUrl: newImages };
    });
  };

  //新增附圖
  const handleAddImage = () => {
    setTempData((prevData) => {
      const newImages = [...prevData.imagesUrl]; //複製圖片陣列
      newImages.push('');
      //處理特定索引值的圖片網址
      return { ...prevData, imagesUrl: newImages }; //回傳陣列, 把imagesUrl更新
    });
  };
  //刪除附圖
  const handleRemoveImage = () => {
    setTempData((prevData) => {
      const newImages = [...prevData.imagesUrl]; //複製圖片陣列
      newImages.pop();
      return { ...prevData, imagesUrl: newImages }; //回傳陣列, 把imagesUrl更新
    });
  };
  // 建立一個清空檔案欄位的 function
  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // 將 value 設為空字串即可清空顯示的檔名
    }
  };

  //更新產品資料 (新增或者編輯)
  const updateProductData = async (id) => {
    //決定api端點跟方法
    let url = `${API_BASE}/api/${API_PATH}/admin/product`;
    let method = 'post'; //這是api新增的方法
    if (modalType === 'edit') {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
      method = 'put'; // 改成api編輯的方法
    }
    const productData = {
      data: {
        ...tempData,
        origin_price: Number(tempData.origin_price),
        price: Number(tempData.price),
        is_enabled: tempData.is_enabled ? 1 : 0,
        imagesUrl: [...tempData.imagesUrl.filter((url) => url !== '')],
      },
    };
    try {
      const response = await axios[method](url, productData);
      getData(); //重新更新產品列表
      closeModal(); //關閉modal
      dispatch(createAsyncMessage(response.data));
    } catch (error) {
      dispatch(createAsyncMessage(error.response.data));
    }
  };
  //刪除產品資料
  const deleteProduct = async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${id}`
      );
      getData();
      closeModal();
      dispatch(createAsyncMessage(response.data));
    } catch (error) {
      dispatch(createAsyncMessage(error.response.data.message));
      //顯示錯誤訊息
    }
  };

  //上傳圖片檔案
  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const formData = new FormData(); //瀏覽器內建的，用來模擬：專門拿來裝檔案、圖片、影片的格式。
      formData.append('file-to-upload', file); //在這個箱子裡面，放一個叫
      // 👉 file-to-upload 的欄位
      // 👉 裡面裝的是這個 file（圖片）」
      const response = await axios.post(
        `${API_BASE}/api/${API_PATH}/admin/upload`,
        formData
      );
      setTempData((pre) => {
        return {
          ...pre,
          imageUrl: response.data.imageUrl,
        };
      });
      // 上傳成功後清空，避免使用者混淆
      resetFileInput();
    } catch (error) {
      dispatch(createAsyncMessage(error.response.data));
    }
  };
  //宣告modal 的欄位綁定值
  const modalHandleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setTempData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div
      className="modal fade"
      id="productModal"
      tabIndex="-1"
      aria-labelledby="productModalLabel"
      aria-hidden="true"
      ref={productModalRef}
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div
            className={`modal-header bg-${modalType === 'delete' ? 'danger' : 'dark'} text-white`}
          >
            <h1
              className="modal-title fs-5 text-white fw-bold"
              id="productModalLabel"
            >
              {modalType === 'delete'
                ? '刪除'
                : modalType === 'edit'
                  ? '編輯'
                  : '新增'}
              產品
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={() => {
                closeModal();
              }}
            ></button>
          </div>
          <div className="modal-body">
            {modalType === 'delete' ? (
              <p className="text-danger">是否真的要刪除{tempData.title}</p>
            ) : (
              <div className="row">
                <div className="col-sm-4">
                  <div className="mb-2">
                    <div className="mb-3">
                      <label htmlFor="fileUpload" className="form-label">
                        上傳圖片
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        name="file-to-upload"
                        id="fileUpload"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => uploadImage(e)}
                        ref={fileInputRef} //綁定ref
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="imageUrl" className="form-label">
                        輸入圖片網址
                      </label>
                      <input
                        type="text"
                        id="imageUrl"
                        name="imageUrl"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                        value={tempData.imageUrl || ''}
                        onChange={(e) => modalHandleInputChange(e)}
                      />
                    </div>
                    {tempData.imageUrl && (
                      <img
                        src={tempData.imageUrl}
                        className="img-fluid"
                        alt="主圖"
                      />
                    )}
                  </div>
                  {tempData.imagesUrl &&
                    tempData.imagesUrl.map((url, index) => (
                      <div key={index}>
                        <label
                          htmlFor={`imgUrl_${index}`}
                          className="form-label"
                        >
                          輸入圖片網址
                        </label>
                        <input
                          id={`imgUrl_${index}`}
                          type="text"
                          className="form-control"
                          onChange={(e) =>
                            handleImageChange(index, e.target.value)
                          }
                          placeholder={`圖片網址${index + 1}`}
                          value={url}
                        />
                        {url && (
                          <img src={url} className="img-fluid" alt="副圖" />
                        )}
                      </div>
                    ))}
                  {tempData.imagesUrl &&
                    tempData.imagesUrl.length < 5 &&
                    tempData.imagesUrl[tempData.imagesUrl.length - 1] !==
                      '' && (
                      <button
                        className="btn btn-outline-primary btn-sm d-block w-100"
                        onClick={handleAddImage}
                      >
                        新增圖片
                      </button>
                    )}
                  {tempData.imagesUrl && tempData.imagesUrl.length > 1 && (
                    <button
                      className="btn btn-outline-danger btn-sm d-block w-100"
                      onClick={handleRemoveImage}
                    >
                      刪除圖片
                    </button>
                  )}
                </div>
                <div className="col-sm-8">
                  <div className="row">
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">
                        標題
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        className="form-control"
                        placeholder="請輸入標題"
                        value={tempData.title || ''}
                        onChange={(e) => modalHandleInputChange(e)}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="category" className="form-label">
                        分類
                      </label>
                      <input
                        type="text"
                        id="category"
                        name="category"
                        className="form-control"
                        placeholder="分類"
                        value={tempData.category || ''}
                        onChange={(e) => modalHandleInputChange(e)}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="unit" className="form-label">
                        單位
                      </label>
                      <input
                        type="text"
                        id="unit"
                        name="unit"
                        className="form-control"
                        placeholder="單位"
                        value={tempData.unit || ''}
                        onChange={(e) => modalHandleInputChange(e)}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        min="0"
                        type="number"
                        id="origin_price"
                        name="origin_price"
                        className="form-control"
                        placeholder="原價"
                        value={tempData.origin_price}
                        onChange={(e) => modalHandleInputChange(e)}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        className="form-control"
                        placeholder="售價"
                        min="0"
                        value={tempData.price || ''}
                        onChange={(e) => modalHandleInputChange(e)}
                      />
                    </div>
                  </div>
                  <hr />

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      className="form-control"
                      placeholder="請輸入產品描述"
                      value={tempData.description || ''}
                      onChange={(e) => modalHandleInputChange(e)}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      name="content"
                      id="content"
                      className="form-control"
                      placeholder="請輸入說明內容"
                      value={tempData.content || ''}
                      onChange={(e) => modalHandleInputChange(e)}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        name="is_enabled"
                        id="is_enabled"
                        className="form-check-input"
                        type="checkbox"
                        checked={tempData.is_enabled || false}
                        onChange={(e) => modalHandleInputChange(e)}
                      />
                      <label className="form-check-label " htmlFor="is_enabled">
                        是否啟用
                      </label>
                    </div>
                    <div className="mb-3">
                      <label className="form-check-label" htmlFor="size">
                        尺寸
                      </label>
                      <select
                        id="size"
                        name="size"
                        className="form-select"
                        aria-label="Default select example"
                        value={tempData.size}
                        // 自己新增Value
                        onChange={(e) => modalHandleInputChange(e)}
                      >
                        <option value="">請選擇</option>
                        <option value="lg">大杯</option>
                        <option value="md">中杯</option>
                        <option value="sm">小杯</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            {modalType === 'delete' ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  deleteProduct(tempData.id);
                }}
              >
                刪除
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  data-bs-dismiss="modal"
                  onClick={() => closeModal()}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => updateProductData(tempData.id)}
                >
                  確認
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
