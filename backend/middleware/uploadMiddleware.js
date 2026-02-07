import multer from 'multer'
import path from 'path'
import fs from 'fs'

const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
    }
}

const storage = (folderName) => multer.diskStorage({
    destination(req, file, cb) {
        const uploadPath = `uploads/${folderName}`
        ensureDir(uploadPath)
        cb(null, uploadPath)
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
    }
})

const checkFileType = (file, cb) => {
    const filetypes = /jpg|jpeg|png|webp/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)

    if (extname && mimetype) {
        return cb(null, true)
    } else {
        cb(new Error('Images only! (jpg, jpeg, png, webp)'))
    }
}

export const uploadProduct = multer({
    storage: storage('products'),
    fileFilter: function (req, file, cb) { checkFileType(file, cb) },
    limits: { fileSize: 2000000 } 
})

export const uploadUser = multer({
    storage: storage('users'),
    fileFilter: function (req, file, cb) { checkFileType(file, cb) },
    limits: { fileSize: 2000000 } 
})