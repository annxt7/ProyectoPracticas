const express= require('express');
require('dotenv').config();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const router = express.Router();
import { verifyToken } from '../middlewares/authMiddleware';

//Configuracion

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mis-colecciones', 
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

//POST:
router.post('/upload',verifyToken,upload.single('imagen'),(req,res)=>{
try{
res.json({
    success:true,
    url:req.file.path
});
}catch(error){
res.status(500).json({success:false, error: error.message});
}
});

module.exports=router