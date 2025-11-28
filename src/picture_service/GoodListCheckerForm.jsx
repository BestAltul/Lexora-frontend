import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import "./GoodList.css";

function GoodList() {
  const [goods, setGoods] = useState([]);
  const [filters, setFilters] = useState({ title: "", sku: "" });

  const [pictureTypes, setPictureTypes] = useState([]);  

  const [selectedPictureTypes, setSelectedPictureTypes] = useState([]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/v3/goods")
      .then((res) => res.json())
      .then((data) => setGoods(data));

    fetch("http://localhost:8080/api/picture-types")
      .then((res) => res.json())
      .then((data) => setPictureTypes(data));
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

  const toggleType = (id) => {
    setSelectedPictureTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const filteredGoods = goods.filter((good) => {
    const titleMatch = good.title
      .toLowerCase()
      .includes(filters.title.toLowerCase());
    const skuMatch = good.sku
      .toLowerCase()
      .includes(filters.sku.toLowerCase());
    return titleMatch && skuMatch;
  });

  return (
    <div className="page-container">
      <div className="table-header-card">
        <h2 className="table-title">List of goods</h2>
        <Link to="/goods/new" className="table-add-btn">Add new</Link>
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
            className="filter-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Picture types ▾
          </button>

          {isDropdownOpen && (
            <div className="dropdown" ref={dropdownRef}>
              {pictureTypes.map((pt) => (
                <label key={pt.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedPictureTypes.includes(pt.id)}
                    onChange={() => toggleType(pt.id)}
                  />
                  {pt.name}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <table className="goods-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>

            {selectedPictureTypes.map((ptId) => {
              const pt = pictureTypes.find((p) => p.id === ptId);
              return <th key={ptId}>{pt?.name}</th>;
            })}

            <th></th>
          </tr>
        </thead>

        <tbody>
          {filteredGoods.map((good) => (
            <tr key={good.id}>
              <td>{good.title}</td>
              <td>{good.sku}</td>

              {selectedPictureTypes.map((ptId) => {
                const pic = good.pictures?.find((p) => p.typeId === ptId);
                return (
                  <td key={ptId}>
                    {pic && (
                      <img
                        src={pic.thumbnailUrl}
                        alt=""
                        className="preview-img"
                        onClick={() => window.open(pic.fullUrl, "_blank")}
                      />
                    )}
                  </td>
                );
              })}

              <td>
                <Link to={`/goods/${good.id}`}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GoodList;
