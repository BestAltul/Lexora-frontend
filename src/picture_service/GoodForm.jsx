import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function GoodForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [good, setGood] = useState({ name: '', pictureType: '' });
  const [types, setTypes] = useState([]);

  useEffect(() => {
    
    fetch('http://localhost:8080/api/picture-types')
      .then(res => res.json())
      .then(data => setTypes(data));

    if (id && id !== 'new') {
      
      fetch(`http://localhost:8080/api/goods/${id}`)
        .then(res => res.json())
        .then(data => setGood({ ...data, pictureType: data.pictureType?.id }));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGood(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const method = id && id !== 'new' ? 'PUT' : 'POST';
    const url = id && id !== 'new' ? `http://localhost:8080/api/goods/${id}` : 'http://localhost:8080/api/goods';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...good, pictureType: { id: good.pictureType } }),
    }).then(() => navigate('/goods'));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input type="text" name="name" value={good.name} onChange={handleChange} />
      </div>
      <div>
        <label>Type:</label>
        <select name="pictureType" value={good.pictureType} onChange={handleChange}>
          <option value="">Select the type</option>
          {types.map(pt => (
            <option key={pt.id} value={pt.id}>{pt.name}</option>
          ))}
        </select>
      </div>
      <button type="submit">Save</button>
    </form>
  );
}

export default GoodForm;
