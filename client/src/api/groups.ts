import axios from "axios";

const API_URL = "http://localhost:3001";

export const getGroups = async () => {
  const res = await axios.get(`${API_URL}/groups`);
  return res.data;
};

export const getGroupById = async (id: string) => {
  const res = await axios.get(`${API_URL}/groups/${id}`);
  return res.data;
};
