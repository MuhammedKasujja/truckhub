
## Create/ Update Route Pricing Schema api request example
```json
{
  "valid_from": "2026-05-23",
  "client_id": null,
  "routes": [
    {
      "route_id": "1",
      "ranges": [
        {
          "min_tons": 1,
          "max_tons": 4,
          "price": "6700"
        },
        {
          "min_tons": 5,
          "max_tons": 9,
          "price": "34000"
        }
      ]
    },
    {
      "route_id": "2",
      "ranges": [
        {
          "min_tons": 1,
          "max_tons": 4,
          "price": "5600"
        },
        {
          "min_tons": 5,
          "max_tons": 9,
          "price": "4000"
        }
      ]
    }
  ]
}
```