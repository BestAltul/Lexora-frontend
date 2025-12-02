import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function PictureForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pictureTypes, setPictureTypes] = useState([]);
  const [goodId, setGoodId] = useState("");

  const [picture, setPicture] = useState({
    name: "",
    link: "",
    priority: 0,
    notes: "",
    pictureStatus: "UNDER_REVIEW",
    pictureTypeId: "",
  });

  useEffect(() => {
    fetch("http://localhost:8080/api/v3/picture-type")
      .then((res) => res.json())
      .then((data) => setPictureTypes(data));
  }, []);

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:8080/api/v3/picture/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPicture({
          name: data.name,
          link: data.link,
          priority: data.priority,
          notes: data.notes,
          pictureStatus: data.pictureStatus,
          pictureTypeId: data.pictureType?.id || "",
        });
        setGoodId(data.good?.id || "");
      });
  }, [id]);

  const handleChange = (e) => {
    setPicture({ ...picture, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = id ? "PUT" : "POST";

    const response = await fetch("http://localhost:8080/api/v3/picture", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...picture,
        goodId,
      }),
    });

    if (response.ok) {
      navigate("/pictures");
    } else {
      alert("Error saving picture");
    }
  };

  return (
    <div className="page-container">
      <h2>{id ? "Edit Picture" : "Add Picture"}</h2>

      <form onSubmit={handleSubmit} className="picture-form">
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={picture.name}
            onChange={handleChange}
          />
        </label>

        <label>
          Link:
          <input
            type="text"
            name="link"
            value={picture.link}
            onChange={handleChange}
          />
        </label>

        <label>
          Priority:
          <input
            type="number"
            name="priority"
            value={picture.priority}
            onChange={handleChange}
          />
        </label>

        <label>
          Notes:
          <textarea
            name="notes"
            rows="4"
            value={picture.notes}
            onChange={handleChange}
          />
        </label>

        <label>
          Status:
          <select
            name="pictureStatus"
            value={picture.pictureStatus}
            onChange={handleChange}
          >
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="PROVED">PROVED</option>
            <option value="FINAL">FINAL</option>
          </select>
        </label>

        <label>
          Picture Type:
          <select
            name="pictureTypeId"
            value={picture.pictureTypeId}
            onChange={handleChange}
          >
            <option value="">Select type</option>
            {pictureTypes.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.name}
              </option>
            ))}
          </select>
        </label>

        <button type="submit">{id ? "Save Changes" : "Create Picture"}</button>
      </form>
    </div>
  );
}

export default PictureForm;
