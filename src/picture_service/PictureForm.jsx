import { useEffect, useState } from 'react';

function PictureForm() {
  const [pictureTypes, setPictureTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/api/picture-types')
      .then(res => res.json())
      .then(data => setPictureTypes(data));
  }, []);

  return (
    <form>
      <label>
        Тип фото:
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
        >
          <option value="">Выберите тип</option>
          {pictureTypes.map(pt => (
            <option key={pt.id} value={pt.id}>
              {pt.name}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}

export default PictureForm;
