import express from "express";
import { conn, queryAsync } from "../dbconnect";
import { PictruepostResponse } from "../mode/PictruepostResponse";
import mysql from "mysql";
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
    if (err) {
      console.error("Error executing SQL:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    res.status(200).json({
      message: "Successfully updated record",
      affected_row: result.affectedRows
    });
  });
});


router.get("/statistics/:pictrue_id", async (req, res) => {
  try {
    const pictrueId = req.params.pictrue_id;
    
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const sql = `
      SELECT COUNT(*) as count, DATE(vote_timestamp) as date, SUM(vote_point) as total_score
      FROM vote
      WHERE pt_id = ? AND vote_timestamp BETWEEN ? AND ?
      GROUP BY DATE(vote_timestamp)
    `;

    conn.query(sql, [pictrueId, startDate, endDate], (err, results) => {
      if (err) {
        console.error("Error executing SQL:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }

      const statistics = results.map((row: any) => ({
        date: row.date,
        count: row.count,
        total_score: row.total_score 
      }));  

      res.status(200).json(statistics);
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});





router.post("/add", (req, res) => {
  let pictrue: PictruepostResponse = req.body;
  let sql =
        "INSERT INTO `pictrue`(`pictrue_url`,`pictrue_p`,`u_id`) VALUES (?,?,?)";
  sql = mysql.format(sql, [
    pictrue.pictrue_url,
    pictrue.pictrue_p,
    pictrue.u_id
      ]);
  conn.query(sql, (err, result) => {
    if (err) throw err;
    res
      .status(201)
      .json({ affected_row: result.affectedRows, last_idx: result.insertId });
  });
});

router.delete("/delete/:id", (req, res) => {
  let id = +req.params.id;
  conn.query("delete from pictrue where pictrue_id = ?", [id], (err, result) => {
     if (err) throw err;
     res
       .status(200)
       .json({ affected_row: result.affectedRows });
  });
});