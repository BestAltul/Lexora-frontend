import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./GoodList.css";

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

function GoodListChecker() {
  const [goods, setGoods] = useState([]);
  const [filters, setFilters] = useState({ title: "", sku: "" });
  const [pictureTypes, setPictureTypes] = useState([]);
  const [selectedPictureTypes, setSelectedPictureTypes] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [previewPicture, setPreviewPicture] = useState(null);
  const clickTimer = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v3/goods`)
      .then((res) => res.json())
      .then((data) => setGoods(data || []))
      .catch(() => setGoods([]));

    fetch(`${API_BASE_URL}/api/v3/picture/types`)
      .then((res) => res.json())
      .then((data) => setPictureTypes(data || []))
      .catch(() => setPictureTypes([]));
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTextFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const toggleType = (short_name) => {
    setSelectedPictureTypes((prev) =>
      prev.includes(short_name)
        ? prev.filter((t) => t !== short_name)
        : [...prev, short_name]
    );
  };

  const filteredGoods = goods.filter((good) => {
    const titleMatch = good.title
      ?.toLowerCase()
      .includes(filters.title.toLowerCase());
    const skuMatch = good.sku
      ?.toLowerCase()
      .includes(filters.sku.toLowerCase());
    return titleMatch && skuMatch;
  });

  return (
    <div className="page-container">
      <div className="table-header-card">
        <h2 className="table-title">List of goods</h2>
        <Link to="/goods/new" className="table-add-btn">
          Add new
        </Link>
      </div>

      <div className="filters">
        <input
          type="text"
          name="title"
          placeholder="Filter by name"
          value={filters.title}
          onChange={handleTextFilterChange}
        />
        <input
          type="text"
          name="sku"
          placeholder="Filter by SKU"
          value={filters.sku}
          onChange={handleTextFilterChange}
        />

        <div className="photo-type-filter">
          <button
            type="button"
            className="filter-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Picture types ▾
          </button>

          {isDropdownOpen && (
            <div className="dropdown" ref={dropdownRef}>
              {pictureTypes.map((pt) => (
                <label key={pt.short_name} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedPictureTypes.includes(pt.short_name)}
                    onChange={() => toggleType(pt.short_name)}
                  />
                  {pt.name}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: "10px", fontSize: "12px", color: "#888" }}>
        Debug pictureTypes: {pictureTypes.map((pt) => pt.name).join(", ")}
      </div>

      <table className="goods-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            {selectedPictureTypes.map((short_name) => {
              const pt = pictureTypes.find((p) => p.short_name === short_name);
              return <th key={short_name}>{pt?.name || short_name}</th>;
            })}
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filteredGoods.map((good) => {
            const picturesArray = good.picture || good.pictures || [];

            return (
              <tr key={good.id}>
                <td onDoubleClick={() => navigate(`/goods/${good.id}`)}>
                  {good.title}
                </td>
                <td onDoubleClick={() => navigate(`/goods/${good.id}`)}>
                  {good.sku}
                </td>

                {selectedPictureTypes.map((short_name) => {
                  const pic = picturesArray.find(
                    (p) =>
                      p.pictureType?.short_name === short_name ||
                      p.short_name === short_name
                  );

                  const hasFile = pic && (pic.thumbnailUrl || pic.link);
                  const imgSrc = hasFile
                    ? buildImageUrl(pic.thumbnailUrl || pic.link)
                    : "";

                  return (
                    <td
                      key={short_name}
                      className={hasFile ? "has-photo" : "missing-photo"}
                    >
                      {hasFile ? (
                        <img
                          src={imgSrc}
                          alt={pic.name || ""}
                          className="preview-img"
                          onClick={(e) => {
                            e.stopPropagation();

                            if (clickTimer.current) {
                              clearTimeout(clickTimer.current);
                              clickTimer.current = null;

                              navigate(`/picture/${pic.id}`);
                              return;
                            }

                            clickTimer.current = setTimeout(() => {
                              setPreviewPicture({
                                ...pic,
                                previewSrc: buildImageUrl(
                                  pic.fullUrl || pic.link || pic.thumbnailUrl
                                ),
                              });

                              clickTimer.current = null;
                            }, 200);
                          }}
                        />
                      ) : (
                        <span
                          className="no-photo"
                          style={{ cursor: "pointer", color: "#007bff" }}
                          onClick={() => {
                            if (pic) {
                              navigate(`/picture/${pic.id}`);
                            } else {
                              navigate(
                                `/picture/new?goodId=${
                                  good.id
                                }&type=${short_name}&name=${encodeURIComponent(
                                  good.title
                                )}`
                              );
                            }
                          }}
                        >
                          {pic ? "Add file" : "Add photo"}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {previewPicture && (
        <div
          className="picture-modal-backdrop"
          onClick={() => setPreviewPicture(null)}
        >
          <div className="picture-modal" onClick={(e) => e.stopPropagation()}>
            <img
              src={buildImageUrl(
                previewPicture.fullUrl ||
                  previewPicture.link ||
                  previewPicture.thumbnailUrl
              )}
              alt={previewPicture.name || ""}
              className="picture-modal-img"
              onClick={() => setPreviewPicture(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default GoodListChecker;
