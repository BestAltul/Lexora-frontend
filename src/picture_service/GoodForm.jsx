import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./GoodForm.css";

function GoodForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("general");

  const [good, setGood] = useState({
    sku: "",
    oldSku: "",
    title: "",
    upc: "",
    kitOrSingle: "SINGLE",
    isCore: true,
    coreGoodId: "",

    goodsCollectionId: "",
    categoryId: "",
    productTypeId: "",
    colorId: "",

    mainPictureLink: "",
  });

  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [colors, setColors] = useState([]);
  const [coreGoods, setCoreGoods] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8080/api/goods-collections").then((res) =>
        res.json()
      ),
      fetch("http://localhost:8080/api/categories").then((res) => res.json()),
      fetch("http://localhost:8080/api/product-types").then((res) =>
        res.json()
      ),
      fetch("http://localhost:8080/api/colors").then((res) => res.json()),
      fetch("http://localhost:8080/api/goods/core").then((res) => res.json()),
    ]).then(([c1, c2, c3, c4, c5]) => {
      setCollections(c1);
      setCategories(c2);
      setTypes(c3);
      setColors(c4);
      setCoreGoods(c5);
    });

    if (id && id !== "new") {
      fetch(`http://localhost:8080/api/goods/${id}`)
        .then((res) => res.json())
        .then((data) =>
          setGood((prev) => ({
            ...prev,
            sku: data.sku || "",
            oldSku: data.oldSku || "",
            title: data.title || "",
            upc: data.upc || "",
            kitOrSingle: data.kitOrSingle || "SINGLE",
            isCore: data.isCore ?? true,
            coreGoodId: data.coreGood?.id || "",

            goodsCollectionId: data.goodsCollection?.id || "",
            categoryId: data.category?.id || "",
            productTypeId: data.productType?.id || "",
            colorId: data.color?.id || "",

            mainPictureLink: prev.mainPictureLink,
          }))
        );
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setGood((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "isCore" && checked ? { coreGoodId: "" } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const method = id && id !== "new" ? "PUT" : "POST";
    const url =
      id && id !== "new"
        ? `http://localhost:8080/api/goods/${id}`
        : "http://localhost:8080/api/goods";

    const payload = {
      sku: good.sku,
      oldSku: good.oldSku,
      title: good.title,
      upc: good.upc,
      kitOrSingle: good.kitOrSingle,
      isCore: good.isCore,
      coreGoodId: good.isCore ? null : good.coreGoodId,
      goodsCollectionId: good.goodsCollectionId,
      categoryId: good.categoryId,
      productTypeId: good.productTypeId,
      colorId: good.colorId,
    };

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(() => navigate("/goods"));
  };

  const titleText = id === "new" ? "Create new Good" : "Edit Good";

  return (
    <div className="page-container">
      <div className="form-header-with-picture">
        <div className="header-picture-square">
          {good.mainPictureLink ? (
            <img
              src={good.mainPictureLink}
              className="header-picture-img"
              alt="Preview"
            />
          ) : (
            <div className="header-picture-placeholder">No image</div>
          )}
        </div>

        <div className="header-text-block">
          <h2 className="form-title">{titleText}</h2>
          <Link to="/goods" className="back-link">
            ← Back to list
          </Link>
        </div>
      </div>

      <div className="good-form-card">
        <div className="tabs">
          <button
            type="button"
            className={`tab-btn ${
              activeTab === "general" ? "tab-btn--active" : ""
            }`}
            onClick={() => setActiveTab("general")}
          >
            General
          </button>
          <button
            type="button"
            className={`tab-btn ${
              activeTab === "pictures" ? "tab-btn--active" : ""
            }`}
            onClick={() => setActiveTab("pictures")}
          >
            Pictures
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === "general" && (
            <>
              <div className="section">
                <h3>Basic information</h3>

                <div className="row">
                  <label>
                    SKU*
                    <input
                      type="text"
                      name="sku"
                      value={good.sku}
                      onChange={handleChange}
                    />
                  </label>

                  <label>
                    Old SKU
                    <input
                      type="text"
                      name="oldSku"
                      value={good.oldSku}
                      onChange={handleChange}
                    />
                  </label>
                </div>

                <div className="row">
                  <label>
                    Title*
                    <input
                      type="text"
                      name="title"
                      value={good.title}
                      onChange={handleChange}
                    />
                  </label>
                </div>

                <div className="row">
                  <label>
                    UPC
                    <input
                      type="text"
                      name="upc"
                      value={good.upc}
                      onChange={handleChange}
                    />
                  </label>

                  <label>
                    Kit / Single
                    <select
                      name="kitOrSingle"
                      value={good.kitOrSingle}
                      onChange={handleChange}
                    >
                      <option value="SINGLE">Single</option>
                      <option value="KIT">Kit</option>
                    </select>
                  </label>
                </div>

                <div className="checkbox-row">
                  <label>
                    <input
                      type="checkbox"
                      name="isCore"
                      checked={good.isCore}
                      onChange={handleChange}
                    />
                    This is a core item
                  </label>
                </div>

                {!good.isCore && (
                  <div className="row">
                    <label>
                      Core good*
                      <select
                        name="coreGoodId"
                        value={good.coreGoodId}
                        onChange={handleChange}
                      >
                        <option value="">Select core item</option>
                        {coreGoods.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.title}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>

              <div className="section">
                <h3>Main picture</h3>

                <div className="row">
                  <label>
                    Picture URL
                    <input
                      type="text"
                      name="mainPictureLink"
                      value={good.mainPictureLink}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                  </label>
                </div>

                <p className="muted">
                  This URL is used for the main preview of the item (top-left
                  picture). Later we will replace it with the real Picture
                  entity.
                </p>
              </div>

              <div className="section">
                <h3>Classification</h3>

                <div className="row">
                  <label>
                    Collection*
                    <select
                      name="goodsCollectionId"
                      value={good.goodsCollectionId}
                      onChange={handleChange}
                    >
                      <option value="">Select collection</option>
                      {collections.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Category*
                    <select
                      name="categoryId"
                      value={good.categoryId}
                      onChange={handleChange}
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="row">
                  <label>
                    Product Type*
                    <select
                      name="productTypeId"
                      value={good.productTypeId}
                      onChange={handleChange}
                    >
                      <option value="">Select type</option>
                      {types.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Color*
                    <select
                      name="colorId"
                      value={good.colorId}
                      onChange={handleChange}
                    >
                      <option value="">Select color</option>
                      {colors.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </>
          )}

          {activeTab === "pictures" && (
            <div className="section">
              <h3>Pictures</h3>
              <p className="muted">
                Здесь позже сделаем список всех фото товара, статусы (Under
                review / Approved / Final) и сортировку по priority.
              </p>
            </div>
          )}

          <div className="actions">
            <button type="submit" className="save-btn">
              Save
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/goods")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GoodForm;
