import axios from 'axios';

const API_URL = 'http://localhost:3001/groups';

export const getGroups = () => axios.get(API_URL);
export const getGroupById = (id: number) => axios.get(`${API_URL}/${id}`);
export const createGroup = (data: any) => axios.post(API_URL, data);
export const updateGroup = (id: number, data: any) => axios.put(`${API_URL}/${id}`, data);
export const deleteGroup = (id: number) => axios.delete(`${API_URL}/${id}`);
