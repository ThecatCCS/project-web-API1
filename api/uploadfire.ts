import express from "express";
import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import multer from "multer";
import { firebaseConfig } from "../config/firebase.config";
import mysql from "mysql";
import { conn } from "../dbconnect";

export const router = express.Router();

initializeApp(firebaseConfig);

const storage = getStorage();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/:id", upload.single("filename"), async (req, res) => {
    
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded!');
          }
        const dateTime = giveCurrentDateTime();

        const storageRef = ref(storage, `files/${req.file.originalname + "       " + dateTime}`);

        // Create file metadata including the content type
        const metadata = {
            contentType: req.file.mimetype,
        };

        // Upload the file in the bucket storage
        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);
        const pictrueId = req.params.id;
        let sql = `INSERT INTO pictrue (pictrue_url, pictrue_p, u_id) VALUES (?, ?, ?)`;
        sql = mysql.format(sql, [downloadURL,1000,pictrueId]);
        conn.query(sql, (err, result) => {
            if (err) throw err;
            res
              .status(201)
              .json({ affected_row: result.affectedRows, last_idx: result.insertId });
          });
        
        console.log('File successfully uploaded.');
    } catch (error) {
        return res.status(400).send(error)
    }
});

const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
}

export default router;