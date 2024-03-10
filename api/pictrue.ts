import express from "express";
import { conn, queryAsync } from "../dbconnect";

export const router = express.Router();

router.get("/all", (req, res) => {
  const sql = "SELECT * FROM pictrue ORDER BY RAND() LIMIT 2";
  conn.query(sql, (err, result) => {
    res.json(result);
  });
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const newScore = req.body.pictrue_p; 

  const sql = "UPDATE pictrue SET pictrue_p = ? WHERE pictrue_id = ?";

  conn.query(sql, [newScore, id], (err, result) => {
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(201)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });  });
});
