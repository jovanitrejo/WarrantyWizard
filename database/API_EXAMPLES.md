# WarrantyWizard API Test Examples

## Base URL
```
http://localhost:5000
```

## 1. Health Check

### Request
```bash
curl http://localhost:5000/health
```

### Expected Response
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-02-06T12:00:00.000Z"
}
```

---

## 2. Get All Warranties

### Request
```bash
curl http://localhost:5000/api/warranties
```

### With Filters
```bash
# Filter by status
curl "http://localhost:5000/api/warranties?status=active"

# Filter by category
curl "http://localhost:5000/api/warranties?category=HVAC"

# Search by name or serial
curl "http://localhost:5000/api/warranties?search=forklift"
```

---

## 3. Create Warranty

### Request
```bash
curl -X POST http://localhost:5000/api/warranties \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Industrial Chiller",
    "category": "HVAC",
    "serial_number": "CH-2024-001",
    "purchase_date": "2024-01-15",
    "warranty_start": "2024-01-15",
    "warranty_end": "2027-01-15",
    "warranty_length_months": 36,
    "purchase_cost": 35000,
    "supplier": "Grainger",
    "location": "Building A",
    "department": "Facilities"
  }'
```

### Expected Response
```json
{
  "success": true,
  "message": "Warranty created successfully",
  "data": {
    "id": 21,
    "product_name": "Industrial Chiller",
    "category": "HVAC",
    ...
  }
}
```

---

## 4. Get Single Warranty

### Request
```bash
curl http://localhost:5000/api/warranties/1
```

---

## 5. Update Warranty

### Request
```bash
curl -X PUT http://localhost:5000/api/warranties/1 \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Scheduled maintenance completed on 2024-02-01"
  }'
```

---

## 6. Get Analytics

### Request
```bash
curl http://localhost:5000/api/warranties/analytics
```

### Expected Response
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_warranties": "20",
      "active_count": "15",
      "expired_count": "2",
      "expiring_soon_count": "3",
      "total_value": "450000.00",
      "claims_filed": "1"
    },
    "byCategory": [
      {
        "category": "HVAC",
        "count": "6",
        "total_value": "120000.00"
      },
      ...
    ],
    "monthlyExpiring": [...]
  }
}
```

---

## 7. Get Expiring Soon

### Request
```bash
# Default 30 days
curl http://localhost:5000/api/warranties/expiring/soon

# Custom days
curl "http://localhost:5000/api/warranties/expiring/soon?days=60"
```

---

## 8. File a Claim

### Request
```bash
curl -X POST http://localhost:5000/api/warranties/3/claim \
  -H "Content-Type: application/json" \
  -d '{
    "claim_amount": 2500,
    "claim_description": "Compressor motor failure. Replaced under warranty."
  }'
```

---

## 9. AI Chat

### Request
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Which equipment warranties expire in the next 30 days?",
    "session_id": "demo-session-123"
  }'
```

### Expected Response
```json
{
  "success": true,
  "data": {
    "reply": "Based on the current database, you have 3 warranties expiring in the next 30 days:\n\n1. Carrier 50TC 10-Ton HVAC Unit - Expires on March 10, 2026\n2. ...",
    "session_id": "demo-session-123"
  }
}
```

### More Chat Examples
```bash
# Ask about total value
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the total value of all active warranties?"
  }'

# Ask about specific equipment
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me about the forklift warranties"
  }'

# Ask for recommendations
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Which warranties should I prioritize reviewing this month?"
  }'
```

---

## 10. Generate AI Insights

### Request
```bash
curl -X POST http://localhost:5000/api/warranties/2/insights
```

### Expected Response
```json
{
  "success": true,
  "data": {
    "risk_score": 80,
    "insight": "Warranty expires in 15 days. High-risk period for missing valuable coverage.",
    "recommendation": "Schedule preventive maintenance immediately to catch any issues before warranty expires."
  }
}
```

---

## 11. Extract Invoice Data

### Request
```bash
curl -X POST http://localhost:5000/api/ai/extract-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_text": "INVOICE #12345\nDate: 2024-01-15\nProduct: Toyota Forklift Model 8FGU25\nSerial: FKL-2024-555\nWarranty: 36 months\nTotal: $28,000.00"
  }'
```

### Expected Response
```json
{
  "success": true,
  "data": {
    "product_name": "Toyota Forklift Model 8FGU25",
    "serial_number": "FKL-2024-555",
    "purchase_date": "2024-01-15",
    "warranty_length_months": 36,
    "purchase_cost": 28000,
    "supplier": null
  }
}
```

---

## 12. Upload Invoice File (with form-data)

### Request
```bash
curl -X POST http://localhost:5000/api/upload/invoice \
  -F "invoice=@/path/to/invoice.pdf"
```

### Or create warranty directly from invoice
```bash
curl -X POST http://localhost:5000/api/upload/invoice/create \
  -F "invoice=@/path/to/invoice.pdf"
```

---

## Testing with Postman

1. Import these examples into Postman
2. Create a collection "WarrantyWizard API"
3. Set base URL as environment variable
4. Test all endpoints

## Testing with JavaScript/Fetch

```javascript
// Example: Get all warranties
const response = await fetch('http://localhost:5000/api/warranties');
const data = await response.json();
console.log(data);

// Example: Chat with AI
const chatResponse = await fetch('http://localhost:5000/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Which warranties expire this month?',
    session_id: 'my-session-id'
  })
});
const chatData = await chatResponse.json();
console.log(chatData.data.reply);
```

---

## Common Response Codes

- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (missing/invalid data)
- `404` - Not Found
- `500` - Server Error

## Error Response Format

```json
{
  "success": false,
  "message": "Error description here",
  "error": "Detailed error message"
}
```
