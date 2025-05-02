import api from "./axios";

export const getAllSkills = () => api.get("/user/skills/");
