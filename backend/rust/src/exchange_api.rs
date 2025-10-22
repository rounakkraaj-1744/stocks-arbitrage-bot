// use reqwest::Client;
// use serde_json::Value;

// #[allow(dead_code)]
// pub async fn fetch_binance_price(client: &Client) -> Result<f64, Box<dyn std::error::Error + Send + Sync>> {
//     let url = "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT";
//     let resp = client.get(url).send().await?.text().await?;
//     let parsed: Value = serde_json::from_str(&resp)?;
//     let price_str = parsed["price"].as_str().ok_or("Binance price missing")?;
//     let price = price_str.parse::<f64>()?;
//     Ok(price)
// }

// #[allow(dead_code)]
// pub async fn fetch_coinbase_price(client: &Client) -> Result<f64, Box<dyn std::error::Error + Send + Sync>> {
//     let url = "https://api.coinbase.com/v2/prices/BTC-USD/spot";
//     let resp = client.get(url).send().await?.text().await?;
//     let parsed: Value = serde_json::from_str(&resp)?;
//     let price_str = parsed["data"]["amount"].as_str().ok_or("Coinbase price missing")?;
//     let price = price_str.parse::<f64>()?;
//     Ok(price)
// }