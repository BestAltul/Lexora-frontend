import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./PictureForm.css";

function PictureForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const goodIdFromQuery = query.get("goodId");
  const typeFromQuery = query.get("type");
  const nameFromQuery = query.get("name");

  const [pictureTypes, setPictureTypes] = useState([]);
  const [pictureStatus, setPictureStatuses] = useState([]);
  const [goodId, setGoodId] = useState("");

  const [picture, setPicture] = useState({
    name: "",
    link: "",
    priority: 0,
    notes: "",
    pictureStatus: "UPLOADED",
    pictureTypeId: "",
  });

  const [picturePreview, setPicturePreview] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/v3/picture/types")
      .then((res) => res.json())
      .then((data) => setPictureTypes(data || []))
      .catch(() => setPictureTypes([]));
  }, []);

  useEffect(() => {
    fetch("http://localhost:8080/api/v3/picture/statuses")
      .then((res) => res.json())
      .then((data) => setPictureStatuses(data || []))
      .catch(() => setPictureStatuses([]));
  }, []);

  useEffect(() => {
    if (id === "new") {
      if (pictureTypes.length === 0) return;
      setPicture({
        ...picture,
        name: nameFromQuery || "",
        pictureTypeId:
          pictureTypes.find((pt) => pt.short_name === typeFromQuery)
            ?.short_name || "",
      });
      setGoodId(goodIdFromQuery || "");
      return;
    }

    fetch(`http://localhost:8080/api/v3/picture/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPicture({
          name: data.name,
          link: data.link,
          priority: data.priority,
          notes: data.notes,
          pictureStatus: data.pictureStatus,
          pictureTypeId: data.pictureType?.short_name || "",
        });
        setGoodId(data.good?.id || "");
        if (data.link) {
          const fullUrl = data.link.startsWith("http")
            ? data.link
            : `http://localhost:8080${data.link}`;
          setPicturePreview(fullUrl);
        }
      });
  }, [id, pictureTypes, nameFromQuery, typeFromQuery, goodIdFromQuery]);

  const handleChange = (e) => {
    setPicture({ ...picture, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPicturePreview(reader.result);
    reader.readAsDataURL(file);

    setPicture({ ...picture, file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = id && id !== "new" ? "PUT" : "POST";

    const url =
      id && id !== "new"
        ? `http://localhost:8080/api/v3/picture/${id}`
        : "http://localhost:8080/api/v3/picture";

    const formData = new FormData();
    formData.append("name", picture.name);
    formData.append("priority", picture.priority);
    formData.append("notes", picture.notes);
    formData.append("pictureStatus", picture.pictureStatus);
    formData.append("pictureTypeId", picture.pictureTypeId);
    formData.append("goodId", goodId);
    formData.append("pictureId", id);

    if (picture.file) {
      formData.append("file", picture.file);
    } else if (picturePreview) {
      formData.append("link", picturePreview);
    }

    // console.log("SUBMIT DATA:", {
    //   name: picture.name,
    //   priority: picture.priority,
    //   notes: picture.notes,
    //   pictureStatus: picture.pictureStatus,
    //   pictureTypeId: picture.pictureTypeId,
    //   goodId: goodId,
    //   file: picture.file,
    // });

    const response = await fetch(url, {
      method,
      body: formData,
      credentials: "include",
    });

    if (response.ok) {
      navigate("/goodlist-checker");
    } else {
      alert("Error saving picture");
    }
  };

  return (
    <div className="picture-page">
      <h2>{id && id !== "new" ? "Edit Picture" : "Add Picture"}</h2>

      <form onSubmit={handleSubmit} className="picture-form-grid">
        <div
          className="picture-preview"
          onDoubleClick={() => fileInputRef.current.click()}
          title="Double click to upload photo"
          style={{ cursor: "pointer" }}
        >
          {picturePreview ? (
            <img src={picturePreview} alt="Preview" />
          ) : (
            <div className="placeholder">Double click to upload</div>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />

        <div className="picture-fields">
          <label>
            Name:
            <input
              type="text"
              name="name"
              disabled
              value={picture.name}
              onChange={handleChange}
            />
          </label>

          <label>
            Picture Type:
            <select
              name="pictureTypeId"
              value={picture.pictureTypeId}
              disabled
              onChange={handleChange}
            >
              <option value="">Select type</option>
              {pictureTypes.map((pt) => (
                <option key={pt.short_name} value={pt.short_name}>
                  {pt.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status:
            <select
              name="pictureStatus"
              value={picture.pictureStatus}
              onChange={handleChange}
            >
              <option value="">Select status</option>
              {pictureStatus.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
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
        </div>
      </form>

      <div className="picture-buttons">
        <button className="btn-primary" onClick={handleSubmit}>
          Save
        </button>
        <button
          className="btn-secondary"
          onClick={() => navigate("/goodlist-checker")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PictureForm;
