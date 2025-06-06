const BASE_URL = "API";

// Ortak fetch fonksiyonu
const request = async (url, method = "GET", data = null) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "API hatası");
  }

  return await response.json();
};

const nocodeApiServiceUsers = {
  getAll: () => request(BASE_URL),
  add: (row) => request(BASE_URL, "POST", [row]),
  update: (updatedRow) =>
    request(`${BASE_URL}`, "PUT", (updatedRow)),
  delete: (rowIndex) => request(`${BASE_URL}&row_id=${rowIndex}`, "DELETE"),
  search: (keyword) =>request(`${BASE_URL}&searchKey=userName&searchValue=${keyword}`),
};

export default nocodeApiServiceUsers;
