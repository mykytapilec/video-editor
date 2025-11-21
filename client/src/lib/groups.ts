import axios from "axios";

export const getGroups = async () => {
  const res = await axios.get("/api/groups");
  return res.data;
};

export const getGroupById = async (id: string) => {
  const res = await axios.get(`/api/groups/${id}`);
  return res.data;
};

export const getGroupVideos = async (id: string) => {
  const res = await axios.get(`/api/groups/${id}/videos`);
  return res.data;
};
