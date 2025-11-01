import multer from "multer";
const storage = multer.diskStorage({
  destination: "uploads/images/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
export default multer({ storage });
