import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./GoodForm.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function buildImageUrl(link) {
  if (!link) return "";

  if (
    link.startsWith("http://") ||
    link.startsWith("https://") ||
    link.startsWith("data:")
  ) {
    return link;
  }

  return `${API_BASE_URL}${link}`;
}

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

  const [pictureTypes, setPictureTypes] = useState([]);

  const [pictures, setPictures] = useState([]);
  const fileInputRef = useRef(null);
  const [fileInputIndex, setFileInputIndex] = useState(null);
  const [previewPicture, setPreviewPicture] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/v3/goods-collections`).then((res) =>
        res.json()
      ),
      fetch(`${API_BASE_URL}/api/v3/categories`).then((res) => res.json()),
      fetch(`${API_BASE_URL}/api/v3/product-types`).then((res) => res.json()),
      fetch(`${API_BASE_URL}/api/v3/colors`).then((res) => res.json()),
      fetch(`${API_BASE_URL}/api/v3/goods/core`).then((res) => res.json()),
      fetch(`${API_BASE_URL}/api/v3/picture/types`).then((res) =>
        res.ok ? res.json() : []
      ),
    ])
      .then(([c1, c2, c3, c4, c5, c6]) => {
        setCollections(c1);
        setCategories(c2);
        setTypes(c3);
        setColors(c4);
        setCoreGoods(c5);
        setPictureTypes(c6 || []);
      })
      .catch(() => {
        setCollections([]);
        setCategories([]);
        setTypes([]);
        setColors([]);
        setCoreGoods([]);
        setPictureTypes([]);
      });

    if (id && id !== "new") {
      fetch(`${API_BASE_URL}/api/v3/goods/${id}`)
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
            mainPictureLink: prev.mainPictureLink || data.mainPictureLink || "",
          }))
        );

      fetch(`${API_BASE_URL}/api/v3/goods/${id}/pictures`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          setPictures(
            (data || []).map((p) => ({
              ...p,
              previewUrl: p.link,
              file: null,
            }))
          );
        })
        .catch(() => {
          setPictures([]);
        });
    } else {
      setPictures([]);
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
        ? `${API_BASE_URL}/api/v3/goods/${id}`
        : `${API_BASE_URL}/api/v3/goods`;

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
      mainPictureLink: good.mainPictureLink,
    };

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(() => {
      navigate("/goodlist-checker");
    });
  };

  const handlePictureClick = (index) => {
    setFileInputIndex(index);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || fileInputIndex === null) return;

    const url = URL.createObjectURL(file);

    setPictures((prev) =>
      prev.map((pic, idx) =>
        idx === fileInputIndex
          ? {
              ...pic,
              file,
              previewUrl: url,
            }
          : pic
      )
    );
  };

  const handlePictureFieldChange = (index, field, value) => {
    setPictures((prev) =>
      prev.map((pic, idx) => {
        if (idx !== index) return pic;

        if (field === "pictureStatus") {
          const newStatus = value;
          return {
            ...pic,
            pictureStatus: newStatus,
            notes: newStatus === "REJECTED" ? pic.notes || "" : "",
          };
        }

        return {
          ...pic,
          [field]: value,
        };
      })
    );
  };

  const handlePictureDoubleClick = (pic) => {
    if (!pic.previewUrl && !pic.link) return;
    setPreviewPicture(pic);
  };

  const handleClosePreview = () => {
    setPreviewPicture(null);
  };

  const handleAddPicture = () => {
    setPictures((prev) => [
      ...prev,
      {
        id: null,
        name: "",
        link: "",
        priority: prev.length + 1,
        notes: "",
        pictureStatus: "UNDER_REVIEW",
        previewUrl: "",
        file: null,
      },
    ]);
  };

  const titleText = id === "new" ? "Create new Good" : "Edit Good";

  return (
    <div className="page-container">
      <div className="form-header-with-picture">
        <div className="header-picture-square">
          {good.mainPictureLink ? (
            <img
              src={buildImageUrl(good.mainPictureLink)}
              className="header-picture-img"
              alt="Preview"
            />
          ) : (
            <div className="header-picture-placeholder">No image</div>
          )}
        </div>

        <div className="header-text-block">
          <h2 className="form-title">{titleText}</h2>
          <Link to="/goodlist-checker" className="back-link">
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
                      placeholder="https://... or /uploads/..."
                    />
                  </label>
                </div>
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
              <div className="pictures-header">
                <h3>Pictures</h3>
                <button
                  type="button"
                  className="add-picture-btn"
                  onClick={handleAddPicture}
                >
                  + Add picture
                </button>
              </div>

              <div className="pictures-grid">
                {pictures.length === 0 && (
                  <p className="muted">
                    No pictures yet. Click “Add picture” to create a slot.
                  </p>
                )}

                {pictures.map((pic, index) => (
                  <div className="picture-card" key={pic.id || index}>
                    <div
                      className="picture-square"
                      onClick={() => handlePictureClick(index)}
                      onDoubleClick={() => handlePictureDoubleClick(pic)}
                    >
                      {pic.previewUrl || pic.link ? (
                        <img
                          src={buildImageUrl(pic.previewUrl || pic.link)}
                          className="picture-img"
                          alt={pic.name || `Picture ${index + 1}`}
                        />
                      ) : (
                        <span className="picture-placeholder">
                          Click to select
                        </span>
                      )}
                    </div>

                    <div className="picture-info">
                      <div className="row">
                        <label>
                          Priority
                          <input
                            type="number"
                            value={pic.priority ?? ""}
                            onChange={(e) =>
                              handlePictureFieldChange(
                                index,
                                "priority",
                                Number(e.target.value)
                              )
                            }
                          />
                        </label>

                        <label>
                          Name
                          <input
                            type="text"
                            value={pic.name ?? ""}
                            onChange={(e) =>
                              handlePictureFieldChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                          />
                        </label>
                      </div>

                      <div className="row">
                        <label>
                          Status
                          <select
                            value={pic.pictureStatus ?? ""}
                            onChange={(e) =>
                              handlePictureFieldChange(
                                index,
                                "pictureStatus",
                                e.target.value
                              )
                            }
                          >
                            <option value="UNDER_REVIEW">Under review</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="FINAL">Final</option>
                          </select>
                        </label>

                        {pic.pictureStatus === "REJECTED" && (
                          <label className="notes-label">
                            Notes
                            <textarea
                              className="notes-textarea"
                              value={pic.notes ?? ""}
                              onChange={(e) =>
                                handlePictureFieldChange(
                                  index,
                                  "notes",
                                  e.target.value
                                )
                              }
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          )}

          <div className="actions">
            <button type="submit" className="save-btn">
              Save
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/goodlist-checker")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {previewPicture && (
        <div className="picture-modal-backdrop" onClick={handleClosePreview}>
          <div className="picture-modal" onClick={(e) => e.stopPropagation()}>
            <img
              src={buildImageUrl(
                previewPicture.previewUrl || previewPicture.link
              )}
              alt={previewPicture.name || "Preview"}
              className="picture-modal-img"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default GoodForm;
