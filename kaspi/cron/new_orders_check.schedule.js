const axios = require("axios").default
const { readFile } = require("fs")
const fs = require("fs/promises")

const schedule = [
  "*/1 * * * *",
  async () => {
    try {
    const now = Date.now()
    const thirtyMinutesAgo = now - 30 * 60 * 1000
    const request_config = {
      method: "get",
      url: process.env.KASPI_HOST + "/v2/orders",
      headers: {
        "Content-Type": "application/vnd.api+json",
        "X-Auth-Token": process.env.KASPI_API_KEY,
      },
      params: {
        "page[number]": 0,
        "page[size]": 100,
        "filter[orders][creationDate][$ge]": 1739719580000,// thirtyMinutesAgo,
        "filter[orders][creationDate][$le]": 1739749580000,// now,
        "filter[orders][state]": "ARCHIVE",
      }
    }

    const response = await axios(request_config)
    if (Number(response.data.meta.totalCount) === 0) return
    
    const token = await fs.readFile("./token.json")

    for await (const order of response.data.data) {
      const products = { create: [] }
      const entries_config = {
        method: "get",
        url: order.relationships.entries.links.related,
        headers: request_config.headers
      }
  
      const entries = (await axios(entries_config)).data.data

      for await (const entry of entries) {
        const productId = (await axios({
            method: "get",
            url: process.env.JETQOR_SYSTEM_HOST + "/product/article/" + entry.attributes.offer.code.split('_')[0],
            headers: {
              "authorization": "Bearer " + token
            }
        })).data.id
        products.create.push({
          product: { connect: { id: productId } },
          count: entry.attributes.quantity,
        })
      }

      const create_order_data = {
        kaspi_code: order.attributes.code,
        marketplace_created_at: new Date(order.attributes.creationDate),
        total_price: order.attributes.totalPrice,
        delivery_cost: order.attributes.deliveryCost,
        kaspi_status: order.attributes.status,
        customer_phone: order.attributes.customer.cellPhone,
        customer_name: `${order.attributes.customer.firstName} ${order.attributes.customer.lastName}`,
        products
      }

      const response = await axios({
        method: "POST",
        url: process.env.JETQOR_SYSTEM_HOST + "/order/create",
        headers: { authorization: "Bearer " + token },
        data: create_order_data
      })

      console.log(response.data)

      }
    }
    catch (error) {
      if (error.response.data) console.log(error.response.data)
      else console.log(error)
    }
  }
]

module.exports = schedule

