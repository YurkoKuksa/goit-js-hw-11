import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/';

export const getPhotos = async (q, page, perPage) => {
  const params = {
    q,
    page,
    per_page: perPage,
    key: '41243190-013300446e5136f16c0416e3e',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  };

  const { data } = await axios.get('', { params });
  return data;
};
