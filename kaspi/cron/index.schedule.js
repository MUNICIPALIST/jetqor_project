const cron = require("node-cron")

cron.schedule(...require("./new_orders_check.schedule"))
cron.schedule(...require("./refresh_token_jetqore_system.schedule"))
