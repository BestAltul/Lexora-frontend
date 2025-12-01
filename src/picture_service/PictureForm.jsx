import { useEffect, useState } from 'react';

function PictureForm() {
  const [pictureTypes, setPictureTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const id = window.location.pathname.split('/').pop();

  useEffect(() => {
    fetch(`http://localhost:8080/api/v3/picture/${id}`)
      .then(res => res.json())
      .then(data => setPictureTypes(data));
  }, []);

  return (
    <form>
      <label>
        Type of photo:
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
        >
          <option value="">Select type</option>
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
