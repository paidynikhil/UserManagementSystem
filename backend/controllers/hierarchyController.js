import { getHierarchyTreeService } from "../services/hierarchyService.js";

export const getHierarchyTree = async (req, res) => {
  try {
    const data = await getHierarchyTreeService(req.user);
    res.status(200).json({success:true, message:"Hierarchy Fetched", data: data});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
