import axios from 'axios';
import { stringify } from 'qs';
import { message } from 'antd';

function makeRequest({
  url,
  method = 'GET',
  data = {},
  headers = {},
}) {
  const options = {
    method,
    data,
    url,
    headers: {
      ...headers,
      // Authorization,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  if (method === "POST" || method === "PUT") {
    options.data = stringify(data);
  } else {
    options.params = data;
  }

  return new Promise((resolve, reject) => {
    axios({
      ...options,
    }).then( resp => {
      resolve({
        data: resp.data
      })
    }).catch(e => {
      if (e.msg) {
        message.error(e.msg);
      }
    })
  })
}

export default makeRequest;

