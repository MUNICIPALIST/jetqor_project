const cors = require("cors")
const express = require("express")
require("dotenv").config()

const app = express()

app.use(express.json())
app.use(cors())

app.use("/product", require("./api/product.route.js"))

require("./cron/index.schedule")

app.listen(process.env.PORT, () => {
  console.log("JetQor_kaspi_service server has started on port " + process.env.PORT)
})

