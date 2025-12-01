import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./GoodList.css";

function GoodList() {
  const [goods, setGoods] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/api/v3/goods")
      .then((res) => res.json())
      .then((data) => setGoods(data));
  }, []);

  return (
    <div className="page-container">
      <div className="table-header-card">
        <h2 className="table-title">List of goods</h2>
        <Link to="/goods/new" className="table-add-btn">
          Add new
        </Link>
      </div>

      <table className="goods-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>UPC</th>
            <th>Core</th>
            <th>Collection</th>
            <th>Product type</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {goods.map((good) => (
            <tr
              key={good.id}
              onDoubleClick={() => navigate(`/goods/${good.id}`)}
              style={{ cursor: "pointer" }}
            >
              <td>{good.title}</td>
              <td>{good.sku}</td>
              <td>{good.upc}</td>
              <td>{good.isCore ? "Yes" : "No"}</td>
              <td>{good.goodsCollectionRecord}</td>
              <td>{good.productType?.name}</td>

              <td
                onDoubleClick={(e) => e.stopPropagation()}
                className="edit-cell"
              >
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
