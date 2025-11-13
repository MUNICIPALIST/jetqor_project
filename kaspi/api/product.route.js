const router = require("express").Router()
const fs = require("fs/promises")

router.get("/categories", async (req, res) => {
  return await fs.readFile("./categories.json", { encoding: "utf8" })
})

router.post("/export", async (req, res) => {
  try {
    
  }
  catch (error) {
    const message = "[ERROR] -> [POST] -> /product/export/: " + error
    console.log(message)
    return res.json({ message })
  }
})

module.exports = router

