const axios = require('axios').default
const fs = require("fs/promises")

const schedule = [
  "*/30 * * * *",
  async () => {
    const response = await axios({
      method: "POST",
      url: process.env.JETQOR_SYSTEM_HOST + "/auth/login",
      data: {
        email: process.env.JETQOR_SYSTEM_AUTH.split(":")[0],
        password: process.env.JETQOR_SYSTEM_AUTH.split(":")[1]
      }
    })

    await fs.writeFile("token.json", response.data.token)
  }
]

module.exports = schedule

