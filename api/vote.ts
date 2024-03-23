import express from "express";
import { conn, queryAsync } from "../dbconnect";
import mysql from "mysql";
import { VotePostResponse } from "../mode/VotepostResponse";


export const router = express.Router();

router.put("/:time", async (req, res) => {
    const time = req.params.time;
    const id = 1;
    const sql = "UPDATE systemtime SET time = ? where t_id= ?";
  
    conn.query(sql, [time,id], (err, result) => {
      if (err) {
        console.error("Error executing SQL:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
  
      res.status(200).json({
        message: "Successfully updated all records",
        affected_rows: result.affectedRows,
      });
    });
});

router.get("/votes", (req,res)=>{
    const sql = "select * from vote";
    conn.query(sql,(err,result)=>{
        res.json(result);
    })
}
);
router.post("/vote", (req, res) => {
    let vote: VotePostResponse = req.body;
    let sql =
          "INSERT INTO `vote`(`pt_id`,`vote_point`,`vote_timestamp`,`u_id`) VALUES (?,?,?,?)";
    sql = mysql.format(sql, [
        vote.pt_id,
        vote.vote_point,
        vote.vote_timestamp,
        vote.u_id
        ]);
    console.log(vote.vote_timestamp);
    
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(201)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
  });
