import makeRequest from '../../utils/make-request';

const BASE_URL = 'https://uwayfly.com/api';

export function getImages(data) {
  return makeRequest({
    url: `${BASE_URL}/images`,
    data: {
      ...data,
      type: 'one',
    }
  })
} 

