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
  const STORAGE_KEY = "goodListCheckerState";

  const [goods, setGoods] = useState([]);
  const [filters, setFilters] = useState({ title: "", sku: "" });
  const [pictureTypes, setPictureTypes] = useState([]);
  const [selectedPictureTypes, setSelectedPictureTypes] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [previewPicture, setPreviewPicture] = useState(null);
  const clickTimer = useRef(null);
  const [expandedPic, setExpandedPic] = useState(null);
  const modalNotesRef = useRef(null);
  const [localNote, setLocalNote] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMSPER_PAGE = 10;

  // Восстановление состояния из localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const { filters, selectedPictureTypes, currentPage } = JSON.parse(savedState);
        if (filters) setFilters(filters);
        if (selectedPictureTypes) setSelectedPictureTypes(selectedPictureTypes);
        if (currentPage !== undefined) setCurrentPage(currentPage);
      } catch (err) {
        console.error("Failed to parse saved state", err);
      }
    }
  }, []);

  // Сохранение состояния в localStorage при изменениях
  useEffect(() => {
    const stateToSave = { filters, selectedPictureTypes, currentPage };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [filters, selectedPictureTypes, currentPage]);

  // Загрузка данных
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

  // Закрытие dropdown при клике вне
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Подгрузка заметки при открытии модалки
  useEffect(() => {
    if (!expandedPic) return;

    const fullGood = goods.find((g) => g.id === expandedPic.goodId);
    if (!fullGood) return;

    const fullPic = (fullGood.picture || fullGood.pictures || []).find(
      (p) => p.id === expandedPic.pictureId
    );
    if (!fullPic) return;

    setLocalNote(fullPic.notes || "");
  }, [expandedPic, goods]);

  useEffect(() => {
    if (expandedPic && modalNotesRef.current) {
      modalNotesRef.current.focus();
    }
  }, [expandedPic]);

  const handleTextFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const toggleType = (short_name) => {
    setSelectedPictureTypes((prev) =>
      prev.includes(short_name)
        ? prev.filter((t) => t !== short_name)
        : [...prev, short_name]
    );
  };

  const filteredGoods = goods.filter((good) => {
    const titleMatch = good.title?.toLowerCase().includes(filters.title.toLowerCase());
    const skuMatch = good.sku?.toLowerCase().includes(filters.sku.toLowerCase());
    return titleMatch && skuMatch;
  });

  const totalPages = Math.ceil(filteredGoods.length / ITEMSPER_PAGE);
  const paginatedGoods = filteredGoods.slice(
    (currentPage - 1) * ITEMSPER_PAGE,
    currentPage * ITEMSPER_PAGE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  const updatePictureFormData = async (pictureId, fields) => {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    formData.append("pictureId", pictureId);

    try {
      await fetch(`${API_BASE_URL}/api/v3/picture/${pictureId}`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to update picture", err);
    }
  };

const updatePictureStatus = (goodId, pictureId, status) => {
  const isCorrect = status === "correct";
  
  setGoods((prevGoods) =>
    prevGoods.map((good) => {
      if (good.id !== goodId) return good;
      const updatedPictures = (good.picture || good.pictures || []).map((pic) => {
        if (pic.id !== pictureId) return pic;
        return { ...pic, correct: isCorrect };
      });
      return { ...good, picture: updatedPictures, pictures: updatedPictures };
    })
  );

  updatePictureFormData(pictureId, { correct: isCorrect });
};


  const updatePictureNote = (goodId, pictureId, note) => {
    setGoods((prevGoods) =>
      prevGoods.map((good) => {
        if (good.id !== goodId) return good;
        const updatedPictures = (good.picture || good.pictures || []).map((pic) => {
          if (pic.id !== pictureId) return pic;
          return { ...pic, notes: note };
        });
        return { ...good, picture: updatedPictures, pictures: updatedPictures };
      })
    );
    updatePictureFormData(pictureId, { notes: note });
  };

  const saveNote = () => {
    if (!expandedPic) return;
    updatePictureNote(expandedPic.goodId, expandedPic.pictureId, localNote);
    setExpandedPic(null);
  };

  return (
    <div className="page-container">
      <div className="table-header-card">
        <h2 className="table-title">Good picture checker</h2>
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
          {paginatedGoods.map((good) => {
            const picturesArray = good.picture || good.pictures || [];

            return (
              <tr key={good.id}>
                <td onDoubleClick={() => navigate(`/goods/${good.id}`)}>{good.title}</td>
                <td onDoubleClick={() => navigate(`/goods/${good.id}`)}>{good.sku}</td>

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
                        <div className="picture-miniature-container">
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
                          <div className="status-radio-group notes">
                            <div className="radio-top">
                              <label>
                                <input
                                  type="radio"
                                  name={`picture-status-${pic.id}`}
                                  value="correct"
                                  checked={pic.correct === true}
                                  onChange={() =>
                                    updatePictureStatus(good.id, pic.id, "correct")
                                  }
                                />
                                correct
                              </label>

                              <label>
                                <input
                                  type="radio"
                                  name={`picture-status-${pic.id}`}
                                  value="wrong"
                                  checked={pic.correct === false}
                                  onChange={() =>
                                    updatePictureStatus(good.id, pic.id, "wrong")
                                  }
                                />
                                wrong
                              </label>
                            </div>

                            {pic.correct === false && (
                              <textarea
                                className="notes-red"
                                placeholder="Add notes..."
                                value={pic.notes || ""}
                                onFocus={() =>
                                  setExpandedPic({ goodId: good.id, pictureId: pic.id })
                                }
                                readOnly
                              />
                            )}
                          </div>
                        </div>
                      ) : (
                        <span
                          className="no-photo"
                          style={{ cursor: "pointer", color: "#007bff" }}
                          onClick={() => {
                            if (pic) {
                              navigate(`/picture/${pic.id}`);
                            } else {
                              navigate(
                                `/picture/new?goodId=${good.id}&type=${short_name}&name=${encodeURIComponent(
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

      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1}>
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={page === currentPage ? "active" : ""}
          >
            {page}
          </button>
        ))}

        <button onClick={nextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

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

      {expandedPic && (
        <div className="modal-backdrop">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setExpandedPic(null)}
            >
              ✕
            </button>
            <img
              src={buildImageUrl(
                expandedPic.fullUrl || expandedPic.link || expandedPic.thumbnailUrl
              )}
              alt={expandedPic.name || ""}
            />
            <div className="modal-notes">
              <textarea
                ref={modalNotesRef}
                value={localNote}
                onChange={(e) => setLocalNote(e.target.value)}
                onBlur={() => saveNote()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    saveNote();
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoodListChecker;
